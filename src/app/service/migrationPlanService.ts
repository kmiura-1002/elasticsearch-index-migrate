import type {
    AppliedMigration,
    MigrationConfig,
    MigrationData,
    RequiredMigrationData,
    MigrationType,
    MigrationExecuteConfig
} from '../types';
import { loadMigrationScriptFile } from '../context/util/io/fileService';
import { migrationHistoryRepository } from '../context/migration/history/migrationHistoryRepository';
import { migrateHistorySpecByIndexName } from '../context/migration/history/spec';
import { compare, lt, valid } from 'semver';
import { MigrationStates, MigrationTypes, Version } from '../types';
import { ResponseError as ResponseError6 } from 'es6/lib/errors';
import { ResponseError as ResponseError7 } from 'es7/lib/errors';
import { getBaselineVersion } from './migrationConfigService';
import { MigrationExecuteStatementDataEntity } from '../context/migration/execute_statements/migrationExecuteStatementDataEntity';
import { UnsupportedVersionError } from '../context/error/UnsupportedVersionError';
import { UnknownMigrationTargetError } from '../context/error/UnknownMigrationTargetError';
import { IndexNotFoundError } from '../context/error/IndexNotFoundError';

export const migrationPlanService = (
    targetName: string,
    executeConfig: MigrationExecuteConfig,
    config: Required<MigrationConfig>
) => {
    const validateInputData = (migrationData: MigrationData[]) => {
        if (migrationData.length === 0) {
            // TODO fix error class
            throw new UnknownMigrationTargetError(
                `There is no migration target for ${targetName} in ${config.migration.location}.`
            );
        }
        if (migrationData.map((value) => value.version).includes(undefined)) {
            // TODO fix error class
            throw new UnsupportedVersionError(
                'There is a migration file of unknown version.\n' +
                    `Unknown version files: ${migrationData
                        .filter((value) => value.version === undefined)
                        .map((value) => value.physicalLocation.name)
                        .join(', ')}`
            );
        }
    };
    const isSupportVersionFormat = (version: string): version is Version =>
        version.match(/^(v\d+.\d+.\d+)/) !== null;

    const refresh = async (): Promise<{
        all: MigrationExecuteStatementDataEntity[];
        pending: MigrationExecuteStatementDataEntity[];
    }> => {
        const migrationData = loadMigrationScriptFile(targetName, [config.migration.location]);
        const baseline = getBaselineVersion(targetName, config);
        validateInputData(migrationData);
        try {
            const { findBy } = migrationHistoryRepository(config.elasticsearch);
            const histories = await findBy(
                migrateHistorySpecByIndexName(targetName, baseline, { size: 10000 })
            );
            const appliedMigrationVersions = histories
                .map((value) => value.migrateVersion)
                .filter((value) => valid(value) && isSupportVersionFormat(value))
                .map((value) => value as Version)
                .sort((a, b) => compare(a, b));
            const resolvedMigrationVersions = migrationData
                .map((value) => value.version)
                .filter(isString)
                .filter((value) => value && valid(value) && isSupportVersionFormat(value))
                .map((value) => value as Version)
                .sort((a, b) => compare(a, b));
            const lastResolved = resolvedMigrationVersions[resolvedMigrationVersions.length - 1];
            const lastApplied = appliedMigrationVersions[appliedMigrationVersions.length - 1];
            const migrationPlanMap = new Map<Version, MigrationExecuteStatementDataEntity>();

            migrationData.filter(isRequiredMigrationData).forEach((value) => {
                const migrationPlan = migrationPlanMap.get(value.version);
                if (migrationPlan) {
                    // Overwrites the same version of the migration file, if any
                    migrationPlanMap.set(
                        value.version,
                        MigrationExecuteStatementDataEntity.generateExecuteStatement(
                            baseline,
                            lastResolved,
                            lastApplied,
                            value,
                            migrationPlan.appliedMigration
                        )
                    );
                    migrationPlan.updateResolvedMigration(value);
                } else {
                    migrationPlanMap.set(
                        value.version,
                        MigrationExecuteStatementDataEntity.generateExecuteStatement(
                            baseline,
                            lastResolved,
                            lastApplied,
                            value
                        )
                    );
                }
            });
            histories.forEach((value) => {
                const migrationPlan = migrationPlanMap.get(value.migrateVersion);
                const appliedMigration = {
                    version: value.migrateVersion,
                    description: value.description,
                    type: MigrationTypes[value.scriptType as MigrationType],
                    script: value.scriptName,
                    installedOn: new Date(value.installedOn),
                    executionTime: value.executionTime,
                    success: value.isSuccess,
                    checksum: value.checksum ?? ''
                };
                if (migrationPlan) {
                    migrationPlanMap.set(
                        value.migrateVersion,
                        MigrationExecuteStatementDataEntity.generateExecuteStatement(
                            baseline,
                            lastResolved,
                            lastApplied,
                            migrationPlan.resolvedMigration,
                            appliedMigration
                        )
                    );
                } else {
                    migrationPlanMap.set(
                        value.migrateVersion,
                        MigrationExecuteStatementDataEntity.generateExecuteStatement(
                            baseline,
                            lastResolved,
                            lastApplied,
                            undefined,
                            appliedMigration
                        )
                    );
                }
            });

            return makeMigrationExplainPlan(migrationPlanMap);
        } catch (e) {
            if (e instanceof ResponseError6 || e instanceof ResponseError7) {
                if (e.message === 'index_not_found_exception') {
                    throw new IndexNotFoundError(
                        'History index not found.\n' +
                            'Please check if migrate_history exists in Elasticsearch.',
                        e
                    );
                }
            }
            throw e;
        }
    };

    const validate = async (plan?: {
        all: MigrationExecuteStatementDataEntity[];
        pending: MigrationExecuteStatementDataEntity[];
    }) => {
        const explainPlans = plan?.all ?? (await refresh()).all;

        return explainPlans
            .map((plan) => planValidate(plan, executeConfig))
            .filter(Boolean)
            .join('\n');
    };

    return {
        refresh,
        validate
    };
};

