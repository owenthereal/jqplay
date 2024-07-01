import * as Comlink from "comlink";
import type { Worker as WorkerInterface } from "./process";

export class JQWorker {
    #worker: Comlink.Remote<WorkerInterface>;
    #webWorker: Worker;
    #timeout: number;

    constructor(timeout: number) {
        this.#timeout = timeout;
        this.#webWorker = new Worker(new URL("./process.ts", import.meta.url), { type: "module" });
        this.#worker = Comlink.wrap<WorkerInterface>(this.#webWorker);
    }

    jq(json: string, query: string, options: any): Promise<string> {
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                this.terminate();
                reject(new Error('jq timed out'));
            }, this.#timeout);
        });

        const resultPromise = this.#worker.jq(json, query, options);
        return Promise.race([resultPromise, timeoutPromise]);
    }

    terminate() {
        this.#webWorker.terminate();
    }
}
