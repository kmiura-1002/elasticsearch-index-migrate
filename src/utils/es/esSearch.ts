import { ESClient} from "eim";
import {healthCheck} from "./esUtils";

export default async function esSearch(client: ESClient, index: string, query: any) {
    return healthCheck(client, index).then(() => client.search({
        index,
        body: query,
    }))
}
