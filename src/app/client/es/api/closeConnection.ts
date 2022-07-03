import { Index as Index6 } from 'es6/api/requestParams';
import { Index as Index7 } from 'es7/api/requestParams';
import { IndexRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { ConnectionCloseError } from '../../../context/error/ConnectionCloseError';
import { EsConnection } from '../types';

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 */
export const closeConnection = async (connection: EsConnection): Promise<void> => {
    const param = { client: connection.client };

    if (isE6Client(param, connection.version)) {
        return param.client.close(); // what!?
    } else if (isE7Client<Index6, Index7, IndexRequest>(param, connection.version)) {
        return param.client.close().catch((reason) => {
            throw new ConnectionCloseError(reason);
        });
    } else if (isE8Client<Index6, Index7, IndexRequest>(param, connection.version)) {
        return param.client.close().catch((reason) => {
            throw new ConnectionCloseError(reason);
        });
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
