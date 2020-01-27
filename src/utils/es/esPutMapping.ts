import {ESClient} from "eim";
import {healthCheck} from "./esUtils";

export default async function esPutMapping(client: ESClient, index: string, body: any) {
    return healthCheck(client, index).then(() => client.indices.putMapping({
        index,
        type: 'doc',
        body
    }));
}
