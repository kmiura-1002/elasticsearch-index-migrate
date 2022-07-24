import { MigrationConfig, MigrationExecuteConfig } from '../../app/types';

export const getMockMigrationPlanService = jest
    .fn()
    .mockImplementation(() =>
        migrationPlanService('', {} as MigrationExecuteConfig, {} as Required<MigrationConfig>)
    );

function migrationPlanService(
    _targetName: string,
    _executeConfig: MigrationExecuteConfig,
    _config: Required<MigrationConfig>
) {
    return {
        refresh: () => Promise.resolve(),
        validate: () => Promise.resolve()
    };
}
