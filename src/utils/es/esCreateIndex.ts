import { ESClient} from "eim";
import {healthCheck} from "./esUtils";

export default async function esCreateIndex(client: ESClient, index: string, body: any) {
    return healthCheck(client, index).then(() => client.index({
        index,
        body,
    }));
}
