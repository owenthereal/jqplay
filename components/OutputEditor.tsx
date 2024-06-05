import Editor from '@monaco-editor/react';

interface OutputEditorProps {
    darkMode: boolean;
    result: string;
}

const OutputEditor: React.FC<OutputEditorProps> = ({ darkMode, result }) => (
    <div className="w-full max-w-7xl mb-6">
        <div className="flex items-center">
            <h2 className="tab-title">Output</h2>
        </div>
        <div className="border dark:border-gray-600 border-gray-300 rounded-tl-none rounded-tr-none">
            <Editor
                height="30vh"
                width="100%"
                defaultLanguage="json"
                value={result}
                theme={darkMode ? 'vs-dark' : 'light'}
                options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollbar: { vertical: 'auto', horizontal: 'auto' },
                    fontSize: 14,
                }}
            />
        </div>
    </div>
);

export default OutputEditor;
