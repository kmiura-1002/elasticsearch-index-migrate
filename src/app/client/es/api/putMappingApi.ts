import { IndicesPutMapping as IndicesPutMapping6 } from 'es6/api/requestParams';
import { IndicesPutMapping as IndicesPutMapping7 } from 'es7/api/requestParams';
import { IndicesPutMappingRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { AcknowledgedResponse, EsConnection } from '../types';
import { Context as Context7, RequestBody as RequestBody7 } from 'es7/lib/Transport';

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {IndicesPutMapping6 | IndicesPutMapping7 | IndicesPutMappingRequest} request request param
 */
export const putMappingApi = (
    connection: EsConnection,
    request: IndicesPutMapping6 | IndicesPutMapping7 | IndicesPutMappingRequest
): Promise<AcknowledgedResponse> => {
    const param = { client: connection.client, request };

    if (
        isE6Client<IndicesPutMapping6, IndicesPutMapping7, IndicesPutMappingRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices
            .putMapping({
                ...param.request,
                type: param.request.type ? param.request.type : '_doc'
            })
            .then((value) => value.body);
    } else if (
        isE7Client<IndicesPutMapping6, IndicesPutMapping7, IndicesPutMappingRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices
            .putMapping<AcknowledgedResponse, RequestBody7, Context7>(param.request)
            .then((value) => value.body);
    } else if (
        isE8Client<IndicesPutMapping6, IndicesPutMapping7, IndicesPutMappingRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices
            .putMapping(param.request)
            .then(({ acknowledged }) => ({ acknowledged }));
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
