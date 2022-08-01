import { Generic as Generic6 } from 'es6/api/requestParams';
import { IndicesPutIndexTemplate as IndicesPutIndexTemplate7 } from 'es7/api/requestParams';
import { IndicesPutIndexTemplateRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { AcknowledgedResponse, EsConnection } from '../types';
import { Context as Context7, RequestBody as RequestBody7 } from 'es7/lib/Transport';
import { UnsupportedVersionError } from '../../../error/unsupportedVersionError';

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {Generic6 | IndicesPutTemplate7 | IndicesPutIndexTemplateRequest} request request param
 */
export const putIndexTemplateApi = (
    connection: EsConnection,
    request: Generic6 | IndicesPutIndexTemplate7 | IndicesPutIndexTemplateRequest
): Promise<AcknowledgedResponse> => {
    const param = { client: connection.client, request };

    if (
        isE6Client<Generic6, IndicesPutIndexTemplate7, IndicesPutIndexTemplateRequest>(
            param,
            connection.version
        )
    ) {
        return Promise.reject(
            new UnsupportedVersionError('Index Template API is not supported in elasticsearch6.x')
        );
    } else if (
        isE7Client<Generic6, IndicesPutIndexTemplate7, IndicesPutIndexTemplateRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices
            .putIndexTemplate<AcknowledgedResponse, RequestBody7, Context7>(param.request)
            .then((value) => value.body);
    } else if (
        isE8Client<Generic6, IndicesPutIndexTemplate7, IndicesPutIndexTemplateRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices.putIndexTemplate(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
