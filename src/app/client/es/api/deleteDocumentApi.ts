import { Delete as Delete6 } from 'es6/api/requestParams';
import { Delete as Delete7 } from 'es7/api/requestParams';
import { DeleteRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { EsConnection, WriteResponse } from '../types';
import { RequestBody } from 'es7/lib/Transport';

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {Delete6 | Delete7 | DeleteRequest} request request param
 */
export const deleteDocumentApi = (
    connection: EsConnection,
    request: Delete6 | Delete7 | DeleteRequest
): Promise<WriteResponse> => {
    const param = { client: connection.client, request };

    if (isE6Client<Delete6, Delete7, DeleteRequest>(param, connection.version)) {
        return param.client.delete(param.request).then((value) => value.body);
    } else if (isE7Client<Delete6, Delete7, DeleteRequest>(param, connection.version)) {
        return param.client
            .delete<WriteResponse, RequestBody>(param.request)
            .then((value) => value.body);
    } else if (isE8Client<Delete6, Delete7, DeleteRequest>(param, connection.version)) {
        return param.client.delete(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
