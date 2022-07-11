import { TsjsonParser } from 'ts-json-validator';
import { createSchema as S } from 'ts-json-validator/dist/json-schema';

export const isAssumedSetting = (configValue: any): boolean => configParser.validates(configValue);

const configParser = new TsjsonParser(
    S({
        type: 'object',
        maxProperties: 2,
        additionalProperties: S(false),
        properties: {
            elasticsearch: S({
                type: 'object',
                maxProperties: 3,
                properties: {
                    searchEngine: S({
                        type: 'string',
                        enum: ['opensearch', 'elasticsearch'] as const
                    }),
                    version: S({ type: 'string' }),
                    connect: S({
                        type: 'object',
                        properties: {
                            host: S({ type: 'string' }),
                            sslCa: S({ type: 'string' }),
                            cloudId: S({ type: 'string' }),
                            username: S({ type: 'string' }),
                            password: S({ type: 'string' }),
                            insecure: S({ type: 'boolean' })
                        }
                    })
                },
                required: ['searchEngine', 'version', 'connect']
            }),
            migration: S({
                type: 'object',
                maxProperties: 5,
                properties: {
                    location: S({ type: 'string' }),
                    baselineVersions: S({
                        type: 'object',
                        propertyNames: S({
                            type: 'string'
                        }),
                        additionalProperties: S({ type: 'string' })
                    }),
                    baselineVersion: S({ type: 'string' }),
                    historyIndexRequestBody: S({ type: 'object' }),
                    lockIndexRequestBody: S({ type: 'object' })
                },
                required: ['location']
            })
        }
    }),
    { removeAdditional: true }
);
