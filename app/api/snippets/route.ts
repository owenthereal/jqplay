import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import crypto from 'crypto';
import { ZodError } from 'zod';
import { JQWorkerInput, JQWorkerInputType } from '@/workers/model';
import * as Sentry from '@sentry/node';

export async function POST(req: Request) {
    try {
        // Parse and validate the request body against the Snippet schema
        const snippet = await req.json();
        const validatedSnippet = JQWorkerInput.parse(snippet);

        // Generate a unique slug for the snippet
        const slug = generateSlug(validatedSnippet);

        // Upsert the snippet in the database
        const newSnippet = await prisma.snippets.upsert({
            where: { slug },
            update: {
                json: validatedSnippet.json,
                http: validatedSnippet.http,
                query: validatedSnippet.query,
                options: validatedSnippet.options,
            },
            create: {
                json: validatedSnippet.json,
                http: validatedSnippet.http,
                query: validatedSnippet.query,
                options: validatedSnippet.options,
                slug,
            },
        });

        // Return the slug of the created or updated snippet
        return NextResponse.json({ slug: newSnippet.slug }, { status: 200 });

    } catch (error) {
        console.error('Failed to save snippet:', error);
        Sentry.captureException(error, { extra: { body: req.body } });

        if (error instanceof ZodError) {
            return NextResponse.json({ errors: error.errors }, { status: 422 });
        }

        return NextResponse.json({ error: 'Failed to save snippet' }, { status: 500 });
    }
}

// Function to generate a unique slug for the snippet
function generateSlug(snippet: JQWorkerInputType, hashLen: number = 15): string {
    const hash = crypto.createHash('sha1');

    // Hash the provided fields in the snippet
    if (snippet.json) {
        hash.update(snippet.json);
    }
    if (snippet.http) {
        hash.update(JSON.stringify(snippet.http));
    }
    hash.update(snippet.query);
    if (snippet.options) {
        hash.update(snippet.options.sort().join(''));
    }

    // Convert the hash to a base64 URL-safe string
    const sum = hash.digest();
    let base64Encoded = sum.toString('base64url');

    // Ensure the slug does not end with an underscore by adjusting the length
    while (hashLen <= base64Encoded.length && base64Encoded[hashLen - 1] === '_') {
        hashLen++;
    }

    return base64Encoded.substring(0, hashLen);
}
