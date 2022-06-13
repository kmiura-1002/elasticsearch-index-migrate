import {
    AppliedMigration,
    MigrationPlanData,
    MigrationStateInfo,
    MigrationStateInfoMap,
    MigrationStates,
    RequiredMigrationData,
    Version
} from '../../../types';
import { Entity } from '../../base/entity';
import { lt, valid } from 'semver';

export class MigrationExecuteStatementDataEntity extends Entity<MigrationPlanData> {
    private constructor(param: MigrationPlanData) {
        super(param);
    }
    static generateExecuteStatement(
        baseline: Version,
        lastResolved: Version,
        lastApplied: Version,
        resolvedMigration?: RequiredMigrationData,
        appliedMigration?: AppliedMigration
    ) {
        return new MigrationExecuteStatementDataEntity({
            resolvedMigration: resolvedMigration,
            appliedMigration: appliedMigration,
            baseline,
            lastResolved,
            lastApplied,
            type: appliedMigration?.type ?? resolvedMigration?.file.type,
            description: appliedMigration?.description ?? resolvedMigration?.file.description,
            version: generateVersion(resolvedMigration, appliedMigration),
            installedOn: appliedMigration?.installedOn,
            state: generateState(
                baseline,
                lastResolved,
                lastApplied,
                resolvedMigration,
                appliedMigration
            ),
            isBaseline: baseline === generateVersion(resolvedMigration, appliedMigration),
            checksum: appliedMigration?.checksum ?? resolvedMigration?.checksum
        });
    }

    updateResolvedMigration(migrationData: RequiredMigrationData) {
        this.props.resolvedMigration = migrationData;
    }

    get version() {
        return this.props.version;
    }
    get description() {
        return this.props.description;
    }
    get state() {
        return this.props.state;
    }
    get baseline() {
        return this.props.baseline;
    }
    get lastResolved() {
        return this.props.lastResolved;
    }
    get lastApplied() {
        return this.props.lastApplied;
    }
    get resolvedMigration() {
        return this.props.resolvedMigration;
    }
    get appliedMigration() {
        return this.props.appliedMigration;
    }
}

const generateVersion = (
    resolvedMigration?: RequiredMigrationData,
    appliedMigration?: AppliedMigration
): Version | undefined => appliedMigration?.version ?? resolvedMigration?.version;

const generateState = (
    baseline: Version,
    lastResolved: Version,
    lastApplied: Version,
    resolvedMigration?: RequiredMigrationData,
    appliedMigration?: AppliedMigration
): MigrationStateInfo | undefined => {
    if (!appliedMigration) {
        if (resolvedMigration?.version) {
            if (
                valid(resolvedMigration?.version) &&
                valid(baseline) &&
                lt(resolvedMigration?.version, baseline)
            ) {
                return MigrationStateInfoMap.get(MigrationStates.BELOW_BASELINE);
            }
            if (
                valid(resolvedMigration?.version) &&
                valid(lastApplied) &&
                lt(resolvedMigration?.version, lastApplied)
            ) {
                return MigrationStateInfoMap.get(MigrationStates.IGNORED);
            }
        }
        return MigrationStateInfoMap.get(MigrationStates.PENDING);
    }

    if (
        valid(appliedMigration?.version) &&
        valid(baseline) &&
        appliedMigration?.version === baseline &&
        appliedMigration?.success
    ) {
        return MigrationStateInfoMap.get(MigrationStates.BASELINE);
    }

    if (!resolvedMigration) {
        const version = generateVersion(resolvedMigration, appliedMigration) ?? '';
        if (
            !appliedMigration.version ||
            (valid(lastResolved) && valid(version) && lt(version, lastResolved))
        ) {
            if (appliedMigration.success) {
                return MigrationStateInfoMap.get(MigrationStates.MISSING_SUCCESS);
            }
            return MigrationStateInfoMap.get(MigrationStates.MISSING_FAILED);
        } else {
            if (appliedMigration.success) {
                return MigrationStateInfoMap.get(MigrationStates.FUTURE_SUCCESS);
            }
            return MigrationStateInfoMap.get(MigrationStates.FUTURE_FAILED);
        }
    }

    if (!appliedMigration?.success) {
        return MigrationStateInfoMap.get(MigrationStates.FAILED);
    }

    return MigrationStateInfoMap.get(MigrationStates.SUCCESS);
};
