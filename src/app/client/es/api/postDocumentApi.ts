import { Index as Index6 } from 'es6/api/requestParams';
import { Index as Index7 } from 'es7/api/requestParams';
import { IndexRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { EsConnection, WriteResponse } from '../types';
import { Context, RequestBody } from 'es7/lib/Transport';

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {Index6 | Index7 | IndexRequest} request request param
 */
export const postDocumentApi = (
    connection: EsConnection,
    request: Index6 | Index7 | IndexRequest
): Promise<WriteResponse> => {
    const param = { client: connection.client, request };

    if (isE6Client<Index6, Index7, IndexRequest>(param, connection.version)) {
        return param.client
            .index({
                ...param.request,
                type: param.request.type ? param.request.type : '_doc'
            })
            .then((value) => value.body);
    } else if (isE7Client<Index6, Index7, IndexRequest>(param, connection.version)) {
        return param.client
            .index<WriteResponse, RequestBody, Context>(param.request)
            .then((value) => value.body);
    } else if (isE8Client<Index6, Index7, IndexRequest>(param, connection.version)) {
        return param.client.index(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