const isString = (v: string | undefined): v is string => v !== undefined;

const isRequiredMigrationData = (v: MigrationData): v is RequiredMigrationData =>
    v.version !== undefined;

const makeMigrationExplainPlan = (map: Map<Version, MigrationExecuteStatementDataEntity>) => {
    const sortedKeys = Array.from(map.keys())
        .filter((value) => valid(value))
        .sort((a, b) => compare(a, b));

    const migrationPlans: MigrationExecuteStatementDataEntity[] = [];
    sortedKeys.forEach((version) => {
        const migrationPlan = map.get(version);
        if (migrationPlan?.resolvedMigration && migrationPlan?.appliedMigration === undefined) {
            migrationPlans.push(
                MigrationExecuteStatementDataEntity.generateExecuteStatement(
                    migrationPlan.baseline,
                    migrationPlan.lastResolved,
                    migrationPlan.lastApplied,
                    migrationPlan.resolvedMigration,
                    migrationPlan.appliedMigration
                )
            );
        } else if (migrationPlan) {
            migrationPlans.push(migrationPlan);
        }
    });

    return {
        all: migrationPlans,
        pending: migrationPlans.filter((value) => value.state?.status === MigrationStates.PENDING)
    };
};

const generateVersion = (
    resolvedMigration?: RequiredMigrationData,
    appliedMigration?: AppliedMigration
): Version | undefined => appliedMigration?.version ?? resolvedMigration?.version;

const planValidate = (
    plan: MigrationExecuteStatementDataEntity,
    executeConfig: MigrationExecuteConfig
) => {
    if (plan.state?.failed && !executeConfig.future) {
        if (plan.version) {
            return `Detected failed migrate to version ${plan.version}(${plan.description}).`;
        } else {
            return `Detected failed migrate to unknown version(${plan.description}).`;
        }
    }

    if (
        (!executeConfig.pending && 'PENDING' === plan.state?.status) ||
        (!executeConfig.ignored && 'IGNORED' === plan.state?.status)
    ) {
        if (plan.version) {
            return `Detected version ${plan.version}(${plan.description}) migration not applied to Elasticsearch.`;
        } else {
            return `Detected unknown version(${plan.description}) migration not applied to Elasticsearch.`;
        }
    }

    if (
        plan.resolvedMigration !== undefined &&
        plan.appliedMigration !== undefined &&
        lt(plan.baseline, generateVersion(plan.resolvedMigration, plan.appliedMigration) ?? '') &&
        plan.resolvedMigration.checksum !== plan.appliedMigration.checksum
    ) {
        return `Migration checksum mismatch for migration ${plan.resolvedMigration.version}.`;
    }

    return null;
};
