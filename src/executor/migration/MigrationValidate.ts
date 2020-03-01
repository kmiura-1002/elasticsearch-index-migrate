import MigrationInfoExecutor from '../info/MigrationInfoExecutor';
import { MigrationState } from '../../model/types';
import { generateDescription, generateVersion, MigrationInfo } from '../info/MigrationInfo';

export function migrationInfoValidate(migrateInfo: MigrationInfo): string | undefined {
    const version = generateVersion(migrateInfo.resolvedMigration, migrateInfo.appliedMigration);
    const description =
        generateDescription(migrateInfo.resolvedMigration, migrateInfo.appliedMigration) ??
        '[empty description]';

    if (!version) {
        return 'Unknown version migration detected';
    }

    if (MigrationState.IGNORED === migrateInfo.state?.status) {
        return `Resolved migrations detected have not been applied to the index (${version})`;
    }

    if (migrateInfo.state?.failed && MigrationState.FUTURE_FAILED !== migrateInfo.state?.status) {
        return `Failed migration to version ${version}(${description}) detected`;
    }

    if (
        !migrateInfo.resolvedMigration &&
        MigrationState.MISSING_SUCCESS !== migrateInfo.state?.status &&
        MigrationState.MISSING_FAILED !== migrateInfo.state?.status &&
        MigrationState.FUTURE_SUCCESS !== migrateInfo.state?.status &&
        MigrationState.FUTURE_FAILED !== migrateInfo.state?.status
    ) {
        return `Applied migration detected not resolved locally (${version})`;
    }

    if (
        migrateInfo.resolvedMigration &&
        migrateInfo.appliedMigration &&
        migrateInfo.resolvedMigration.type !== migrateInfo.appliedMigration.type
    ) {
        return `Migration type mismatch for migration ${version}`;
    }
    return undefined;
}

/**
 * returns an error message
 * @param migrateInfo
 */
export function doValidate(migrateInfo: MigrationInfoExecutor): string[] {
    return migrateInfo
        .all()
        .map(migrationInfoValidate)
        .filter((value) => value) as string[];
}
