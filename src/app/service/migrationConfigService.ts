import { MigrationConfig, Version } from '../types';

const isSupportVersionFormat = (version: string): version is Version =>
    version.match(/^(v\d+.\d+.\d+)/) !== null;
export const getBaselineVersion = (
    targetName: string,
    config: Required<MigrationConfig>
): Version => {
    const baseline = config.migration.baselineVersion[targetName];

    if (baseline === undefined) {
        // TODO
        throw new Error(`The baseline setting for index(${targetName}) does not exist.`);
    }

    return isSupportVersionFormat(baseline)
        ? baseline
        : (() => {
              // TODO fix error class
              throw new Error(
                  `Baseline(${baseline}) version format is an unsupported format. Supported version format: v\\d+.\\d+.\\d+`
              );
          })();
};
