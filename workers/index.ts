import * as Comlink from "comlink";
import type { Worker as WorkerInterface } from "./process";
import jq from 'jq-wasm';

export class JQWorker {
    #worker: Comlink.Remote<WorkerInterface> | null = null;
    #webWorker: Worker | null = null;
    #timeout: number;

    constructor(timeout: number) {
        this.#timeout = timeout;
        if (window.Worker) {
            try {
                this.#webWorker = new Worker(new URL("./process.ts", import.meta.url), { type: "module" });
                this.#worker = Comlink.wrap<WorkerInterface>(this.#webWorker);
            } catch (error) {
                console.error("Failed to initialize Web Worker:", error);
            }
        }
    }

    jq(json: string, query: string, options: any): Promise<string> {
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                this.terminate();
                reject(new Error('jq timed out'));
            }, this.#timeout);
        });

        let resultPromise: Promise<string>;
        if (this.#worker) {
            resultPromise = this.#worker.jq(json, query, options);
        } else {
            resultPromise = jq.raw(json, query, options);
        }

        return Promise.race([resultPromise, timeoutPromise]);
    }

    terminate() {
        if (this.#webWorker) {
            this.#webWorker.terminate();
            this.#webWorker = null;
            this.#worker = null;
        }
    }
}
