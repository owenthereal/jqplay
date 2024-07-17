import React from 'react';
import Editor from './Editor';
import { useDarkMode } from './ThemeProvider';
import TabList from './TabList';

interface EditorWrapperProps {
    title: string;
    language: string;
    readOnly?: boolean;
    value?: string;
    handleChange?: (value: string | undefined) => void;
}

const EditorWrapper: React.FC<EditorWrapperProps> = ({ title, handleChange, value, language, readOnly }) => {
    return (
        <TabList tabs={[{ label: title, value: "editor", content: <Editor handleChange={handleChange} value={value} language={language} readOnly={readOnly} /> }]} />
    )
};

export default EditorWrapper;
