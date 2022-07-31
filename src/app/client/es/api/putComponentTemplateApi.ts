import { Generic as Generic6 } from 'es6/api/requestParams';
import { ClusterPutComponentTemplate as ClusterPutComponentTemplate7 } from 'es7/api/requestParams';
import { ClusterPutComponentTemplateRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { AcknowledgedResponse, EsConnection } from '../types';
import { Context as Context7, RequestBody as RequestBody7 } from 'es7/lib/Transport';
import { UnsupportedVersionError } from '../../../error/unsupportedVersionError';

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {Generic6 | IndicesPutTemplate7 | ClusterPutComponentTemplateRequest} request request param
 */
export const putComponentTemplateApi = (
    connection: EsConnection,
    request: Generic6 | ClusterPutComponentTemplate7 | ClusterPutComponentTemplateRequest
): Promise<AcknowledgedResponse> => {
    const param = { client: connection.client, request };

    if (
        isE6Client<Generic6, ClusterPutComponentTemplate7, ClusterPutComponentTemplateRequest>(
            param,
            connection.version
        )
    ) {
        throw new UnsupportedVersionError(
            'Component Template API is not supported in elasticsearch6.x'
        );
    } else if (
        isE7Client<Generic6, ClusterPutComponentTemplate7, ClusterPutComponentTemplateRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.cluster
            .put_component_template<AcknowledgedResponse, RequestBody7, Context7>(param.request)
            .then((value) => value.body);
    } else if (
        isE8Client<Generic6, ClusterPutComponentTemplate7, ClusterPutComponentTemplateRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.cluster.putComponentTemplate(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
