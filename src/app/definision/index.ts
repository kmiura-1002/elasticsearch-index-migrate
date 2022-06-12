import { MigrationExecuteConfig } from '../types';

export const DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

export const defaultPlanExecutionConfig = (): MigrationExecuteConfig => ({
    outOfOrder: false,
    pending: true,
    missing: true,
    ignored: true,
    future: true
});
