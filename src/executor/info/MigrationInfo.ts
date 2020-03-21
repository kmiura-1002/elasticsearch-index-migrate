import {
    AppliedMigration,
    MigrationInfoContext,
    MigrationStateInfo,
    MigrationStates,
    MigrationType,
    ResolvedMigration
} from '../../model/types';

export function generateType(
    resolvedMigration?: ResolvedMigration,
    appliedMigration?: AppliedMigration
): MigrationType | undefined {
    return appliedMigration?.type ?? resolvedMigration?.type;
}

export function generateVersion(
    resolvedMigration?: ResolvedMigration,
    appliedMigration?: AppliedMigration
): string | undefined {
    return appliedMigration?.version ?? resolvedMigration?.version;
}
export function generateDescription(
    resolvedMigration?: ResolvedMigration,
    appliedMigration?: AppliedMigration
): string | undefined {
    return appliedMigration?.description ?? resolvedMigration?.description;
}

export function generateInstalledOn(
    resolvedMigration?: ResolvedMigration,
    appliedMigration?: AppliedMigration
): Date | undefined {
    return appliedMigration?.installedOn;
}

export function generateState(
    context: MigrationInfoContext,
    outOfOrder: boolean,
    resolvedMigration?: ResolvedMigration,
    appliedMigration?: AppliedMigration
): MigrationStateInfo | undefined {
    if (!appliedMigration) {
        if (resolvedMigration?.version) {
            if (resolvedMigration?.version < context.baseline) {
                return MigrationStateInfo.get(MigrationStates.BELOW_BASELINE);
            }
            if (outOfOrder && resolvedMigration?.version < context.lastApplied) {
                return MigrationStateInfo.get(MigrationStates.IGNORED);
            }
        }
        return MigrationStateInfo.get(MigrationStates.PENDING);
    }

    if (!resolvedMigration) {
        const version = generateVersion(resolvedMigration, appliedMigration) ?? '';
        if (!appliedMigration.version || version < context.lastResolved) {
            if (appliedMigration?.success) {
                return MigrationStateInfo.get(MigrationStates.MISSING_SUCCESS);
            }
            return MigrationStateInfo.get(MigrationStates.MISSING_FAILED);
        } else {
            if (appliedMigration.success) {
                return MigrationStateInfo.get(MigrationStates.FUTURE_SUCCESS);
            }
            return MigrationStateInfo.get(MigrationStates.FUTURE_FAILED);
        }
    }

    if (!appliedMigration?.success) {
        return MigrationStateInfo.get(MigrationStates.FAILED);
    }

    if (outOfOrder) {
        return MigrationStateInfo.get(MigrationStates.OUT_OF_ORDER);
    }
    return MigrationStateInfo.get(MigrationStates.SUCCESS);
}

export type MigrationInfo = {
    resolvedMigration?: ResolvedMigration;
    appliedMigration?: AppliedMigration;
    context: MigrationInfoContext;
    outOfOrder: boolean;
    type?: MigrationType;
    version?: string;
    description?: string;
    installedOn?: Date;
    state?: MigrationStateInfo;
    baseline: boolean;
};

export function generateMigrationInfo(
    context: MigrationInfoContext,
    outOfOrder: boolean,
    resolvedMigration?: ResolvedMigration,
    appliedMigration?: AppliedMigration
): MigrationInfo {
    return {
        resolvedMigration: resolvedMigration,
        appliedMigration: appliedMigration,
        context,
        outOfOrder,
        type: generateType(resolvedMigration, appliedMigration),
        description: generateDescription(resolvedMigration, appliedMigration),
        version: generateVersion(resolvedMigration, appliedMigration),
        installedOn: generateInstalledOn(resolvedMigration, appliedMigration),
        state: generateState(context, outOfOrder, resolvedMigration, appliedMigration),
        baseline: context.baseline === generateVersion(resolvedMigration, appliedMigration)
    };
}
