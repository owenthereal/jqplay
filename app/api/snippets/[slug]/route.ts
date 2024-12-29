import { NextResponse } from 'next/server';
import { GetSnippet } from '@/lib/prisma';
import { Snippet } from '@/workers/model';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/node';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function GET(_: Request, { params }: PageProps) {
    const slug = (await params).slug;
    if (!slug) {
        return NextResponse.json({ error: 'No slug provided' }, { status: 404 });
    }

    try {
        const snippet = await GetSnippet(slug);
        if (!snippet) {
            return NextResponse.json({ error: 'Snippet not found' }, { status: 404 });
        }

        const resp = Snippet.parse(snippet);
        return NextResponse.json(resp);
    } catch (error: any) {
        console.error(`Failed to load snippet: ${error.message}`);
        Sentry.captureException(error, { extra: { slug } });

        if (error instanceof ZodError) {
            return NextResponse.json({ errors: error.errors }, { status: 422 });
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
