'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import Playground from '../../../components/Playground';
import { SnackbarError, ErrorSnackbar } from '@/components/ErrorSnackbar';
import { generateErrorId } from '@/lib/utils';

interface Snippet {
    json: string;
    query: string;
    options: string[];
}

const SnippetPage = ({ params }: { params: { slug: string } }) => {
    const slug = params.slug;
    const [snippet, setSnippet] = useState<Snippet | null>(null);
    const [error, setError] = useState<SnackbarError | null>(null);

    useEffect(() => {
        const fetchSnippet = async () => {
            try {
                const res = await fetch(`/api/snippets/${slug}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch snippet');
                }
                const data: Snippet = await res.json();
                setSnippet(data);
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

    if (!snippet) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
                <ErrorSnackbar message={error?.message} errorId={error?.errorId} />
            </Box>
        );
    }

    return (
        <Playground
            InitialJson={snippet.json}
            InitialQuery={snippet.query}
            InitialOptions={snippet.options}
        />
    );
};

export default SnippetPage;
