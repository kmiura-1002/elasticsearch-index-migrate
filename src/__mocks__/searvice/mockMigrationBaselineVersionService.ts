import * as Config from '@oclif/core';

export const getMockMigrationBaselineVersionService = jest
    .fn()
    .mockImplementation(() => migrationBaselineVersionService({}, {} as Config.Config));

function migrationBaselineVersionService(_flags: { [name: string]: any }, _config: Config.Config) {
    return {
        makeBaseline: () => Promise.resolve()
    };
}
