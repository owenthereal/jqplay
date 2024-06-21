import * as Comlink from "comlink";
import jq from "jq-wasm";

const worker = {
    jq(json: string, query: string, options: any): Promise<string> {
        return jq.raw(json, query, options);
    }
};

Comlink.expose(worker);

export type Worker = typeof worker;
