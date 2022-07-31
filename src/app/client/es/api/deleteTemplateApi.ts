import { IndicesDeleteTemplate as IndicesDeleteTemplate6 } from 'es6/api/requestParams';
import { IndicesDeleteTemplate as IndicesDeleteTemplate7 } from 'es7/api/requestParams';
import { IndicesDeleteTemplateRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { AcknowledgedResponse, EsConnection } from '../types';
import { Context as Context7 } from 'es7/lib/Transport';

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {IndicesDeleteTemplate6 | IndicesDeleteTemplate7 | IndicesDeleteTemplateRequest} request request param
 */
export const deleteTemplateApi = (
    connection: EsConnection,
    request: IndicesDeleteTemplate6 | IndicesDeleteTemplate7 | IndicesDeleteTemplateRequest
): Promise<AcknowledgedResponse> => {
    const param = { client: connection.client, request };

    if (
        isE6Client<IndicesDeleteTemplate6, IndicesDeleteTemplate7, IndicesDeleteTemplateRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices.delete_template(param.request).then((value) => value.body);
    } else if (
        isE7Client<IndicesDeleteTemplate6, IndicesDeleteTemplate7, IndicesDeleteTemplateRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices
            .deleteTemplate<AcknowledgedResponse, Context7>(param.request)
            .then((value) => value.body);
    } else if (
        isE8Client<IndicesDeleteTemplate6, IndicesDeleteTemplate7, IndicesDeleteTemplateRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices.deleteTemplate(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
