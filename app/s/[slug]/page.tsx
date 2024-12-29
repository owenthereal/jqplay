import { Playground } from '@/components/Playground';
import { redirect } from 'next/navigation';
import { Snippet } from '@/workers/model';
import { GetSnippet } from '@/lib/prisma';
import * as Sentry from '@sentry/browser';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps): Promise<JSX.Element | void> {
    const slug = (await params).slug;
    if (!slug) {
        return redirect('/');
    }

    try {
        const snippet = await GetSnippet(slug);
        if (!snippet) {
            return redirect('/');
        }

        const input = Snippet.parse(snippet);
        return (
            <Playground
                input={input}
            />
        );
    } catch (error: any) {
        console.error(`Failed to load snippet: ${error.message}`);
        Sentry.captureException(error, { extra: { slug } });

        redirect('/')
    }
};
