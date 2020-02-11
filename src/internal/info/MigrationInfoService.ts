import {
    AppliedMigration,
    MigrateIndex,
    MigrationInfo,
    MigrationInfoContext,
    MigrationState,
    MigrationStateInfo,
    MigrationType,
    ResolvedMigration
} from '../../model/types';
import sort from 'sort-versions';

interface IMigrationInfoService {
    all(): MigrationInfo[] | undefined;
    current(): MigrationInfo | undefined;
    pending(): MigrationInfo[] | undefined;
    applied(): MigrationInfo[] | undefined;
}

class MigrationInfoImpl implements MigrationInfo {
    appliedMigration?: AppliedMigration;
    resolvedMigration?: ResolvedMigration;
    context: MigrationInfoContext;
    outOfOrder: boolean;

    constructor(
        context: MigrationInfoContext,
        outOfOrder: boolean,
        appliedMigration?: AppliedMigration,
        resolvedMigration?: ResolvedMigration
    ) {
        this.appliedMigration = appliedMigration;
        this.resolvedMigration = resolvedMigration;
        this.context = context;
        this.outOfOrder = outOfOrder;
    }

    getVersion() {
        if (this.resolvedMigration) {
            return this.resolvedMigration.version;
        }
        return this.appliedMigration?.version;
    }

    getState(): MigrationStateInfo | undefined {
        if (this.resolvedMigration === undefined) {
            if (this.appliedMigration?.version !== undefined) {
                if (this.appliedMigration?.version.includes(this.context.baseline)) {
                    return MigrationStateInfo.get(MigrationState.BELOW_BASELINE);
                }
                if (
                    this.context.target !== undefined &&
                    this.appliedMigration?.version.includes(this.context.target)
                ) {
                    return MigrationStateInfo.get(MigrationState.ABOVE_TARGET);
                }
                if (this.outOfOrder) {
                    return MigrationStateInfo.get(MigrationState.IGNORED);
                }
            }
            return MigrationStateInfo.get(MigrationState.PENDING);
        }

        if (MigrationType.BASELINE === this.resolvedMigration.type) {
            return MigrationStateInfo.get(MigrationState.BASELINE);
        }

        if (!this.appliedMigration) {
            if (
                !this.resolvedMigration.version ||
                this.getVersion()?.includes(this.context.lastResolved)
            ) {
                if (this.resolvedMigration?.success) {
                    return MigrationStateInfo.get(MigrationState.MISSING_SUCCESS);
                }
                return MigrationStateInfo.get(MigrationState.MISSING_FAILED);
            } else {
                if (this.resolvedMigration.success) {
                    return MigrationStateInfo.get(MigrationState.FUTURE_SUCCESS);
                }
                return MigrationStateInfo.get(MigrationState.FUTURE_FAILED);
            }
        }

        if (!this.resolvedMigration?.success) {
            return MigrationStateInfo.get(MigrationState.FAILED);
        }

        if (this.outOfOrder) {
            return MigrationStateInfo.get(MigrationState.OUT_OF_ORDER);
        }
        return MigrationStateInfo.get(MigrationState.SUCCESS);
    }
}

class MigrationInfoService implements IMigrationInfoService {
    migrationInfos: MigrationInfoImpl[];
    appliedMigrations: AppliedMigration[];
    resolvedMigrations: MigrateIndex[];
    context: MigrationInfoContext;

    constructor(
        appliedMigrations: AppliedMigration[],
        resolvedMigrations: MigrateIndex[],
        context: MigrationInfoContext
    ) {
        this.appliedMigrations = appliedMigrations;
        this.resolvedMigrations = resolvedMigrations;
        this.migrationInfos = [];
        this.context = context;
    }

    refresh() {
        const migrationInfoMap = new Map<string, MigrationInfoImpl>();
        const resolvedMigrationVersions = sort(
            this.resolvedMigrations.map((value) => value.migrate_version)
        );
        const lastResolved = resolvedMigrationVersions[resolvedMigrationVersions.length - 1];
        const appliedMigrationVersions = sort(this.appliedMigrations.map((value) => value.version));
        const lastApplied = appliedMigrationVersions[appliedMigrationVersions.length - 1];

        const context: MigrationInfoContext = { ...this.context, lastResolved, lastApplied };

        this.appliedMigrations.forEach((value) => {
            const migrationInfo = migrationInfoMap.get(value.version);
            if (migrationInfo) {
                migrationInfoMap.set(
                    value.version,
                    new MigrationInfoImpl(
                        context,
                        migrationInfo.outOfOrder,
                        value,
                        migrationInfo.resolvedMigration
                    )
                );
                migrationInfo.appliedMigration = value;
            } else {
                migrationInfoMap.set(value.version, new MigrationInfoImpl(context, false, value));
            }
        });
        this.resolvedMigrations.forEach((value) => {
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
                migrationInfoMap.set(
                    value.migrate_version,
                    new MigrationInfoImpl(
                        context,
                        migrationInfo.outOfOrder,
                        migrationInfo.appliedMigration,
                        appliedMigration
                    )
                );
            } else {
                migrationInfoMap.set(
                    value.migrate_version,
                    new MigrationInfoImpl(context, false, undefined, appliedMigration)
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
            if (migrationInfo?.appliedMigration && migrationInfo?.resolvedMigration === undefined) {
                const outOfOrder = !!sortedKeys
                    .slice(index, sortedKeys.length)
                    .map((value) => {
                        const info = migrationInfoMap.get(value);
                        return !!info?.resolvedMigration;
                    })
                    .find((value) => value);
                this.migrationInfos.push(
                    new MigrationInfoImpl(
                        migrationInfo.context,
                        outOfOrder,
                        migrationInfo.appliedMigration,
                        migrationInfo.resolvedMigration
                    )
                );
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
