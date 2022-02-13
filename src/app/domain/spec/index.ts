import { MIGRATE_HISTORY_INDEX_NAME } from '../../types';

export type MigrateHistorySpec = {
    condition: any;
};

export const migrateHistorySpecByIndexName = (
    index: string,
    baselineVersion: string,
    page?: {
        from?: number;
        size?: number;
    }
): MigrateHistorySpec => {
    return {
        condition: {
            index: MIGRATE_HISTORY_INDEX_NAME,
            size: page?.size,
            from: page?.from,
            body: {
                sort: [
                    {
                        migrate_version: {
                            order: 'asc'
                        }
                    }
                ],
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    index_name: {
                                        value: index
                                    }
                                }
                            },
                            {
                                term: {
                                    migrate_version: {
                                        value: baselineVersion
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        }
    };
};
