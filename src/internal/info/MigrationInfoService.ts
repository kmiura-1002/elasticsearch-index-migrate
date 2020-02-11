import {
    AppliedMigration,
    MigrateIndex,
    MigrationInfo,
    MigrationInfoContext,
    MigrationState,
    MigrationStateInfo,
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
    resolvedMigration?: ResolvedMigration;
    appliedMigration?: AppliedMigration;
    context: MigrationInfoContext;
    outOfOrder: boolean;

    constructor(
        context: MigrationInfoContext,
        outOfOrder: boolean,
        resolvedMigration?: ResolvedMigration,
        appliedMigration?: AppliedMigration
    ) {
        this.resolvedMigration = resolvedMigration;
        this.appliedMigration = appliedMigration;
        this.context = context;
        this.outOfOrder = outOfOrder;
    }

    getState(): MigrationStateInfo {
        return getMigrationStateInfo(MigrationState.UNDONE);
    }
}

class MigrationInfoService implements IMigrationInfoService {
    migrationInfos: MigrationInfoImpl[];
    resolvedMigrations: ResolvedMigration[];
    appliedMigrations: MigrateIndex[];

    constructor(resolvedMigrations: ResolvedMigration[], appliedMigrations: MigrateIndex[]) {
        this.resolvedMigrations = resolvedMigrations;
        this.appliedMigrations = appliedMigrations;
        this.migrationInfos = [];
    }

    refresh() {
        const migrationInfoMap = new Map<string, MigrationInfoImpl>();
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
                migrationInfoMap.set(
                    value.version,
                    new MigrationInfoImpl(
                        context,
                        migrationInfo.outOfOrder,
                        value,
                        migrationInfo.appliedMigration
                    )
                );
                migrationInfo.resolvedMigration = value;
            } else {
                migrationInfoMap.set(value.version, new MigrationInfoImpl(context, false, value));
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
                migrationInfoMap.set(
                    value.migrate_version,
                    new MigrationInfoImpl(
                        context,
                        migrationInfo.outOfOrder,
                        migrationInfo.resolvedMigration,
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
            if (migrationInfo?.resolvedMigration && migrationInfo?.appliedMigration === undefined) {
                const outOfOrder = !!sortedKeys
                    .slice(index, sortedKeys.length)
                    .map((value) => {
                        const info = migrationInfoMap.get(value);
                        return !!info?.appliedMigration;
                    })
                    .find((value) => value);
                this.migrationInfos.push(
                    new MigrationInfoImpl(
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