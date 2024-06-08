import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(req: Request) {
    try {
        const { json, query, options } = await req.json();
        const slug = generateUniqueSlug();
        const newSnippet = await prisma.snippets.create({
            data: {
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

function generateUniqueSlug() {
    // Implement a function to generate a unique slug for the snippet
    return Math.random().toString(36).substr(2, 9);
}
