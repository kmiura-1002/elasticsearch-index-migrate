import { Generic as Generic6 } from 'es6/api/requestParams';
import { ClusterDeleteComponentTemplate as ClusterDeleteComponentTemplate7 } from 'es7/api/requestParams';
import { ClusterDeleteComponentTemplateRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { AcknowledgedResponse, EsConnection } from '../types';
import { Context as Context7 } from 'es7/lib/Transport';
import { UnsupportedVersionError } from '../../../error/unsupportedVersionError';

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {Generic6 | IndicesPutTemplate7 | ClusterDeleteComponentTemplateRequest} request request param
 */
export const deleteComponentTemplateApi = (
    connection: EsConnection,
    request: Generic6 | ClusterDeleteComponentTemplate7 | ClusterDeleteComponentTemplateRequest
): Promise<AcknowledgedResponse> => {
    const param = { client: connection.client, request };

    if (
        isE6Client<
            Generic6,
            ClusterDeleteComponentTemplate7,
            ClusterDeleteComponentTemplateRequest
        >(param, connection.version)
    ) {
        throw new UnsupportedVersionError(
            'Component Template API is not supported in elasticsearch6.x'
        );
    } else if (
        isE7Client<
            Generic6,
            ClusterDeleteComponentTemplate7,
            ClusterDeleteComponentTemplateRequest
        >(param, connection.version)
    ) {
        return param.client.cluster
            .deleteComponentTemplate<AcknowledgedResponse, Context7>(param.request)
            .then((value) => value.body);
    } else if (
        isE8Client<
            Generic6,
            ClusterDeleteComponentTemplate7,
            ClusterDeleteComponentTemplateRequest
        >(param, connection.version)
    ) {
        return param.client.cluster.deleteComponentTemplate(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
