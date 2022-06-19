import type {
    MigrationConfig,
    MigrationData,
    MigrationExecuteConfig,
    MigrationType,
    RequiredMigrationData
} from '../types';
import {
    MigrationExplainPlan,
    MigrationPlanData,
    MigrationStates,
    MigrationTypes,
    Version
} from '../types';
import { loadMigrationScriptFile } from '../context/util/io/fileService';
import { migrationHistoryRepository } from '../context/migration/history/migrationHistoryRepository';
import { migrateHistorySpecByIndexName } from '../context/migration/history/spec';
import { compare, valid } from 'semver';
import { ResponseError as ResponseError6 } from 'es6/lib/errors';
import { ResponseError as ResponseError7 } from 'es7/lib/errors';
import { getBaselineVersion } from './migrationConfigService';
import { MigrationExecuteStatementDataEntity } from '../context/migration/execute_statements/migrationExecuteStatementDataEntity';
import { UnsupportedVersionError } from '../context/error/UnsupportedVersionError';
import { UnknownMigrationTargetError } from '../context/error/UnknownMigrationTargetError';
import { IndexNotFoundError } from '../context/error/IndexNotFoundError';
import { MigrationExplainValidationDomainService } from '../context/migration/execute_statements/MigrationExplainValidationDomainService';

export const migrationPlanService = (
    targetName: string,
    executeConfig: MigrationExecuteConfig,
    config: Required<MigrationConfig>
) => {
    const validateInputData = (migrationData: MigrationData[]) => {
        if (migrationData.length === 0) {
            throw new UnknownMigrationTargetError(
                `There is no migration target for ${targetName} in ${config.migration.location}.`
            );
        }
        if (migrationData.map((value) => value.version).includes(undefined)) {
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

    const refresh = async (): Promise<MigrationExplainPlan> => {
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

    const validate = async (plan?: MigrationExplainPlan) => {
        const explainPlans = plan?.all ?? (await refresh()).all;

        return explainPlans
            .map((plan) => MigrationExplainValidationDomainService.valid(plan, executeConfig))
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

    const migrationPlans: MigrationPlanData[] = [];
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
                ).toMigrationPlanData()
            );
        } else if (migrationPlan) {
            migrationPlans.push(migrationPlan.toMigrationPlanData());
        }
    });

    return {
        all: migrationPlans,
        pending: migrationPlans.filter((value) => value.state?.status === MigrationStates.PENDING)
    };
};
