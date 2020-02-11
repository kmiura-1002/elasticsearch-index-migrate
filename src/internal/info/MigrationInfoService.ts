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

function getMigrationStateInfo(status: MigrationState): MigrationStateInfo {
    switch (status) {
        case MigrationState.ABOVE_TARGET:
            return {
                status: MigrationState.ABOVE_TARGET,
                displayName: 'Above Target',
                resolved: true,
                applied: false,
                failed: false
            };
        case MigrationState.AVAILABLE:
            return {
                status: MigrationState.AVAILABLE,
                displayName: 'Available',
                resolved: true,
                applied: false,
                failed: false
            };
        case MigrationState.BASELINE:
            return {
                status: MigrationState.BASELINE,
                displayName: 'Baseline',
                resolved: true,
                applied: true,
                failed: false
            };
        case MigrationState.BELOW_BASELINE:
            return {
                status: MigrationState.BELOW_BASELINE,
                displayName: 'Below Baseline',
                resolved: true,
                applied: false,
                failed: false
            };
        case MigrationState.FAILED:
            return {
                status: MigrationState.FAILED,
                displayName: 'Failed',
                resolved: true,
                applied: true,
                failed: true
            };
        case MigrationState.FUTURE_FAILED:
            return {
                status: MigrationState.FUTURE_FAILED,
                displayName: 'Failed (Future)',
                resolved: false,
                applied: true,
                failed: true
            };
        case MigrationState.FUTURE_SUCCESS:
            return {
                status: MigrationState.FUTURE_SUCCESS,
                displayName: 'Future',
                resolved: false,
                applied: true,
                failed: false
            };
        case MigrationState.IGNORED:
            return {
                status: MigrationState.IGNORED,
                displayName: 'Ignored',
                resolved: true,
                applied: false,
                failed: false
            };
        case MigrationState.MISSING_FAILED:
            return {
                status: MigrationState.MISSING_FAILED,
                displayName: 'Failed (Missing)',
                resolved: false,
                applied: true,
                failed: true
            };
        case MigrationState.MISSING_SUCCESS:
            return {
                status: MigrationState.MISSING_SUCCESS,
                displayName: 'Missing',
                resolved: true,
                applied: true,
                failed: false
            };
        case MigrationState.OUT_OF_ORDER:
            return {
                status: MigrationState.OUT_OF_ORDER,
                displayName: 'Out of Order',
                resolved: true,
                applied: true,
                failed: false
            };
        case MigrationState.OUTDATED:
            return {
                status: MigrationState.OUTDATED,
                displayName: 'Outdated',
                resolved: true,
                applied: true,
                failed: false
            };
        case MigrationState.PENDING:
            return {
                status: MigrationState.PENDING,
                displayName: 'Pending',
                resolved: true,
                applied: false,
                failed: false
            };
        case MigrationState.SUCCESS:
            return {
                status: MigrationState.SUCCESS,
                displayName: 'Success',
                resolved: true,
                applied: true,
                failed: false
            };
        case MigrationState.SUPERSEDED:
            return {
                status: MigrationState.SUPERSEDED,
                displayName: 'Superseded',
                resolved: true,
                applied: true,
                failed: false
            };
        case MigrationState.UNDONE:
            return {
                status: MigrationState.UNDONE,
                displayName: 'Undone',
                resolved: true,
                applied: true,
                failed: false
            };
        default:
            throw Error(`Unknown status ${status}`);
    }
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

    getState(): MigrationStateInfo {
        if (this.resolvedMigration === undefined) {
            if (this.appliedMigration?.version !== undefined) {
                if (this.appliedMigration?.version.includes(this.context.baseline)) {
                    return getMigrationStateInfo(MigrationState.BELOW_BASELINE);
                }
                if (
                    this.context.target !== undefined &&
                    this.appliedMigration?.version.includes(this.context.target)
                ) {
                    return getMigrationStateInfo(MigrationState.ABOVE_TARGET);
                }
                if (this.outOfOrder) {
                    return getMigrationStateInfo(MigrationState.IGNORED);
                }
            }
            return getMigrationStateInfo(MigrationState.PENDING);
        }

        if (MigrationType.BASELINE === this.resolvedMigration.type) {
            return getMigrationStateInfo(MigrationState.BASELINE);
        }

        if (!this.appliedMigration) {
            if (
                !this.resolvedMigration.version ||
                this.getVersion()?.includes(this.context.lastResolved)
            ) {
                if (this.resolvedMigration?.success) {
                    return getMigrationStateInfo(MigrationState.MISSING_SUCCESS);
                }
                return getMigrationStateInfo(MigrationState.MISSING_FAILED);
            } else {
                if (this.resolvedMigration.success) {
                    return getMigrationStateInfo(MigrationState.FUTURE_SUCCESS);
                }
                return getMigrationStateInfo(MigrationState.FUTURE_FAILED);
            }
        }

        if (!this.resolvedMigration?.success) {
            return getMigrationStateInfo(MigrationState.FAILED);
        }

        if (this.outOfOrder) {
            return getMigrationStateInfo(MigrationState.OUT_OF_ORDER);
        }
        return getMigrationStateInfo(MigrationState.SUCCESS);
    }
}

class MigrationInfoService implements IMigrationInfoService {
    migrationInfos: MigrationInfoImpl[];
    appliedMigrations: AppliedMigration[];
    resolvedMigrations: MigrateIndex[];
    baselineVersion: string;

    constructor(
        appliedMigrations: AppliedMigration[],
        resolvedMigrations: MigrateIndex[],
        baselineVersion: string
    ) {
        this.appliedMigrations = appliedMigrations;
        this.resolvedMigrations = resolvedMigrations;
        this.migrationInfos = [];
        this.baselineVersion = baselineVersion;
    }

    refresh() {
        const migrationInfoMap = new Map<string, MigrationInfoImpl>();
        const resolvedMigrationVersions = sort(
            this.resolvedMigrations.map((value) => value.migrate_version)
        );
        const lastResolved = resolvedMigrationVersions[resolvedMigrationVersions.length - 1];
        const appliedMigrationVersions = sort(this.appliedMigrations.map((value) => value.version));
        const lastApplied = appliedMigrationVersions[appliedMigrationVersions.length - 1];

        const context: MigrationInfoContext = {
            outOfOrder: true,
            pending: true,
            missing: true,
            ignored: true,
            future: true,
            target: '',
            baseline: this.baselineVersion,
            lastResolved,
            lastApplied
        };

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
