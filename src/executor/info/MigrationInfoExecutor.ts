import {
    ResolvedMigration,
    MigrateIndex,
    MigrationInfoContext,
    MigrationState,
    MigrationType
} from '../../model/types';
import sort from 'sort-versions';
import { generateMigrationInfo, MigrationInfo } from './MigrationInfo';

class MigrationInfoExecutor {
    migrationInfos: MigrationInfo[];
    resolvedMigrations: ResolvedMigration[];
    appliedMigrations: MigrateIndex[];
    context: MigrationInfoContext;

    constructor(
        resolvedMigrations: ResolvedMigration[],
        appliedMigrations: MigrateIndex[],
        context: MigrationInfoContext
    ) {
        this.resolvedMigrations = resolvedMigrations;
        this.appliedMigrations = appliedMigrations;
        this.migrationInfos = [];
        this.context = context;
        this.refresh();
    }

    private refresh() {
        const migrationInfoMap = new Map<string, MigrationInfo>();
        const appliedMigrationVersions = sort(
            this.appliedMigrations.map((value) => value.migrate_version)
        );
        const lastApplied = appliedMigrationVersions[appliedMigrationVersions.length - 1];
        const resolvedMigrationVersions = sort(
            this.resolvedMigrations.map((value) => value.version)
        );
        const lastResolved = resolvedMigrationVersions[resolvedMigrationVersions.length - 1];

        const context: MigrationInfoContext = {
            ...this.context,
            lastResolved,
            lastApplied
        };

        this.resolvedMigrations.forEach((value) => {
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
        this.appliedMigrations.forEach((value) => {
            const migrationInfo = migrationInfoMap.get(value.migrate_version);
            const appliedMigration = {
                // installedRank: value.installed_rank,
                version: value.migrate_version,
                description: value.description,
                type: MigrationType[value.script_type as keyof typeof MigrationType],
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
                this.migrationInfos.push(
                    generateMigrationInfo(
                        migrationInfo.context,
                        outOfOrder,
                        migrationInfo.resolvedMigration,
                        migrationInfo.appliedMigration
                    )
                );
            } else if (migrationInfo) {
                this.migrationInfos.push(migrationInfo);
            }
        });
    }

    all(): MigrationInfo[] {
        return this.migrationInfos;
    }

    pending(): MigrationInfo[] {
        return this.migrationInfos.filter(
            (value) => value.state?.status === MigrationState.PENDING
        );
    }
}

export default MigrationInfoExecutor;
