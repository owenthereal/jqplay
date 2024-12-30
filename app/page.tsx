import { Playground } from '@/components/Playground';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { NotificationProps } from '@/components/Notification';
import { generateMessageId, prettifyZodError } from '@/lib/utils';
import { Snippet, SnippetType } from '@/workers/model';
import { ZodError } from 'zod';

interface PageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PageProps): Promise<JSX.Element | void> {
    const params = await searchParams;
    const j = typeof params.j === 'string' ? decodeURIComponent(params.j) : undefined;
    const q = typeof params.q === 'string' ? decodeURIComponent(params.q) : undefined;

    let o: string[] | undefined;
    if (params.o) {
        const rawOptions = Array.isArray(params.o) ? params.o : [params.o];
        o = rawOptions.map(val => decodeURIComponent(val));
    }

    let snippet: SnippetType | undefined;
    let notification: NotificationProps | undefined;

    try {
        if (j || q) {
            snippet = Snippet.parse({ json: j, query: q, options: o });
        }
    } catch (error: any) {
        let message = ''
        if (error instanceof ZodError) {
            message = prettifyZodError(error);
        } else {
            message = error.message
        }

        notification = {
            message: message,
            messageId: generateMessageId(),
            serverity: 'error',
        };
    }

    return (
        <Suspense
            fallback={
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                    }}
                >
                    <CircularProgress />
                </Box>
            }
        >
            <Playground input={snippet} initialNotification={notification} />
        </Suspense>
    );
}
