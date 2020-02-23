import { MigrationInfoDetail } from '../model/types';
import { format } from 'date-fns';
import MigrationInfo from '../executor/info/MigrationInfo';

function getVersion(migrationInfo: MigrationInfo) {
    return migrationInfo.getVersion() == null ? '' : migrationInfo.getVersion();
}

function formatDateAsIsoString(date?: Date) {
    return date ? format(date, 'yyyy/MM/dd HH:mm:ss') : '';
}

export default function makeDetail(migrationInfos: MigrationInfo[]): MigrationInfoDetail[] {
    return migrationInfos.map(
        (value) =>
            ({
                version: getVersion(value) ?? '',
                description: value.getDescription() ?? '',
                type: value.getType() ?? '',
                installedOn: formatDateAsIsoString(value.getInstalledOn()),
                state: value.getState()?.status ?? ''
            } as MigrationInfoDetail)
    );
}
