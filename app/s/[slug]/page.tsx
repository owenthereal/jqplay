'use client';

import { useEffect, useState } from 'react';
import Playground from '../../../components/Playground';

interface Snippet {
    json: string;
    query: string;
    options: string[];
}


const SnippetPage = ({ params }: { params: { slug: string } }) => {
    const slug = params.slug;
    const [snippet, setSnippet] = useState<Snippet | null>(null);

    useEffect(() => {
        if (slug) {
            fetch(`/api/snippets/${slug}`)
                .then((res) => {
                    if (res.status >= 400) {
                        throw new Error('Failed to fetch snippet');
                    } else {
                        return res.json()
                    }
                })
                .then((data) => setSnippet(data))
                .catch(() => {
                    window.location.href = window.location.origin;
                })
        } else {
            // redirect to home if no slug
            window.location.href = window.location.origin;
        }
    }, [slug]);

    if (!snippet) {
        return <div>Loading...</div>;
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
