import { IndicesGetMapping as IndicesGetMapping6 } from 'es6/api/requestParams';
import { IndicesGetMapping as IndicesGetMapping7 } from 'es7/api/requestParams';
import { IndicesGetMappingRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { EsConnection, MappingResponse, Record } from '../types';

const convertResponse = (response: Record<string, any>) =>
    Object.keys(response)
        .map((key) => ({
            [key]: response[key].mappings.properties
        }))
        .reduce((previousValue, currentValue) => ({ ...previousValue, ...currentValue }));

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {IndicesGetMapping6 | IndicesGetMapping7 | IndicesGetMappingRequest} request request param
 */
export const getMappingApi = (
    connection: EsConnection,
    request: IndicesGetMapping6 | IndicesGetMapping7 | IndicesGetMappingRequest
): Promise<MappingResponse> => {
    const param = { client: connection.client, request };

    if (
        isE6Client<IndicesGetMapping6, IndicesGetMapping7, IndicesGetMappingRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices.getMapping(param.request).then((value) =>
            Object.keys(value.body)
                .map((key) => ({
                    [key]: value.body[key]
                }))
                .reduce((previousValue, currentValue) => ({ ...previousValue, ...currentValue }))
        );
    } else if (
        isE7Client<IndicesGetMapping6, IndicesGetMapping7, IndicesGetMappingRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices
            .getMapping(param.request)
            .then((value) => convertResponse(value.body));
    } else if (
        isE8Client<IndicesGetMapping6, IndicesGetMapping7, IndicesGetMappingRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices.getMapping(param.request).then(convertResponse);
    }

    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
