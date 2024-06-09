import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const { json, query, options } = await req.json();

        const validationErrors = [];
        if (!json || typeof json !== 'string') {
            validationErrors.push('JSON must be a non-empty string');
        }
        if (!query || typeof query !== 'string') {
            validationErrors.push('Query must be a non-empty string');
        }
        if (!Array.isArray(options)) {
            validationErrors.push('Options must be an array');
        }
        if (validationErrors.length > 0) {
            return NextResponse.json({ errors: validationErrors }, { status: 422 });
        }

        const id = uuidv4();
        const slug = id.replace(/-/g, '');
        const newSnippet = await prisma.snippets.create({
            data: {
                id,
                json,
                query,
                options,
                slug,
            },
        });

        return NextResponse.json({ slug: newSnippet.slug }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save snippet' }, { status: 500 });
    }
}
