import { createContext, useContext, useState, ReactNode, useEffect, FC } from 'react';

interface SnippetContextType {
    json: string;
    setJson: (json: string) => void;
    query: string;
    setQuery: (query: string) => void;
    options: string[];
    setOptions: (options: string[]) => void;
}

const SnippetContext = createContext<SnippetContextType | undefined>(undefined);

export const useSnippet = (): SnippetContextType => {
    const context = useContext(SnippetContext);
    if (!context) {
        throw new Error('useSnippet must be used within a SnippetProvider');
    }
    return context;
};

interface SnippetProviderProps {
    children: ReactNode;
}

export const SnippetProvider: FC<SnippetProviderProps> = ({ children }) => {
    const [json, setJson] = useState('');
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<string[]>([]);

    const value = {
        json,
        setJson,
        query,
        setQuery,
        options,
        setOptions,
    };

    return (
        <SnippetContext.Provider value={value}>
            {children}
        </SnippetContext.Provider>
    );
};
