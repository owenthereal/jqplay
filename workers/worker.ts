import { HttpType } from './model';

export const worker = {
    async jq(json: string, query: string, options?: Array<string>): Promise<string> {
        const jq = await import('jq-wasm');
        return jq.raw(json, query, options);
    },

    async http(
        http: HttpType,
        query: string,
        options?: Array<string>
    ): Promise<string> {
        if (!http) {
            throw new Error('HTTP input is undefined');
        }

        const u = new URL(http.url);

        const headers = new Headers();
        if (http.headers) {
            for (const key in http.headers) {
                headers.set(key, http.headers[key]);
            }
        }

        const resp = await fetch(u.toString(), {
            method: http.method,
            headers: headers,
            body: http.body,
        });

        const json = await resp.json();
        return this.jq(JSON.stringify(json), query, options);
    }
};
