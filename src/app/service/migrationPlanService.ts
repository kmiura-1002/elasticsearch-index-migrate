import { MigrationConfig } from '../types';

export const migrationPlanService = (
    targetName: string,
    ignoredMigrations: boolean,
    config: Required<MigrationConfig>
) => {
    const makeExecutionPlan = () => {
        const baseline = config.migration.baselineVersion[targetName];

        if (baseline === undefined) {
            throw new Error(`The baseline setting for index(${targetName}) does not exist.`);
        }
    };

    return {
        makeExecutionPlan
    };
};
