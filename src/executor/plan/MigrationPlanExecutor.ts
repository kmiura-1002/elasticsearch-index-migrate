import {
    ResolvedMigration,
    MigrateIndex,
    MigrationPlanContext,
    MigrationType,
    MigrationTypes,
    MigrationStates,
    MigrationPlanExecutorRet
} from '../../model/types';
import { generateMigrationPlan, MigrationPlan } from './MigrationPlan';
import { cli } from 'cli-ux';
import { compare, valid } from 'semver';

function MigrationPlanExecutor(
    resolvedMigrations: ResolvedMigration[],
    appliedMigrations: MigrateIndex[],
    migrationPlanContext: MigrationPlanContext
): MigrationPlanExecutorRet {
    const migrationPlans: MigrationPlan[] = [];

    const migrationPlanMap = new Map<string, MigrationPlan>();
    const appliedMigrationVersions = appliedMigrations
        .map((value) => value.migrate_version)
        .filter((value) => valid(value))
        .sort((a, b) => compare(a, b));
    const lastApplied = appliedMigrationVersions[appliedMigrationVersions.length - 1];
    const resolvedMigrationVersions = resolvedMigrations
        .map((value) => value.version)
        .filter((value) => valid(value))
        .sort((a, b) => compare(a, b));
    const lastResolved = resolvedMigrationVersions[resolvedMigrationVersions.length - 1];

    const context: MigrationPlanContext = {
        ...migrationPlanContext,
        lastResolved,
        lastApplied
    };

    resolvedMigrations.forEach((value) => {
        const migrationPlan = migrationPlanMap.get(value.version);
        if (migrationPlan) {
            migrationPlanMap.set(
                value.version,
                generateMigrationPlan(
                    context,
                    migrationPlan.outOfOrder,
                    value,
                    migrationPlan.appliedMigration
                )
            );
            migrationPlan.resolvedMigration = value;
        } else {
            migrationPlanMap.set(value.version, generateMigrationPlan(context, false, value));
        }
    });
    appliedMigrations.forEach((value) => {
        const migrationPlan = migrationPlanMap.get(value.migrate_version);
        const appliedMigration = {
            version: value.migrate_version,
            description: value.description,
            type: MigrationTypes[value.script_type as MigrationType],
            script: value.script_name,
            installedOn: new Date(value.installed_on),
            executionTime: value.execution_time,
            success: value.success
        };
        if (migrationPlan) {
            migrationPlanMap.set(
                value.migrate_version,
                generateMigrationPlan(
                    context,
                    migrationPlan.outOfOrder,
                    migrationPlan.resolvedMigration,
                    appliedMigration
                )
            );
        } else {
            migrationPlanMap.set(
                value.migrate_version,
                generateMigrationPlan(context, false, undefined, appliedMigration)
            );
        }
    });

    const keys: string[] = [];
    migrationPlanMap.forEach((value, key) => {
        keys.push(key);
    });
    const sortedKeys = keys.filter((value) => valid(value)).sort((a, b) => compare(a, b));
    if (sortedKeys.length < 1) {
        cli.error('Unknown version migration detected');
    }
    sortedKeys.forEach((version, index) => {
        const migrationPlan = migrationPlanMap.get(version);
        if (migrationPlan?.resolvedMigration && migrationPlan?.appliedMigration === undefined) {
            const outOfOrder = !!sortedKeys
                .slice(index, sortedKeys.length)
                .map((value) => {
                    const plan = migrationPlanMap.get(value);
                    return !!plan?.appliedMigration;
                })
                .find((value) => value);
            migrationPlans.push(
                generateMigrationPlan(
                    migrationPlan.context,
                    outOfOrder,
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
}
export default MigrationPlanExecutor;
