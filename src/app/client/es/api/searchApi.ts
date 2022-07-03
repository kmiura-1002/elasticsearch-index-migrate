import { Search as Search6 } from 'es6/api/requestParams';
import { Search as Search7 } from 'es7/api/requestParams';
import { AggregateName, AggregationsAggregate, SearchRequest } from 'es8/lib/api/types';
import { isE6Client, isE7Client, isE8Client } from '../EsUtils';
import { Document, EsConnection } from '../types';

/**
 * @package
 * @constructor
 * @param {EsConnection} connection connection
 * @param {Search6 | Search7 | SearchRequest} request request param
 */
export const searchApi = <T>(
    connection: EsConnection,
    request: Search6 | Search7 | SearchRequest
): Promise<Document<T>[]> => {
    const param = { client: connection.client, request };

    if (isE6Client<Search6, Search7, SearchRequest>(param, connection.version)) {
        return param.client.search(param.request).then((value) => value.body.hits.hits);
    } else if (isE7Client<Search6, Search7, SearchRequest>(param, connection.version)) {
        return param.client.search(param.request).then((value) => value.body.hits.hits);
    } else if (isE8Client<Search6, Search7, SearchRequest>(param, connection.version)) {
        return param.client
            .search<T, Record<AggregateName, AggregationsAggregate>>(param.request)
            .then((value) => value.hits.hits as Document<T>[]);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};
