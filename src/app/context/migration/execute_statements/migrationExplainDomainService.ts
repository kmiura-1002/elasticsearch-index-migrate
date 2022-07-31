import {
    ESConfig,
    MigrationData,
    MigrationType,
    MigrationTypes,
    RequiredMigrationData,
    Version
} from '../../../types';
import { migrationScriptFileRepository } from '../script_file/migrationScriptFileRepository';
import { MigrationScriptFileSpecByLocation } from '../script_file/spec';
import { migrationHistoryRepository } from '../history/migrationHistoryRepository';
import { migrateHistorySpecByIndexName } from '../history/spec';
import { MigrationExplainDataEntity } from './migrationExplainDataEntity';
import { compare, valid } from 'semver';
import { UnknownMigrationTargetError } from '../../../error/unknownMigrationTargetError';
import { UnsupportedVersionError } from '../../../error/unsupportedVersionError';

// TODO duplicate code
const isSupportVersionFormat = (version: string): version is Version =>
    version.match(/^(v\d+.\d+.\d+)/) !== null;
const isRequiredMigrationData = (v: MigrationData): v is RequiredMigrationData =>
    v.version !== undefined;
const validateInputData = (
    targetName: string,
    migrationData: MigrationData[],
    locations: string[]
) => {
    if (migrationData.length === 0) {
        throw new UnknownMigrationTargetError(
            `There is no migration target for ${targetName} in ${locations.join()}.`
        );
    }
    if (migrationData.map((value) => value.version).includes(undefined)) {
        throw new UnsupportedVersionError(
            'There is a migration file of unknown version.\n' +
                `Unknown version files: ${migrationData
                    .filter((value) => value.version === undefined)
                    .map((value) => value.physicalLocation.name)
                    .join(', ')}`
        );
    }
};
export const migrationExplainDomainService = async (
    targetName: string,
    baseline: Version,
    migrationTargetLocations: string[],
    elasticsearchConfig: ESConfig
): Promise<Map<Version, MigrationExplainDataEntity>> => {
    const migrationPlanMap = new Map<Version, MigrationExplainDataEntity>();
    const migrationData = migrationScriptFileRepository().findByAll(
        new MigrationScriptFileSpecByLocation(targetName, migrationTargetLocations)
    );
    const histories = await migrationHistoryRepository(elasticsearchConfig).findBy(
        migrateHistorySpecByIndexName(targetName, baseline, { size: 10000 })
    );
    validateInputData(
        targetName,
        migrationData.map((value) => value.migrationData),
        migrationTargetLocations
    );
    const appliedMigrationVersions = histories
        .map((value) => value.migrateVersion)
        .filter((value) => valid(value) && isSupportVersionFormat(value))
        .map((value) => value as Version)
        .sort((a, b) => compare(a, b));
    const resolvedMigrationVersions = migrationData
        .map((value) => value.version)
        .filter((v: Version | undefined): v is Version => v !== undefined)
        .filter((value) => valid(value) && isSupportVersionFormat(value))
        .map((value) => value as Version)
        .sort((a, b) => compare(a, b));
    const lastResolved = resolvedMigrationVersions[resolvedMigrationVersions.length - 1];
    const lastApplied = appliedMigrationVersions[appliedMigrationVersions.length - 1];
    migrationData
        .map((value) => value.migrationData)
        .filter(isRequiredMigrationData)
        .forEach((value) => {
            const migrationPlan = migrationPlanMap.get(value.version);
            if (migrationPlan) {
                // Overwrites the same version of the migration file, if any
                migrationPlanMap.set(
                    value.version,
                    MigrationExplainDataEntity.generateExecuteStatement(
                        baseline,
                        lastResolved,
                        lastApplied,
                        value,
                        migrationPlan.appliedMigration
                    )
                );
                migrationPlan.updateResolvedMigration(value);
            } else {
                migrationPlanMap.set(
                    value.version,
                    MigrationExplainDataEntity.generateExecuteStatement(
                        baseline,
                        lastResolved,
                        lastApplied,
                        value
                    )
                );
            }
        });
    histories.forEach((value) => {
        const migrationPlan = migrationPlanMap.get(value.migrateVersion);
        const appliedMigration = {
            version: value.migrateVersion,
            description: value.description,
            type: MigrationTypes[value.scriptType as MigrationType],
            script: value.scriptName,
            installedOn: new Date(value.installedOn),
            executionTime: value.executionTime,
            success: value.isSuccess,
            checksum: value.checksum ?? ''
        };
        if (migrationPlan) {
            migrationPlanMap.set(
                value.migrateVersion,
                MigrationExplainDataEntity.generateExecuteStatement(
                    baseline,
                    lastResolved,
                    lastApplied,
                    migrationPlan.resolvedMigration,
                    appliedMigration
                )
            );
        } else {
            migrationPlanMap.set(
                value.migrateVersion,
                MigrationExplainDataEntity.generateExecuteStatement(
                    baseline,
                    lastResolved,
                    lastApplied,
                    undefined,
                    appliedMigration
                )
            );
        }
    });

    return migrationPlanMap;
};
