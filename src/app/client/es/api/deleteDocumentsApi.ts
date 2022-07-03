import { DeleteByQuery as DeleteByQuery6 } from 'es6/api/requestParams';
import { DeleteByQuery as DeleteByQuery7 } from 'es7/api/requestParams';
import { DeleteByQueryRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { Context as Context7, RequestBody as RequestBody7 } from 'es7/lib/Transport';
import { DeleteByQueryResponse, EsConnection } from '../types';

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {DeleteByQuery6 | DeleteByQuery7 | DeleteByQueryRequest} request request param
 */
export const deleteDocumentsApi = (
    connection: EsConnection,
    request: DeleteByQuery6 | DeleteByQuery7 | DeleteByQueryRequest
): Promise<DeleteByQueryResponse> => {
    const param = { client: connection.client, request };

    if (
        isE6Client<DeleteByQuery6, DeleteByQuery7, DeleteByQueryRequest>(param, connection.version)
    ) {
        return param.client.deleteByQuery(param.request).then((value) => value.body);
    } else if (
        isE7Client<DeleteByQuery6, DeleteByQuery7, DeleteByQueryRequest>(param, connection.version)
    ) {
        return param.client
            .deleteByQuery<DeleteByQueryResponse, RequestBody7, Context7>(param.request)
            .then((value) => value.body);
    } else if (
        isE8Client<DeleteByQuery6, DeleteByQuery7, DeleteByQueryRequest>(param, connection.version)
    ) {
        return param.client.deleteByQuery(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
