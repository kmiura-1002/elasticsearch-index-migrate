import { ClusterHealth as ClusterHealth6 } from 'es6/api/requestParams';
import { ClusterHealth as ClusterHealth7 } from 'es7/api/requestParams';
import { ClusterHealthRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { EsConnection, HealthStatus } from '../types';
import { Health } from '../definitions';

const isHealthStatus = (value: string): value is HealthStatus => {
    return Health.find((health) => value === health) !== undefined;
};

const convertResponse = (value: string) => {
    const status = String(value).toLowerCase();
    return isHealthStatus(status) ? status : 'red';
};

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {ClusterHealth6 | ClusterHealth7 | ClusterHealthRequest} request request param
 */
export const healthCheckApi = (
    connection: EsConnection,
    request?: ClusterHealth6 | ClusterHealth7 | ClusterHealthRequest
): Promise<HealthStatus> => {
    const param = { client: connection.client, request: request ?? {} };

    if (
        isE6Client<ClusterHealth6, ClusterHealth7, ClusterHealthRequest>(param, connection.version)
    ) {
        return param.client.cluster
            .health({ ...param.request })
            .then((value) => convertResponse(value.body.status));
    } else if (
        isE7Client<ClusterHealth6, ClusterHealth7, ClusterHealthRequest>(param, connection.version)
    ) {
        return param.client.cluster
            .health({ ...param.request })
            .then((value) => convertResponse(value.body.status));
    } else if (
        isE8Client<ClusterHealth6, ClusterHealth7, ClusterHealthRequest>(param, connection.version)
    ) {
        return param.client.cluster
            .health({ ...param.request })
            .then((value) => convertResponse(value.status));
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
