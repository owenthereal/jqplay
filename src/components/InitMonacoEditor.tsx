import { loader } from '@monaco-editor/react';

let monacoConfigured = false;

export const InitMonacoEditor = async () => {
    if (!monacoConfigured) {
        if (typeof window !== 'undefined') {
            const monaco = await import('monaco-editor');
            loader.config({ monaco });
            monacoConfigured = true;
        }
    }
};
