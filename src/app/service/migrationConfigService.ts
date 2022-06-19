import { MigrationConfig, Version } from '../types';
import { UnsupportedVersionError } from '../context/error/UnsupportedVersionError';
import { SettingNotFoundError } from '../context/error/SettingNotFoundError';

const isSupportVersionFormat = (version: string): version is Version =>
    version.match(/^(v\d+.\d+.\d+)/) !== null;

export const getBaselineVersion = (
    targetName: string,
    config: Required<MigrationConfig>
): Version => {
    const baseline = config.migration.baselineVersion[targetName];

    if (baseline === undefined) {
        throw new SettingNotFoundError(
            `The baseline setting for index(${targetName}) does not exist.`
        );
    }

    return isSupportVersionFormat(baseline)
        ? baseline
        : (() => {
              throw new UnsupportedVersionError(
                  `Baseline(${baseline}) version format is an unsupported format. Supported version format: v\\d+.\\d+.\\d+`
              );
          })();
};
