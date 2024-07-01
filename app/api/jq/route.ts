import jq from 'jq-wasm';

export async function GET(req: Request) {
    try {
        const result = await jq.raw('{"foo":"bar"}', ".");
        return new Response(result, { status: 200 });
    } catch (e: any) {
        const errorMessage = e?.message || 'An unknown error occurred';
        return new Response(errorMessage, { status: 200 });
    }
}
