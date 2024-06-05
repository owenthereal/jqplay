import Editor from '@monaco-editor/react';

interface OutputEditorProps {
    darkMode: boolean;
    result: string;
}

const OutputEditor: React.FC<OutputEditorProps> = ({ darkMode, result }) => (
    <div className="w-full max-w-7xl">
        <h2 className="tab-title">Output</h2>
        <div className="border border-gray-700 rounded dark:border-gray-700 border-gray-300">
            <Editor height="40vh" width="100%" defaultLanguage="json" value={result} theme={darkMode ? 'vs-dark' : 'light'} options={{ readOnly: true }} />
        </div>
    </div>
);

export default OutputEditor;
