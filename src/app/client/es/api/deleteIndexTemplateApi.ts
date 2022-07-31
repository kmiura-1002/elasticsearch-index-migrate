import { Generic as Generic6 } from 'es6/api/requestParams';
import { IndicesDeleteIndexTemplate as IndicesDeleteIndexTemplate7 } from 'es7/api/requestParams';
import { IndicesDeleteIndexTemplateRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { AcknowledgedResponse, EsConnection } from '../types';
import { Context as Context7 } from 'es7/lib/Transport';
import { UnsupportedVersionError } from '../../../error/unsupportedVersionError';

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {Generic6 | IndicesPutTemplate7 | IndicesDeleteIndexTemplateRequest} request request param
 */
export const deleteIndexTemplateApi = (
    connection: EsConnection,
    request: Generic6 | IndicesDeleteIndexTemplate7 | IndicesDeleteIndexTemplateRequest
): Promise<AcknowledgedResponse> => {
    const param = { client: connection.client, request };

    if (
        isE6Client<Generic6, IndicesDeleteIndexTemplate7, IndicesDeleteIndexTemplateRequest>(
            param,
            connection.version
        )
    ) {
        throw new UnsupportedVersionError(
            'Index Template API is not supported in elasticsearch6.x'
        );
    } else if (
        isE7Client<Generic6, IndicesDeleteIndexTemplate7, IndicesDeleteIndexTemplateRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices
            .deleteIndexTemplate<AcknowledgedResponse, Context7>(param.request)
            .then((value) => value.body);
    } else if (
        isE8Client<Generic6, IndicesDeleteIndexTemplate7, IndicesDeleteIndexTemplateRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices.deleteIndexTemplate(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
