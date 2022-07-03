import { Count as Count6 } from 'es6/api/requestParams';
import { Count as Count7 } from 'es7/api/requestParams';
import { CountRequest, long } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { DocumentsCountError } from '../../../context/error/DocumentsCountError';
import { Context as Context7, RequestBody as RequestBody7 } from 'es7/lib/Transport';
import { EsConnection } from '../types';

type CountResponse = {
    count: long;
};

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {Count6 | Count7 | CountRequest} request request param
 */
export const countApi = (
    connection: EsConnection,
    request: Count6 | Count7 | CountRequest
): Promise<number> => {
    const param = { client: connection.client, request };

    if (isE6Client<Count6, Count7, CountRequest>(param, connection.version)) {
        return param.client
            .count(param.request)
            .then((value) => value.body.count as number)
            .catch((reason) => {
                throw new DocumentsCountError(reason);
            });
    } else if (isE7Client<Count6, Count7, CountRequest>(param, connection.version)) {
        return param.client
            .count<CountResponse, RequestBody7, Context7>(param.request)
            .then((value) => value.body.count)
            .catch((reason) => {
                throw new DocumentsCountError(reason);
            });
    } else if (isE8Client<Count6, Count7, CountRequest>(param, connection.version)) {
        return param.client
            .count(param.request)
            .then((value) => value.count)
            .catch((reason) => {
                throw new DocumentsCountError(reason);
            });
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
