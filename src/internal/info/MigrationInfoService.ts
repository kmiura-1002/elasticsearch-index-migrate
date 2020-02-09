import {
    MigrateIndex,
    MigrationInfo,
    MigrationInfoContext,
    ResolvedMigration
} from '../../model/types';

interface IMigrationInfoService {
    all(): MigrationInfo[] | undefined;
    current(): MigrationInfo | undefined;
    pending(): MigrationInfo[] | undefined;
    applied(): MigrationInfo[] | undefined;
}

class MigrationInfoService implements IMigrationInfoService {
    migrationInfo: MigrationInfo[];
    resolvedMigrations: ResolvedMigration[];
    appliedMigrations: MigrateIndex[];

    constructor(resolvedMigrations: ResolvedMigration[], appliedMigrations: MigrateIndex[]) {
        this.resolvedMigrations = resolvedMigrations;
        this.appliedMigrations = appliedMigrations;
        this.migrationInfo = [];
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
    }

    all(): MigrationInfo[] {
        return this.migrationInfo;
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
