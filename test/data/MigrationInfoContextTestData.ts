import { MigrationInfoContext } from '../../src/model/types';

export const migrationInfoContext: MigrationInfoContext = {
    outOfOrder: true,
    pending: true,
    missing: true,
    ignored: true,
    future: true,
    baseline: 'v1.0.0',
    lastResolved: '',
    lastApplied: ''
};
