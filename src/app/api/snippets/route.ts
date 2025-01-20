import { NextResponse } from 'next/server';
import { UpsertSnippet } from '@/lib/prisma';
import { ZodError } from 'zod';
import { Snippet } from '@/workers/model';
import * as Sentry from '@sentry/node';

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const snippet = Snippet.parse(json);
        const newSnippet = await UpsertSnippet(snippet);

        return NextResponse.json({ slug: newSnippet.slug }, { status: 200 });
    } catch (error: any) {
        console.error(`Failed to save snippet: ${error.message}`);
        Sentry.captureException(error, { extra: { body: req.body } });

        if (error instanceof ZodError) {
            const errorMessages = error.errors.map(e => `${e.path.join(', ')} ${e.message}`.toLowerCase());
            return NextResponse.json({ errors: errorMessages }, { status: 422 });
        }

        const errorMessage = error?.message || 'An unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
