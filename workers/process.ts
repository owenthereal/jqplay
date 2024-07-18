import * as Comlink from "comlink";
import { worker } from "./worker";

Comlink.expose(worker);
export type WorkerInterface = typeof worker;
