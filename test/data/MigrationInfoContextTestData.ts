import { MigrationInfoContext } from '../../src/model/types';

export const migrationInfoContext: MigrationInfoContext = {
    outOfOrder: true,
    pending: true,
    missing: true,
    ignored: true,
    future: true,
    target: '',
    baseline: '',
    lastResolved: '',
    lastApplied: ''
};
