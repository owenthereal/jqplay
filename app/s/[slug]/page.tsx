'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Playground } from '@/components/Playground';
import { NotificationProps, Notification } from '@/components/Notification';
import { generateMessageId } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { JQWorkerInput, JQWorkerInputType } from '@/workers/model';

const Page = ({ params }: { params: { slug: string } }) => {
    const slug = params.slug;
    const [input, setInput] = useState<JQWorkerInputType | null>(null);
    const [notification, setNotification] = useState<NotificationProps | null>(null);

    const router = useRouter();
    useEffect(() => {
        const fetchSnippet = async () => {
            try {
                const res = await fetch(`/api/snippets/${slug}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch snippet');
                }

                const data = await res.json();
                const input = JQWorkerInput.parse(data);
                setInput(input);
            } catch (error: any) {
                setNotification({ message: error.message, messageId: generateMessageId(), serverity: 'error' });
                setTimeout(() => {
                    router.push('/');
                }, 3000);
            }
        };

        if (slug) {
            fetchSnippet();
        } else {
            // Redirect to home if no slug
            router.push('/');
        }
    }, [slug, router]);

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
};

export default Page;
