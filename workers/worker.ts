import jq from 'jq-wasm';

addEventListener('message', (event: any) => {
    const { json, query, options } = event.data;

    jq.raw(json, query, options)
        .then((result: string) => {
            postMessage({ result: result });
        })
        .catch((error: any) => {
            postMessage({ error: error.toString() });
        });
});
