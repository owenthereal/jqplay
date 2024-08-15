'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { Playground } from '@/components/Playground';
import { Suspense, useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Notification, NotificationProps } from '@/components/Notification';
import { generateMessageId } from '@/lib/utils';
import { JQWorkerInputType } from '@/workers/model';

const PlaygroundWithParams = () => {
    const searchParams = useSearchParams();
    const j = searchParams.get('j');
    const q = searchParams.get('q');
    const o = searchParams.get('o');

    const [input, setInput] = useState<JQWorkerInputType | null>(null);
    const [notification, setNotification] = useState<NotificationProps | null>(null);

    const router = useRouter();
    useEffect(() => {
        try {
            const json = typeof j === 'string' ? decodeURIComponent(j) : '';
            const query = typeof q === 'string' ? decodeURIComponent(q) : '';
            const options = o ? [decodeURIComponent(o)] : [];

            setInput({ json, query, options });
        } catch (error: any) {
            setNotification({ message: error.message, messageId: generateMessageId(), serverity: 'error' });
            setTimeout(() => {
                router.push('/');
            }, 3000);
        }
    }, [j, q, o, router])

    if (!input) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
                <Notification message={notification?.message} messageId={notification?.messageId} serverity={notification?.serverity} />
            </Box>
        );
    }

    return (
        <Playground
            input={input}
        />
    );
}

const Page = () => {
    return (
        <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        }>
            <PlaygroundWithParams />
        </Suspense>
    );
};

export default Page;
