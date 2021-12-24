import {
    AppliedMigration,
    MigrationPlanContext,
    MigrationStateInfo,
    MigrationStates,
    MigrationType,
    ResolvedMigration
} from '../../model/types';
import { lt, valid } from 'semver';

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
    context: MigrationPlanContext,
    resolvedMigration?: ResolvedMigration,
    appliedMigration?: AppliedMigration
): MigrationStateInfo | undefined {
    if (!appliedMigration) {
        if (resolvedMigration?.version) {
            if (
                valid(resolvedMigration?.version) &&
                valid(context.baseline) &&
                lt(resolvedMigration?.version, context.baseline)
            ) {
                return MigrationStateInfo.get(MigrationStates.BELOW_BASELINE);
            }
            if (
                valid(resolvedMigration?.version) &&
                valid(context.lastApplied) &&
                lt(resolvedMigration?.version, context.lastApplied)
            ) {
                return MigrationStateInfo.get(MigrationStates.IGNORED);
            }
        }
        return MigrationStateInfo.get(MigrationStates.PENDING);
    }

    if (
        valid(appliedMigration?.version) &&
        valid(context.baseline) &&
        appliedMigration?.version === context.baseline &&
        appliedMigration?.success
    ) {
        return MigrationStateInfo.get(MigrationStates.BASELINE);
    }

    if (!resolvedMigration) {
        const version = generateVersion(resolvedMigration, appliedMigration) ?? '';
        if (
            !appliedMigration.version ||
            (valid(context.lastResolved) && valid(version) && lt(version, context.lastResolved))
        ) {
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

    return MigrationStateInfo.get(MigrationStates.SUCCESS);
}

export type MigrationPlan = {
    resolvedMigration?: ResolvedMigration;
    appliedMigration?: AppliedMigration;
    context: MigrationPlanContext;
    type?: MigrationType;
    version?: string;
    description?: string;
    installedOn?: Date;
    state?: MigrationStateInfo;
    baseline: boolean;
};

export function generateMigrationPlan(
    context: MigrationPlanContext,
    resolvedMigration?: ResolvedMigration,
    appliedMigration?: AppliedMigration
): MigrationPlan {
    return {
        resolvedMigration: resolvedMigration,
        appliedMigration: appliedMigration,
        context,
        type: generateType(resolvedMigration, appliedMigration),
        description: generateDescription(resolvedMigration, appliedMigration),
        version: generateVersion(resolvedMigration, appliedMigration),
        installedOn: generateInstalledOn(resolvedMigration, appliedMigration),
        state: generateState(context, resolvedMigration, appliedMigration),
        baseline: context.baseline === generateVersion(resolvedMigration, appliedMigration)
    };
}
