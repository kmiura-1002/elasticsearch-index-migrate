import { Health } from '../definitions';
import {
    ErrorCause,
    float,
    integer,
    long,
    MappingProperty,
    Result,
    Retries,
    SearchHit,
    TaskId
} from 'es8/lib/api/types';
import { Client as Es6Client } from 'es6';
import { Client as Es7Client } from 'es7';
import { Client as Es8Client } from 'es8';
import { SearchEngineVersion } from '../../../types';

export type EsConnection = {
    client: Es6Client | Es7Client | Es8Client;
    version: SearchEngineVersion;
};

export type HealthStatus = typeof Health[number];

export type Record<K extends keyof any, T> = {
    [P in K]: T;
};

export type AcknowledgedResponse = {
    acknowledged: boolean;
};

export type MappingResponse = Record<string, Record<string, MappingProperty> | undefined>;

export type WriteResponse = {
    _id: string;
    _index: string;
    _primary_term: number;
    result: Result;
    _seq_no: number;
    _version: number;
    forced_refresh?: boolean;
};

export type Document<T> = SearchHit<T> & {
    _type: string;
    _source: T;
};

type BulkIndexByScrollFailure = {
    cause: ErrorCause;
    id: string;
    index: string;
    status: number;
    type: string;
};

export type DeleteByQueryResponse = {
    batches?: long;
    deleted?: long;
    failures?: BulkIndexByScrollFailure[];
    noops?: long;
    requests_per_second?: float;
    retries?: Retries;
    slice_id?: integer;
    task?: TaskId;
    throttled_millis?: long;
    throttled_until_millis?: long;
    timed_out?: boolean;
    took?: long;
    total?: long;
    version_conflicts?: long;
};
