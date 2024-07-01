import * as Comlink from "comlink";

let jq: typeof import('jq-wasm') | null = null;

const worker = {
    async initialize() {
        if (!jq) {
            jq = await import('jq-wasm')
        }
    },

    async jq(json: string, query: string, options: any): Promise<string> {
        if (!jq) {
            throw new Error('jq-wasm not initialized');
        }
        return jq.raw(json, query, options);
    }
};

Comlink.expose(worker);

export type Worker = typeof worker;
