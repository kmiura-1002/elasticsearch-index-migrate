import { IndicesPutTemplate as IndicesPutTemplate6 } from 'es6/api/requestParams';
import { IndicesPutTemplate as IndicesPutTemplate7 } from 'es7/api/requestParams';
import { IndicesPutTemplateRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { AcknowledgedResponse, EsConnection } from '../types';
import { Context as Context7, RequestBody as RequestBody7 } from 'es7/lib/Transport';

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {IndicesPutTemplate6 | IndicesPutTemplate7 | IndicesPutTemplateRequest} request request param
 */
export const putTemplateApi = (
    connection: EsConnection,
    request: IndicesPutTemplate6 | IndicesPutTemplate7 | IndicesPutTemplateRequest
): Promise<AcknowledgedResponse> => {
    const param = { client: connection.client, request };

    if (
        isE6Client<IndicesPutTemplate6, IndicesPutTemplate7, IndicesPutTemplateRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices.put_template(param.request).then((value) => value.body);
    } else if (
        isE7Client<IndicesPutTemplate6, IndicesPutTemplate7, IndicesPutTemplateRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices
            .putTemplate<AcknowledgedResponse, RequestBody7, Context7>(param.request)
            .then((value) => value.body);
    } else if (
        isE8Client<IndicesPutTemplate6, IndicesPutTemplate7, IndicesPutTemplateRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices.putTemplate(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
