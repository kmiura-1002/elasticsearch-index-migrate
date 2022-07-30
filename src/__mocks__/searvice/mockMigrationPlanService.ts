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
        refresh: () =>
            Promise.resolve({
                all: [
                    {
                        version: 'v1.0.0',
                        type: 'CREATE_INDEX',
                        description: 'description',
                        installedOn: new Date('2022-01-01T09:00:00'),
                        state: {
                            status: 'SUCCESS',
                            displayName: 'v1.0.0',
                            resolved: false,
                            applied: true,
                            failed: false
                        }
                    }
                ],
                pending: [
                    {
                        version: 'v1.0.0',
                        type: 'CREATE_INDEX',
                        description: 'description',
                        installedOn: new Date('2022-01-01T09:00:00'),
                        state: {
                            status: 'SUCCESS',
                            displayName: 'v1.0.0',
                            resolved: false,
                            applied: true,
                            failed: false
                        }
                    }
                ]
            }),
        validate: () => Promise.resolve()
    };
}
