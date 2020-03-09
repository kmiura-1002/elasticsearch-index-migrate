import { MigrationInfoDetail } from '../model/types';
import { format } from 'date-fns';
import { MigrationInfo } from '../executor/info/MigrationInfo';

function getVersion(migrationInfo: MigrationInfo) {
    return migrationInfo.version == null ? '' : migrationInfo.version;
}

export function formatDateAsIsoString(date?: Date) {
    return date ? format(date, 'yyyy-MM-dd HH:mm:ss') : '';
}

export default function makeDetail(migrationInfos: MigrationInfo[]): MigrationInfoDetail[] {
    return migrationInfos.map(
        (value) =>
            ({
                version: getVersion(value) ?? '',
                description: value.description ?? '',
                type: value.type ?? '',
                installedOn: formatDateAsIsoString(value.installedOn),
                state: value.baseline ? 'BASELINE' : value.state?.status ?? ''
            } as MigrationInfoDetail)
    );
}
