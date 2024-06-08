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
                .then((res) => res.json())
                .then((data) => setSnippet(data))
                .catch(() => alert('Failed to fetch snippet'));
        } else {
            // redirect to home if no slug
            window.location.href = '/';
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
