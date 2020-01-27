import {ApiResponse as ApiResponse6, Client as Client6} from "es6";
import {ApiResponse as ApiResponse7, Client as Client7} from "es7";

export type ESClient = Client6 | Client7;
export type ApiResponse<T = any, C = any> = ApiResponse6 | ApiResponse7;

export type IndexSearchResults<T> = {
    hits: {
        total: number;
        max_score?: number;
        hits: {
            _index: string;
            _type: string;
            _id: string;
            _score?: number;
            _source: T;
        }[];
    };
};