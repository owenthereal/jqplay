export class HttpInput {
    method: string;
    url: string;
    headers?: string;
    body?: string;

    constructor(method: string, url: string, headers?: string, body?: string) {
        this.method = method;
        this.url = url;
        this.headers = headers;
        this.body = body;
    }
}

export const worker = {
    async jq(json: string, query: string, options: any): Promise<string> {
        const jq = await import('jq-wasm');
        return jq.raw(json, query, options);
    },

    async http(
        http: HttpInput,
        query: string,
        options: any
    ): Promise<string> {
        const u = new URL(http.url);

        const headers = new Headers();
        if (http.headers) {
            const headersJson = parseHeaders(http.headers);
            for (const key in headersJson) {
                headers.set(key, headersJson[key]);
            }
        }

        const resp = await fetch(u.toString(), {
            method: http.method,
            headers: headers,
            body: http.body,
        })
        const json = await resp.json();
        return this.jq(JSON.stringify(json), query, options);
    }
};


function parseHeaders(headersString: string): Record<string, string> {
    try {
        const parsedHeaders = JSON.parse(headersString);

        // Validate that the parsed object is a Record<string, string>
        if (typeof parsedHeaders !== 'object' || Array.isArray(parsedHeaders)) {
            throw new Error("Headers must be a key-value pair object.");
        }

        for (const [key, value] of Object.entries(parsedHeaders)) {
            if (typeof key !== 'string' || typeof value !== 'string') {
                throw new Error("Both header keys and values must be strings.");
            }
        }

        return parsedHeaders;
    } catch (error: any) {
        throw new Error(`Failed to parse headers: ${error.message}`);
    }
}
