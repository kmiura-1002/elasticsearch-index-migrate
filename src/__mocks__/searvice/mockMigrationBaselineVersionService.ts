import * as Config from '@oclif/config';

export const getMockMigrationBaselineVersionService = jest
    .fn()
    .mockImplementation(() => migrationBaselineVersionService({}, {} as Config.IConfig));

function migrationBaselineVersionService(_flags: { [name: string]: any }, _config: Config.IConfig) {
    return {
        makeBaseline: () => Promise.resolve()
    };
}
