export default interface ElasticsearchClient {
    healthCheck(): Promise<{ status: string }>;

    putMapping(index: string, body: any): Promise<any>;

    createIndex(index: string, body: any): Promise<any>;

    search(index: string, query: any): Promise<any>;

    exists(index: string): Promise<boolean>;

    version(): string;
}
