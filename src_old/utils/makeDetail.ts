import { MigrationPlanDetail } from '../model/types';
import { format } from 'date-fns';
import { MigrationPlan } from '../executor/plan/MigrationPlan';

function getVersion(migrationPlan: MigrationPlan) {
    return migrationPlan.version ?? '';
}

export function formatDateAsIsoString(date?: Date): string {
    return date ? format(date, "yyyy-MM-dd'T'HH:mm:ss") : '';
}

export default function makeDetail(migrationPlans: MigrationPlan[]): MigrationPlanDetail[] {
    return migrationPlans.map(
        (value) =>
            ({
                version: getVersion(value),
                description: value.description ?? '',
                type: value.type ?? '',
                installedOn: formatDateAsIsoString(value.installedOn),
                state: value.state?.status ?? ''
            } as MigrationPlanDetail)
    );
}
