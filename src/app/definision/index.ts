import { MigrationExecuteConfig } from '../types';

export const defaultPlanExecutionConfig = (): MigrationExecuteConfig => ({
    outOfOrder: false,
    pending: true,
    missing: true,
    ignored: true,
    future: true
});
