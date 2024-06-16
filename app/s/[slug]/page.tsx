'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Playground, PlaygroundProps } from '@/components/Playground';
import { SnackbarError, ErrorSnackbar } from '@/components/ErrorSnackbar';
import { generateErrorId } from '@/lib/utils';

const Page = ({ params }: { params: { slug: string } }) => {
    const slug = params.slug;
    const [playgroundProps, setPlaygroundProps] = useState<PlaygroundProps | null>(null);
    const [error, setError] = useState<SnackbarError | null>(null);

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
                setError({ message: error.message, errorId: generateErrorId() });
                setTimeout(() => {
                    window.location.href = window.location.origin;
                }, 3000);
            }
        };

        if (slug) {
            fetchSnippet();
        } else {
            // Redirect to home if no slug
            window.location.href = window.location.origin;
        }
    }, [slug]);

    if (!playgroundProps) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
                <ErrorSnackbar message={error?.message} errorId={error?.errorId} />
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
