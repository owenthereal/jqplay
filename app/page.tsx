'use client'

import React, { useEffect, useState } from 'react';
import Playground from '@/components/Playground';

export default function Page() {
    const [initialJson, setInitialJson] = useState('');
    const [initialQuery, setInitialQuery] = useState('');
    const [initialOptions, setInitialOptions] = useState<string[]>([]);

    useEffect(() => {
        setTimeout(() => {
            setInitialJson('{"foo": "bar"}');
            setInitialQuery('.');
            setInitialOptions(["-c"]);
        }, 2000);

    }, []);

    return (
        <Playground InitialJson={initialJson} InitialQuery={initialQuery} InitialOptions={initialOptions} />
    );
}
