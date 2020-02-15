import { DumpColumn, MigrationInfo } from '../../model/types';
import { format } from 'date-fns';

function getVersion(migrationInfo: MigrationInfo) {
    return migrationInfo.getVersion() == null ? '' : migrationInfo.getVersion();
}

function formatDateAsIsoString(date?: Date) {
    return date ? format(date, 'YYYY/MM/DD HH:mm:ss') : '';
}

export default function dump(migrationInfos: MigrationInfo[]): DumpColumn[] {
    return migrationInfos.map(
        (value) =>
            ({
                version: getVersion(value) ?? '',
                description: value.getDescription() ?? '',
                type: value.getType() ?? '',
                installedOn: formatDateAsIsoString(value.getInstalledOn()),
                state: value.getState()?.status ?? ''
            } as DumpColumn)
    );
}
