import jq from 'jq-wasm';

addEventListener('message', (event: any) => {
    const { json, query, flags } = event.data;
    jq.raw(json, query, flags)
        .then((result: string) => {
            postMessage({ result: result });
        })
        .catch((error: any) => {
            postMessage({ result: error.toString() });
        });
});
