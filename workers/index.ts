import * as Comlink from "comlink";
import type { Worker as WorkerInterface } from "./process";

export class JQWorker {
    worker: Comlink.Remote<WorkerInterface>;
    webWorker: Worker;

    constructor() {
        this.webWorker = new Worker(new URL("./process.ts", import.meta.url), { type: "module" });
        this.worker = Comlink.wrap<WorkerInterface>(this.webWorker);
    }

    jq(json: string, query: string, options: any): Promise<string> {
        return this.worker.jq(json, query, options);
    }

    terminate() {
        this.webWorker.terminate();
    }
}
