import {
    AppliedMigration,
    MigrationInfoContext,
    MigrationState,
    MigrationStateInfo,
    MigrationType,
    ResolvedMigration
} from '../../model/types';

export default class MigrationInfo {
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

    getType(): MigrationType | undefined {
        if (this.appliedMigration) {
            return this.appliedMigration?.type;
        }
        return this.resolvedMigration?.type;
    }

    getVersion(): string | undefined {
        if (this.appliedMigration) {
            return this.appliedMigration.version;
        }
        return this.resolvedMigration?.version;
    }
    getDescription(): string | undefined {
        if (this.appliedMigration) {
            return this.appliedMigration?.description;
        }
        return this.resolvedMigration?.description;
    }

    getInstalledOn(): Date | undefined {
        if (this.appliedMigration) {
            return this.appliedMigration?.installedOn;
        }
        return undefined;
    }

    getState(): MigrationStateInfo | undefined {
        if (this.appliedMigration === undefined) {
            if (this.resolvedMigration?.version) {
                if (this.resolvedMigration?.version < this.context.baseline) {
                    return MigrationStateInfo.get(MigrationState.BELOW_BASELINE);
                }
                if (this.outOfOrder && this.resolvedMigration?.version < this.context.lastApplied) {
                    return MigrationStateInfo.get(MigrationState.IGNORED);
                }
            }
            return MigrationStateInfo.get(MigrationState.PENDING);
        }

        if (MigrationType.BASELINE === this.appliedMigration.type) {
            return MigrationStateInfo.get(MigrationState.BASELINE);
        }

        if (!this.resolvedMigration) {
            const version = this.getVersion() ?? '';
            if (!this.appliedMigration.version || version < this.context.lastResolved) {
                if (this.appliedMigration?.success) {
                    return MigrationStateInfo.get(MigrationState.MISSING_SUCCESS);
                }
                return MigrationStateInfo.get(MigrationState.MISSING_FAILED);
            } else {
                if (this.appliedMigration.success) {
                    return MigrationStateInfo.get(MigrationState.FUTURE_SUCCESS);
                }
                return MigrationStateInfo.get(MigrationState.FUTURE_FAILED);
            }
        }

        if (!this.appliedMigration?.success) {
            return MigrationStateInfo.get(MigrationState.FAILED);
        }

        if (this.outOfOrder) {
            return MigrationStateInfo.get(MigrationState.OUT_OF_ORDER);
        }
        return MigrationStateInfo.get(MigrationState.SUCCESS);
    }
}
