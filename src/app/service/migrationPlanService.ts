import type {
    AppliedMigration,
    MigrationConfig,
    MigrationData,
    MigrationPlanData,
    MigrationStateInfo,
    RequiredMigrationData,
    MigrationPlanContext,
    MigrationType,
    MigrationExplainPlan,
    MigrationExecuteConfig
} from '../types';
import { loadMigrationScriptFile } from '../context/io/fileService';
import { migrateHistoryRepository } from '../context/migrate_history/migrateHistoryRepository';
import { migrateHistorySpecByIndexName } from '../context/migrate_history/spec';
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
                .map((value) => value.migrate_version)
                .filter((value) => valid(value))
                .sort((a, b) => compare(a, b));
            const resolvedMigrationVersions = migrationData
                .map((value) => value.version)
                .filter(isString)
                .filter((value) => valid(value))
                .sort((a, b) => compare(a, b));
            const lastResolved = resolvedMigrationVersions[resolvedMigrationVersions.length - 1];
            const lastApplied = appliedMigrationVersions[appliedMigrationVersions.length - 1];
            const context: MigrationPlanContext = {
                baseline,
                lastApplied,
                lastResolved
            };
            const migrationPlanMap = new Map<string, MigrationPlanData>();

            migrationData.filter(isRequiredMigrationData).forEach((value) => {
                const migrationPlan = migrationPlanMap.get(value.version);
                if (migrationPlan) {
                    // Overwrites the same version of the migration file, if any
                    migrationPlanMap.set(
                        value.version,
                        generateMigrationPlan(context, value, migrationPlan.appliedMigration)
                    );
                    migrationPlan.resolvedMigration = value;
                } else {
                    migrationPlanMap.set(value.version, generateMigrationPlan(context, value));
                }
            });
            histories.forEach((value) => {
                const migrationPlan = migrationPlanMap.get(value.migrate_version);
                const appliedMigration = {
                    version: value.migrate_version,
                    description: value.description,
                    type: MigrationTypes[value.script_type as MigrationType],
                    script: value.script_name,
                    installedOn: new Date(value.installed_on),
                    executionTime: value.execution_time,
                    success: value.success,
                    checksum: value.checksum ?? ''
                };
                if (migrationPlan) {
                    migrationPlanMap.set(
                        value.migrate_version,
                        generateMigrationPlan(
                            context,
                            migrationPlan.resolvedMigration,
                            appliedMigration
                        )
                    );
                } else {
                    migrationPlanMap.set(
                        value.migrate_version,
                        generateMigrationPlan(context, undefined, appliedMigration)
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
                    migrationPlan.context,
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
    context: MigrationPlanContext,
    resolvedMigration?: RequiredMigrationData,
    appliedMigration?: AppliedMigration
): MigrationPlanData => ({
    resolvedMigration: resolvedMigration,
    appliedMigration: appliedMigration,
    context,
    type: appliedMigration?.type ?? resolvedMigration?.file.type,
    description: appliedMigration?.description ?? resolvedMigration?.file.description,
    version: generateVersion(resolvedMigration, appliedMigration),
    installedOn: appliedMigration?.installedOn,
    state: generateState(context, resolvedMigration, appliedMigration),
    baseline: context.baseline === generateVersion(resolvedMigration, appliedMigration),
    checksum: appliedMigration?.checksum ?? resolvedMigration?.checksum
});

const generateVersion = (
    resolvedMigration?: RequiredMigrationData,
    appliedMigration?: AppliedMigration
): string | undefined => appliedMigration?.version ?? resolvedMigration?.version;

const generateState = (
    context: MigrationPlanContext,
    resolvedMigration?: RequiredMigrationData,
    appliedMigration?: AppliedMigration
): MigrationStateInfo | undefined => {
    if (!appliedMigration) {
        if (resolvedMigration?.version) {
            if (
                valid(resolvedMigration?.version) &&
                valid(context.baseline) &&
                lt(resolvedMigration?.version, context.baseline)
            ) {
                return MigrationStateInfoMap.get(MigrationStates.BELOW_BASELINE);
            }
            if (
                valid(resolvedMigration?.version) &&
                valid(context.lastApplied) &&
                lt(resolvedMigration?.version, context.lastApplied)
            ) {
                return MigrationStateInfoMap.get(MigrationStates.IGNORED);
            }
        }
        return MigrationStateInfoMap.get(MigrationStates.PENDING);
    }

    if (
        valid(appliedMigration?.version) &&
        valid(context.baseline) &&
        appliedMigration?.version === context.baseline &&
        appliedMigration?.success
    ) {
        return MigrationStateInfoMap.get(MigrationStates.BASELINE);
    }

    if (!resolvedMigration) {
        const version = generateVersion(resolvedMigration, appliedMigration) ?? '';
        if (
            !appliedMigration.version ||
            (valid(context.lastResolved) && valid(version) && lt(version, context.lastResolved))
        ) {
            if (appliedMigration?.success) {
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
    if (plan.state?.failed && !plan.context.future) {
        if (plan.version) {
            return `Detected failure to migrate to version ${plan.version}(${plan.description}).`;
        } else {
            return `Detected failure to migrate to unknown version(${plan.description}).`;
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
        lt(
            plan.context.baseline,
            generateVersion(plan.resolvedMigration, plan.appliedMigration) ?? ''
        ) &&
        plan.resolvedMigration.checksum !== plan.appliedMigration.checksum
    ) {
        return `Migration checksum mismatch for migration ${plan.resolvedMigration.version}.`;
    }

    return null;
};
