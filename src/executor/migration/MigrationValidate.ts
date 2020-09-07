import { MigrationPlanExecutorRet, MigrationStates } from '../../model/types';
import { generateDescription, generateVersion, MigrationPlan } from '../plan/MigrationPlan';
import valid from 'semver/functions/valid';

export function migrationPlanValidate(migratePlan: MigrationPlan): string | undefined {
    const version = generateVersion(migratePlan.resolvedMigration, migratePlan.appliedMigration);
    const description =
        generateDescription(migratePlan.resolvedMigration, migratePlan.appliedMigration) ??
        '[empty description]';

    if (!valid(version)) {
        return 'Unknown version migration detected';
    }

    if (MigrationStates.IGNORED === migratePlan.state?.status) {
        return `Resolved migrations detected have not been applied to the index (${version})`;
    }

    if (migratePlan.state?.failed && MigrationStates.FUTURE_FAILED !== migratePlan.state?.status) {
        return `Failed migration to version ${version}(${description}) detected`;
    }

    if (
        !migratePlan.resolvedMigration &&
        MigrationStates.BASELINE !== migratePlan.state?.status &&
        MigrationStates.MISSING_SUCCESS !== migratePlan.state?.status &&
        MigrationStates.MISSING_FAILED !== migratePlan.state?.status &&
        MigrationStates.FUTURE_SUCCESS !== migratePlan.state?.status &&
        MigrationStates.FUTURE_FAILED !== migratePlan.state?.status
    ) {
        return `Applied migration detected not resolved locally (${version})`;
    }

    if (
        migratePlan.resolvedMigration &&
        migratePlan.appliedMigration &&
        migratePlan.resolvedMigration.type !== migratePlan.appliedMigration.type
    ) {
        return `Migration type mismatch for migration ${version}`;
    }
    return undefined;
}

/**
 * returns an error message
 * @param migrateInfo
 */
export function doValidate(migrateInfo: MigrationPlanExecutorRet): string[] {
    return migrateInfo.all.map(migrationPlanValidate).filter((value) => value) as string[];
}
