import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { version as uuidVersion, validate as uuidValidate } from 'uuid';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const whereClause = uuidValidateV4(id)
            ? { id }
            : { slug: id };

        const snippet = await prisma.snippets.findFirst({
            where: whereClause
        });

        if (!snippet) {
            return NextResponse.json({ error: 'Snippet not found' }, { status: 404 });
        }

        return NextResponse.json(snippet);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

function uuidValidateV4(uuid: string) {
    return uuidValidate(uuid) && uuidVersion(uuid) === 4;
}
