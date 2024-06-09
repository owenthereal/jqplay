import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { generateSlug } from '@/lib/utils';

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

        const slug = generateSlug({ json, query, options });
        const newSnippet = await prisma.snippets.upsert({
            where: { slug },
            update: { json, query, options },
            create: {
                json,
                query,
                options,
                slug,
            },
        });

        return NextResponse.json({ slug: newSnippet.slug }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save snippet' }, { status: 500 });
    }
}
