import { IndicesCreate as IndicesCreate6 } from 'es6/api/requestParams';
import { IndicesCreate as IndicesCreate7 } from 'es7/api/requestParams';
import { IndicesCreateRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { AcknowledgedResponse, EsConnection } from '../types';
import { CreateIndexError } from '../../../error/CreateIndexError';
import { Context as Context7, RequestBody as RequestBody7 } from 'es7/lib/Transport';

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {IndicesCreate6 | IndicesCreate7 | IndicesCreateRequest} request request param
 */
export const createIndexApi = (
    connection: EsConnection,
    request: IndicesCreate6 | IndicesCreate7 | IndicesCreateRequest
): Promise<AcknowledgedResponse> => {
    const param = { client: connection.client, request };

    if (
        isE6Client<IndicesCreate6, IndicesCreate7, IndicesCreateRequest>(param, connection.version)
    ) {
        return param.client.indices
            .create(param.request)
            .then((value) => value.body as AcknowledgedResponse)
            .catch((reason) => {
                throw new CreateIndexError(reason);
            });
    } else if (
        isE7Client<IndicesCreate6, IndicesCreate7, IndicesCreateRequest>(param, connection.version)
    ) {
        return param.client.indices
            .create<AcknowledgedResponse, RequestBody7, Context7>(param.request)
            .then((value) => value.body)
            .catch((reason) => {
                throw new CreateIndexError(reason);
            });
    } else if (
        isE8Client<IndicesCreate6, IndicesCreate7, IndicesCreateRequest>(param, connection.version)
    ) {
        return param.client.indices
            .create(param.request)
            .then(({ acknowledged }) => ({ acknowledged }))
            .catch((reason) => {
                throw new CreateIndexError(reason);
            });
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
