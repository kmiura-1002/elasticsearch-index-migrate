import {
    MigrateIndex,
    MigrationInfo,
    MigrationInfoContext,
    ResolvedMigration
} from '../../model/types';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import sort from 'sort-versions';
interface IMigrationInfoService {
    all(): MigrationInfo[] | undefined;
    current(): MigrationInfo | undefined;
    pending(): MigrationInfo[] | undefined;
    applied(): MigrationInfo[] | undefined;
}

class MigrationInfoService implements IMigrationInfoService {
    migrationInfos: MigrationInfo[];
    resolvedMigrations: ResolvedMigration[];
    appliedMigrations: MigrateIndex[];

    constructor(resolvedMigrations: ResolvedMigration[], appliedMigrations: MigrateIndex[]) {
        this.resolvedMigrations = resolvedMigrations;
        this.appliedMigrations = appliedMigrations;
        this.migrationInfos = [];
    }

    refresh() {
        const migrationInfoMap = new Map<string, MigrationInfo>();
        const context: MigrationInfoContext = {
            outOfOrder: false,
            pending: true,
            missing: false,
            ignored: false,
            future: false,
            target: '',
            schema: '',
            baseline: '',
            lastResolved: '',
            lastApplied: ''
        };
        this.resolvedMigrations.forEach((value) => {
            const migrationInfo = migrationInfoMap.get(value.version);
            if (migrationInfo) {
                migrationInfoMap.set(value.version, {
                    ...migrationInfo,
                    resolvedMigration: value,
                    context
                });
                migrationInfo.resolvedMigration = value;
            } else {
                migrationInfoMap.set(value.version, {
                    resolvedMigration: value,
                    context,
                    outOfOrder: false
                });
            }
        });
        this.appliedMigrations.forEach((value) => {
            const migrationInfo = migrationInfoMap.get(value.migrate_version);
            const appliedMigration = {
                installedRank: value.installed_rank,
                version: value.migrate_version,
                description: value.description,
                type: value.script_type,
                script: value.script_name,
                installedOn: value.installed_on,
                executionTime: value.execution_time,
                success: value.success
            };
            if (migrationInfo) {
                migrationInfoMap.set(value.migrate_version, {
                    ...migrationInfo,
                    appliedMigration,
                    context
                });
            } else {
                migrationInfoMap.set(value.migrate_version, {
                    appliedMigration,
                    context,
                    outOfOrder: false
                });
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
                this.migrationInfos.push({
                    ...migrationInfo,
                    outOfOrder
                });
            } else if (migrationInfo) {
                this.migrationInfos.push(migrationInfo);
            }
        });
        console.log(this.migrationInfos);
    }

    all(): MigrationInfo[] {
        return this.migrationInfos;
    }

    applied(): MigrationInfo[] | undefined {
        return undefined;
    }

    current(): MigrationInfo | undefined {
        return undefined;
    }

    pending(): MigrationInfo[] | undefined {
        return undefined;
    }
}

export default MigrationInfoService;
