import {
    ResolvedMigration,
    MigrateIndex,
    MigrationInfoContext,
    MigrationType,
    MigrationTypes,
    MigrationStates,
    MigrationInfoExecutorRet
} from '../../model/types';
import sort from 'sort-versions';
import { generateMigrationInfo, MigrationInfo } from './MigrationInfo';
import { cli } from 'cli-ux';

function MigrationInfoExecutor(
    resolvedMigrations: ResolvedMigration[],
    appliedMigrations: MigrateIndex[],
    migrationInfoContext: MigrationInfoContext
): MigrationInfoExecutorRet {
    const migrationInfos: MigrationInfo[] = [];

    const migrationInfoMap = new Map<string, MigrationInfo>();
    const appliedMigrationVersions = sort(appliedMigrations.map((value) => value.migrate_version));
    const lastApplied = appliedMigrationVersions[appliedMigrationVersions.length - 1];
    const resolvedMigrationVersions = sort(resolvedMigrations.map((value) => value.version));
    const lastResolved = resolvedMigrationVersions[resolvedMigrationVersions.length - 1];

    const context: MigrationInfoContext = {
        ...migrationInfoContext,
        lastResolved,
        lastApplied
    };

    resolvedMigrations.forEach((value) => {
        const migrationInfo = migrationInfoMap.get(value.version);
        if (migrationInfo) {
            migrationInfoMap.set(
                value.version,
                generateMigrationInfo(
                    context,
                    migrationInfo.outOfOrder,
                    value,
                    migrationInfo.appliedMigration
                )
            );
            migrationInfo.resolvedMigration = value;
        } else {
            migrationInfoMap.set(value.version, generateMigrationInfo(context, false, value));
        }
    });
    appliedMigrations.forEach((value) => {
        const migrationInfo = migrationInfoMap.get(value.migrate_version);
        const appliedMigration = {
            version: value.migrate_version,
            description: value.description,
            type: MigrationTypes[value.script_type as MigrationType],
            script: value.script_name,
            installedOn: new Date(value.installed_on),
            executionTime: value.execution_time,
            success: value.success
        };
        if (migrationInfo) {
            migrationInfoMap.set(
                value.migrate_version,
                generateMigrationInfo(
                    context,
                    migrationInfo.outOfOrder,
                    migrationInfo.resolvedMigration,
                    appliedMigration
                )
            );
        } else {
            migrationInfoMap.set(
                value.migrate_version,
                generateMigrationInfo(context, false, undefined, appliedMigration)
            );
        }
    });

    const keys: string[] = [];
    migrationInfoMap.forEach((value, key) => {
        keys.push(key);
    });
    const sortedKeys = sort(keys);
    if (sortedKeys.length < 1) {
        cli.error('Unknown version migration detected');
    }
    sortedKeys.forEach((version, index) => {
        const migrationInfo = migrationInfoMap.get(version);
        if (migrationInfo?.resolvedMigration && migrationInfo?.appliedMigration === undefined) {
            const outOfOrder = !!sortedKeys
                .slice(index, sortedKeys.length)
                .map((value) => {
                    const info = migrationInfoMap.get(value);
                    return !!info?.appliedMigration;
                })
                .find((value) => value);
            migrationInfos.push(
                generateMigrationInfo(
                    migrationInfo.context,
                    outOfOrder,
                    migrationInfo.resolvedMigration,
                    migrationInfo.appliedMigration
                )
            );
        } else if (migrationInfo) {
            migrationInfos.push(migrationInfo);
        }
    });

    return {
        all: migrationInfos,
        pending: migrationInfos.filter((value) => value.state?.status === MigrationStates.PENDING)
    };
}
export default MigrationInfoExecutor;
