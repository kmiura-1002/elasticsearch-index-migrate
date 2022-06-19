import {
    AppliedMigration,
    MigrationExecuteConfig,
    MigrationPlanData,
    RequiredMigrationData,
    Version
} from '../../../types';
import { lt } from 'semver';

export class MigrationExplainValidationDomainService {
    static valid(plan: MigrationPlanData, executeConfig: MigrationExecuteConfig) {
        if (plan.state?.failed && !executeConfig.future) {
            if (plan.version) {
                return `Detected failed migrate to version ${plan.version}(${plan.description}).`;
            } else {
                return `Detected failed migrate to unknown version(${plan.description}).`;
            }
        }

        if (
            (!executeConfig.pending && 'PENDING' === plan.state?.status) ||
            (!executeConfig.ignored && 'IGNORED' === plan.state?.status)
        ) {
            if (plan.version) {
                return `Detected version ${plan.version}(${plan.description}) migration not applied to Elasticsearch.`;
            } else {
                return `Detected unknown version(${plan.description}) migration not applied to Elasticsearch.`;
            }
        }

        if (
            plan.resolvedMigration !== undefined &&
            plan.appliedMigration !== undefined &&
            lt(
                plan.baseline,
                generateVersion(plan.resolvedMigration, plan.appliedMigration) ?? ''
            ) &&
            plan.resolvedMigration.checksum !== plan.appliedMigration.checksum
        ) {
            return `Migration checksum mismatch for migration ${plan.resolvedMigration.version}.`;
        }

        return null;
    }
}

const generateVersion = (
    resolvedMigration?: RequiredMigrationData,
    appliedMigration?: AppliedMigration
): Version | undefined => appliedMigration?.version ?? resolvedMigration?.version;
