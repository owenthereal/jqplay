'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Playground, PlaygroundProps } from '@/components/Playground';
import { NotificationProps, Notification } from '@/components/Notification';
import { generateMessageId } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const Page = ({ params }: { params: { slug: string } }) => {
    const router = useRouter();

    const slug = params.slug;
    const [playgroundProps, setPlaygroundProps] = useState<PlaygroundProps | null>(null);
    const [notification, setNotification] = useState<NotificationProps | null>(null);

    useEffect(() => {
        const fetchSnippet = async () => {
            try {
                const res = await fetch(`/api/snippets/${slug}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch snippet');
                }
                const data: PlaygroundProps = await res.json();
                setPlaygroundProps(data);
            } catch (error: any) {
                setNotification({ message: error.message, messageId: generateMessageId() });
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
    }, [slug]);

    if (!playgroundProps) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
                <Notification message={notification?.message} messageId={notification?.messageId} />
            </Box>
        );
    }

    return (
        <Playground
            json={playgroundProps.json}
            query={playgroundProps.query}
            options={playgroundProps.options}
        />
    );
};

export default Page;
