import { IndicesGet as IndicesGet6 } from 'es6/api/requestParams';
import { IndicesGet as IndicesGet7 } from 'es7/api/requestParams';
import { IndicesGetRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { EsConnection, Record } from '../types';

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {IndicesGet6 | IndicesGet7 | IndicesGetRequest} request request param
 */
export const getIndexApi = (
    connection: EsConnection,
    request: IndicesGet6 | IndicesGet7 | IndicesGetRequest
): Promise<Record<string, any>> => {
    const param = { client: connection.client, request };

    if (isE6Client<IndicesGet6, IndicesGet7, IndicesGetRequest>(param, connection.version)) {
        return param.client.indices.get(param.request).then((value) => value.body);
    } else if (isE7Client<IndicesGet6, IndicesGet7, IndicesGetRequest>(param, connection.version)) {
        return param.client.indices.get(param.request).then((value) => value.body);
    } else if (isE8Client<IndicesGet6, IndicesGet7, IndicesGetRequest>(param, connection.version)) {
        return param.client.indices.get(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
