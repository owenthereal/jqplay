'use client'

import { useSearchParams } from 'next/navigation';
import { Playground, PlaygroundProps } from '../components/Playground';
import { Suspense, useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { ErrorSnackbar, SnackbarError } from '@/components/ErrorSnackbar';
import { generateErrorId } from '@/lib/utils';

const PlaygroundWithParams = () => {
    const searchParams = useSearchParams();
    const j = searchParams.get('j');
    const q = searchParams.get('q');
    const o = searchParams.get('o');

    const [playgroundProps, setPlaygroundProps] = useState<PlaygroundProps | null>(null);
    const [error, setError] = useState<SnackbarError | null>(null);

    useEffect(() => {
        try {
            const initialQuery = typeof q === 'string' ? decodeURIComponent(q) : '';
            const initialJson = typeof j === 'string' ? decodeURIComponent(j) : '';
            const initialOptions = o ? [decodeURIComponent(o)] : [];

            setPlaygroundProps({ json: initialJson, query: initialQuery, options: initialOptions });
        } catch (error: any) {
            setError({ message: error.message, errorId: generateErrorId() });
            setTimeout(() => {
                window.location.href = window.location.origin;
            }, 3000);
        }
    }, [j, q, o])

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
