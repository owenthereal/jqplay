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

        // Check if the browser supports Web Workers
        if (window.Worker) {
            this.initializeWorker();
        } else {
            console.warn("Web Workers are not supported in this environment. Falling back to main thread.");
        }
    }

    private initializeWorker(): void {
        try {
            this.#webWorker = new Worker(new URL("/workers/process.ts", import.meta.url), { type: "module" });
            this.#worker = Comlink.wrap<WorkerInterface>(this.#webWorker);
        } catch (error) {
            console.error("Failed to initialize Web Worker:", error);
        }
    }

    async run(input: JsonInput, query: string, options: any): Promise<string> {
        const timeoutPromise = this.createTimeoutPromise();

        let resultPromise: Promise<string>;
        if (this.#worker) {
            resultPromise = this.runWithWorker(input, query, options);
        } else {
            resultPromise = this.runWithoutWorker(input, query, options);
        }

        return Promise.race([resultPromise, timeoutPromise]);
    }

    private createTimeoutPromise(): Promise<never> {
        return new Promise<never>((_, reject) => {
            setTimeout(() => {
                this.terminate();
                reject(new Error('Operation timed out'));
            }, this.#timeout);
        });
    }

    private runWithWorker(input: JsonInput, query: string, options: any): Promise<string> {
        if (input instanceof HttpInput) {
            return this.#worker!.http(input, query, options);
        } else {
            return this.#worker!.jq(input, query, options);
        }
    }

    private runWithoutWorker(input: JsonInput, query: string, options: any): Promise<string> {
        if (input instanceof HttpInput) {
            return worker.http(input, query, options);
        } else {
            return worker.jq(input, query, options);
        }
    }

    terminate(): void {
        if (this.#webWorker) {
            this.#webWorker.terminate();
            this.#webWorker = null;
            this.#worker = null;
        }
    }
}
