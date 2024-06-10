'use client'

import { useSearchParams } from 'next/navigation';
import Playground from '../components/Playground';
import { Suspense } from 'react';

const PlaygroundWithParams = () => {
    const searchParams = useSearchParams();
    const j = searchParams.get('j');
    const q = searchParams.get('q');
    const o = searchParams.get('o');

    const initialQuery = typeof q === 'string' ? decodeURIComponent(q) : '';
    const initialJson = typeof j === 'string' ? decodeURIComponent(j) : '';
    const initialOptions = o ? [decodeURIComponent(o)] : [];

    return (
        <Playground
            InitialJson={initialJson}
            InitialQuery={initialQuery}
            InitialOptions={initialOptions}
        />
    );
}

const Page = () => {
    return (
        <Suspense>
            <PlaygroundWithParams />
        </Suspense>
    );
};

export default Page;
