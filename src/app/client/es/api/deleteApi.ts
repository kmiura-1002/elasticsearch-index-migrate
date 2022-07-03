import { IndicesDelete as IndicesDelete6 } from 'es6/api/requestParams';
import { IndicesDelete as IndicesDelete7 } from 'es7/api/requestParams';
import { IndicesDeleteRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { IndexDeleteError } from '../../../context/error/IndexDeleteError';
import { AcknowledgedResponse, EsConnection } from '../types';
import { Context as Context7 } from 'es7/lib/Transport';

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {IndicesDelete6 | IndicesDelete7 | IndicesDeleteRequest} request request param
 */
export const deleteApi = (
    connection: EsConnection,
    request: IndicesDelete6 | IndicesDelete7 | IndicesDeleteRequest
): Promise<AcknowledgedResponse> => {
    const param = { client: connection.client, request };

    if (
        isE6Client<IndicesDelete6, IndicesDelete7, IndicesDeleteRequest>(param, connection.version)
    ) {
        return param.client.indices
            .delete(param.request)
            .then((value) => value.body as AcknowledgedResponse)
            .catch((reason) => {
                throw new IndexDeleteError(reason);
            });
    } else if (
        isE7Client<IndicesDelete6, IndicesDelete7, IndicesDeleteRequest>(param, connection.version)
    ) {
        return param.client.indices
            .delete<AcknowledgedResponse, Context7>(param.request)
            .then((value) => value.body)
            .catch((reason) => {
                throw new IndexDeleteError(reason);
            });
    } else if (
        isE8Client<IndicesDelete6, IndicesDelete7, IndicesDeleteRequest>(param, connection.version)
    ) {
        return param.client.indices
            .delete(param.request)
            .then(({ acknowledged }) => ({ acknowledged }))
            .catch((reason) => {
                throw new IndexDeleteError(reason);
            });
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
