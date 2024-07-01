import * as Comlink from "comlink";

const worker = {
    async jq(json: string, query: string, options: any): Promise<string> {
        const jq = await import('jq-wasm')
        return jq.raw(json, query, options);
    }
};

Comlink.expose(worker);

export type Worker = typeof worker;
