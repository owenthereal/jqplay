import Editor from '@monaco-editor/react';

interface JSONEditorProps {
    darkMode: boolean;
    handleChange: (value: string | undefined) => void;
}

const JSONEditor: React.FC<JSONEditorProps> = ({ darkMode, handleChange }) => (
    <div className="w-full md:w-1/2 mb-6 md:mb-0">
        <h2 className="tab-title">JSON</h2>
        <div className="border border-gray-700 rounded dark:border-gray-700 border-gray-300">
            <Editor height="40vh" width="100%" defaultLanguage="json" theme={darkMode ? 'vs-dark' : 'light'} onChange={handleChange} />
        </div>
    </div>
);

export default JSONEditor;
