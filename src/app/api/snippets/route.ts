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
            return NextResponse.json({ errors: error.errors }, { status: 422 });
        }
        return NextResponse.json({ error: error.message || 'Failed to save snippet' }, { status: 500 });
    }
}
