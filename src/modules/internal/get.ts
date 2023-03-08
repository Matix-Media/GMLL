/*
 * This is the core of the download manager. No code from the main thread should interact with it!
 * DO NOT WRAP THIS FUNCTION UP WITH WEBPACK IF YOU DO NOT WANT THINGS TO BREAK BADLY. 
 * 
 * Redefine the property __get in the config module to change where GMLL looks for this file.
 */

import { dir, file } from "../objects/files";
import { parentPort, workerData } from "worker_threads";
export type getWorkerDate = { processCMD: string, failCMD: string, getCMD: string, postCMD: string, zipDir: string[] };
const { processCMD, failCMD, getCMD, postCMD, zipDir }: getWorkerDate = workerData;
async function load(a: any, retry: number = 0) {
    const o = a.data;
    try {
        await file.process(o, new dir(...zipDir));
        parentPort.postMessage({ cmd: processCMD, key: o.key });
        return;
    } catch (e) {
        if (retry <= 3) {
            retry++;
            parentPort.postMessage({ cmd: failCMD, type: "retry", key: o.key, err: e });
            await load(a, retry);
            return;
        }
        console.error("[GMLL]: procedural failure : " + new dir(...o.path));
        parentPort.postMessage({ cmd: failCMD, type: "system", key: o.path, err: e });
        parentPort.postMessage({ cmd: processCMD, key: o.key });
    }
}

parentPort.on("message", async (a) => {
    if (a.data && a.cmd == postCMD)
        await load(a);

})
parentPort.postMessage({ cmd: getCMD, type: "system" });