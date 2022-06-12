import type {
    AppliedMigration,
    MigrationConfig,
    MigrationData,
    MigrationPlanData,
    MigrationStateInfo,
    RequiredMigrationData,
    MigrationType,
    MigrationExplainPlan,
    MigrationExecuteConfig
} from '../types';
import { loadMigrationScriptFile } from '../context/util/io/fileService';
import { migrateHistoryRepository } from '../context/migration/history/migrateHistoryRepository';
import { migrateHistorySpecByIndexName } from '../context/migration/history/spec';
import { compare, lt, valid } from 'semver';
import { MigrationStates, MigrationTypes, MigrationStateInfoMap } from '../types';
import { ResponseError as ResponseError6 } from 'es6/lib/errors';
import { ResponseError as ResponseError7 } from 'es7/lib/errors';

export const migrationPlanService = (
    targetName: string,
    executeConfig: MigrationExecuteConfig,
    config: Required<MigrationConfig>
) => {
    const validateInputData = (migrationData: MigrationData[], baseline: string | undefined) => {
        if (baseline === undefined) {
            throw new Error(`The baseline setting for index(${targetName}) does not exist.`);
        }
        if (migrationData.length === 0) {
            throw new Error(
                `There is no migration target for ${targetName} in ${config.migration.location}.`
            );
        }
        if (migrationData.map((value) => value.version).includes(undefined)) {
            throw new Error(
                'There is a migration file of unknown version.\n' +
                    `Unknown version files: ${migrationData
                        .filter((value) => value.version === undefined)
                        .map((value) => value.physicalLocation.name)
                        .join(', ')}`
            );
        }
    };

    const refresh = async (): Promise<MigrationExplainPlan> => {
        const migrationData = loadMigrationScriptFile(targetName, [config.migration.location]);
        const baseline = config.migration.baselineVersion[targetName];
        validateInputData(migrationData, baseline);
        try {
            const { findBy } = migrateHistoryRepository(config.elasticsearch);
            const histories = await findBy(
                migrateHistorySpecByIndexName(targetName, baseline, { size: 10000 })
            );
            const appliedMigrationVersions = histories
                .map((value) => value.migrateVersion)
                .filter((value) => valid(value))
                .sort((a, b) => compare(a, b));
            const resolvedMigrationVersions = migrationData
                .map((value) => value.version)
                .filter(isString)
                .filter((value) => valid(value))
                .sort((a, b) => compare(a, b));
            const lastResolved = resolvedMigrationVersions[resolvedMigrationVersions.length - 1];
            const lastApplied = appliedMigrationVersions[appliedMigrationVersions.length - 1];
            const migrationPlanMap = new Map<string, MigrationPlanData>();

            migrationData.filter(isRequiredMigrationData).forEach((value) => {
                const migrationPlan = migrationPlanMap.get(value.version);
                if (migrationPlan) {
                    // Overwrites the same version of the migration file, if any
                    migrationPlanMap.set(
                        value.version,
                        generateMigrationPlan(
                            baseline,
                            lastResolved,
                            lastApplied,
                            value,
                            migrationPlan.appliedMigration
                        )
                    );
                    migrationPlan.resolvedMigration = value;
                } else {
                    migrationPlanMap.set(
                        value.version,
                        generateMigrationPlan(baseline, lastResolved, lastApplied, value)
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
                        generateMigrationPlan(
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
                        generateMigrationPlan(
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
                    throw new Error(
                        'History index not found.\n' +
                            'Please check if migrate_history exists in Elasticsearch.'
                    );
                }
            }
            throw e;
        }
    };

    const validate = async (plan?: MigrationExplainPlan) => {
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

const makeMigrationExplainPlan = (map: Map<string, MigrationPlanData>) => {
    const sortedKeys = Array.from(map.keys())
        .filter((value) => valid(value))
        .sort((a, b) => compare(a, b));

    const migrationPlans: MigrationPlanData[] = [];
    sortedKeys.forEach((version) => {
        const migrationPlan = map.get(version);
        if (migrationPlan?.resolvedMigration && migrationPlan?.appliedMigration === undefined) {
            migrationPlans.push(
                generateMigrationPlan(
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

const generateMigrationPlan = (
    baseline: string,
    lastResolved: string,
    lastApplied: string,
    resolvedMigration?: RequiredMigrationData,
    appliedMigration?: AppliedMigration
): MigrationPlanData => ({
    resolvedMigration: resolvedMigration,
    appliedMigration: appliedMigration,
    baseline,
    lastResolved,
    lastApplied,
    type: appliedMigration?.type ?? resolvedMigration?.file.type,
    description: appliedMigration?.description ?? resolvedMigration?.file.description,
    version: generateVersion(resolvedMigration, appliedMigration),
    installedOn: appliedMigration?.installedOn,
    state: generateState(baseline, lastResolved, lastApplied, resolvedMigration, appliedMigration),
    isBaseline: baseline === generateVersion(resolvedMigration, appliedMigration),
    checksum: appliedMigration?.checksum ?? resolvedMigration?.checksum
});

const generateVersion = (
    resolvedMigration?: RequiredMigrationData,
    appliedMigration?: AppliedMigration
): string | undefined => appliedMigration?.version ?? resolvedMigration?.version;

const generateState = (
    baseline: string,
    lastResolved: string,
    lastApplied: string,
    resolvedMigration?: RequiredMigrationData,
    appliedMigration?: AppliedMigration
): MigrationStateInfo | undefined => {
    if (!appliedMigration) {
        if (resolvedMigration?.version) {
            if (
                valid(resolvedMigration?.version) &&
                valid(baseline) &&
                lt(resolvedMigration?.version, baseline)
            ) {
                return MigrationStateInfoMap.get(MigrationStates.BELOW_BASELINE);
            }
            if (
                valid(resolvedMigration?.version) &&
                valid(lastApplied) &&
                lt(resolvedMigration?.version, lastApplied)
            ) {
                return MigrationStateInfoMap.get(MigrationStates.IGNORED);
            }
        }
        return MigrationStateInfoMap.get(MigrationStates.PENDING);
    }

    if (
        valid(appliedMigration?.version) &&
        valid(baseline) &&
        appliedMigration?.version === baseline &&
        appliedMigration?.success
    ) {
        return MigrationStateInfoMap.get(MigrationStates.BASELINE);
    }

    if (!resolvedMigration) {
        const version = generateVersion(resolvedMigration, appliedMigration) ?? '';
        if (
            !appliedMigration.version ||
            (valid(lastResolved) && valid(version) && lt(version, lastResolved))
        ) {
            if (appliedMigration.success) {
                return MigrationStateInfoMap.get(MigrationStates.MISSING_SUCCESS);
            }
            return MigrationStateInfoMap.get(MigrationStates.MISSING_FAILED);
        } else {
            if (appliedMigration.success) {
                return MigrationStateInfoMap.get(MigrationStates.FUTURE_SUCCESS);
            }
            return MigrationStateInfoMap.get(MigrationStates.FUTURE_FAILED);
        }
    }

    if (!appliedMigration?.success) {
        return MigrationStateInfoMap.get(MigrationStates.FAILED);
    }

    return MigrationStateInfoMap.get(MigrationStates.SUCCESS);
};

const planValidate = (plan: MigrationPlanData, executeConfig: MigrationExecuteConfig) => {
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
