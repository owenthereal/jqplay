import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { version as uuidVersion, validate as uuidValidate } from 'uuid';
import { JQWorkerInput } from '@/workers/model';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/node';

export async function GET(req: Request, { params }: { params: { slug: string } }) {
    const { slug } = params;

    try {
        // Determine the where clause based on whether the slug is a valid UUID v4
        const whereClause = uuidValidateV4(slug)
            ? { id: slug } // If valid UUID v4, search by ID
            : { slug: slug }; // Otherwise, search by slug

        // Fetch the snippet from the database
        const snippet = await prisma.snippets.findFirst({
            where: whereClause,
        });

        // If no snippet is found, return a 404 response
        if (!snippet) {
            return NextResponse.json({ error: 'Snippet not found' }, { status: 404 });
        }

        const responseSnippet = {
            json: snippet.json || undefined,
            http: snippet.http || undefined,
            query: snippet.query,
            options: snippet.options || [],
        };
        const parsedSnippet = JQWorkerInput.parse(responseSnippet);

        return NextResponse.json(parsedSnippet);
    } catch (error) {
        console.error('Failed to fetch snippet:', error);
        Sentry.captureException(error);

        if (error instanceof ZodError) {
            return NextResponse.json({ errors: error.errors }, { status: 422 });
        }

        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// Helper function to validate UUID v4
function uuidValidateV4(uuid: string) {
    return uuidValidate(uuid) && uuidVersion(uuid) === 4;
}
