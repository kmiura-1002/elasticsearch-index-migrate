import { IndicesExists as IndicesExists6 } from 'es6/api/requestParams';
import { IndicesExists as IndicesExists7 } from 'es7/api/requestParams';
import { IndicesExistsRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { EsConnection } from '../types';

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {IndicesExists6 | IndicesExists7 | IndicesExistsRequest} request request param
 */
export const existsApi = (
    connection: EsConnection,
    request: IndicesExists6 | IndicesExists7 | IndicesExistsRequest
): Promise<boolean> => {
    const param = { client: connection.client, request };

    if (
        isE6Client<IndicesExists6, IndicesExists7, IndicesExistsRequest>(param, connection.version)
    ) {
        return param.client.indices.exists(param.request).then((value) => value.body);
    } else if (
        isE7Client<IndicesExists6, IndicesExists7, IndicesExistsRequest>(param, connection.version)
    ) {
        return param.client.indices.exists(param.request).then((value) => value.body);
    } else if (
        isE8Client<IndicesExists6, IndicesExists7, IndicesExistsRequest>(param, connection.version)
    ) {
        return param.client.indices.exists(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
