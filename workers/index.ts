import * as Comlink from "comlink";
import type { WorkerInterface } from "./process";
import { HttpInput, worker } from "./worker";

export type JsonInput = HttpInput | string;

export class JQWorker {
    #worker: Comlink.Remote<WorkerInterface> | null = null;
    #webWorker: Worker | null = null;
    #timeout: number;

    constructor(timeout: number) {
        this.#timeout = timeout;
        if (window.Worker) {
            try {
                this.#webWorker = new Worker(new URL("/workers/process.ts", import.meta.url), { type: "module" });
                this.#worker = Comlink.wrap<WorkerInterface>(this.#webWorker);
            } catch (error) {
                console.error("Failed to initialize Web Worker:", error);
            }
        }
    }

    run(
        input: JsonInput,
        query: string,
        options: any
    ): Promise<string> {
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                this.terminate();
                reject(new Error('http timed out'));
            }, this.#timeout);
        });

        let resultPromise: Promise<string>;
        if (this.#worker) {
            if (input instanceof HttpInput) {
                resultPromise = this.#worker.http(
                    input,
                    query,
                    options
                );
            } else {
                resultPromise = this.#worker.jq(input, query, options);
            }
        } else {
            if (input instanceof HttpInput) {
                resultPromise = worker.http(
                    input,
                    query,
                    options
                )
            } else {
                resultPromise = worker.jq(input, query, options);
            }
        }

        return Promise.race([resultPromise, timeoutPromise]);
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
            resultPromise = worker.jq(json, query, options);
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
