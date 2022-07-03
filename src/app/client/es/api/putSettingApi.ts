import { IndicesPutSettings as IndicesPutSettings6 } from 'es6/api/requestParams';
import { IndicesPutSettings as IndicesPutSettings7 } from 'es7/api/requestParams';
import { IndicesPutSettingsRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { AcknowledgedResponse, EsConnection } from '../types';
import { Context as Context7, RequestBody as RequestBody7 } from 'es7/lib/Transport';

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {IndicesPutSettings6 | IndicesPutSettings7 | IndicesPutSettingsRequest} request request param
 */
export const putSettingApi = (
    connection: EsConnection,
    request: IndicesPutSettings6 | IndicesPutSettings7 | IndicesPutSettingsRequest
): Promise<AcknowledgedResponse> => {
    const param = { client: connection.client, request };

    if (
        isE6Client<IndicesPutSettings6, IndicesPutSettings7, IndicesPutSettingsRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices.putSettings(param.request).then((value) => value.body);
    } else if (
        isE7Client<IndicesPutSettings6, IndicesPutSettings7, IndicesPutSettingsRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices
            .putSettings<AcknowledgedResponse, RequestBody7, Context7>(param.request)
            .then((value) => value.body);
    } else if (
        isE8Client<IndicesPutSettings6, IndicesPutSettings7, IndicesPutSettingsRequest>(
            param,
            connection.version
        )
    ) {
        return param.client.indices.putSettings(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
