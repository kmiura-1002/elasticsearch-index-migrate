import {ApiResponse, ESClient} from "eim";

export async function healthCheck(client: ESClient, index?: string) {
    const healthCheck: ApiResponse = await client.cluster.health();
    if (healthCheck.body.status === 'red') {
        console.error('Elasticsearch cluster is red status. ');
        console.error(healthCheck.body);
        return Promise.reject(healthCheck);
    }
    if(index){
        const exists = await client.indices.exists({index: index});
        if(!exists.body){
            console.error(`Does not exists ${index} index.`);
            console.error(healthCheck.body);
            return Promise.reject(exists);
        }
        return Promise.resolve(exists);
    }
    return Promise.resolve(healthCheck);
}