import Editor from '@monaco-editor/react';

interface QueryEditorProps {
  darkMode: boolean;
  handleChange: (value: string | undefined) => void;
}

const QueryEditor: React.FC<QueryEditorProps> = ({ darkMode, handleChange }) => (
  <div className="w-full md:w-1/2 mb-6 md:mb-0">
    <div className="flex items-center">
      <h2 className="tab-title">Query</h2>
    </div>
    <div className="border dark:border-gray-600 border-gray-300 rounded-tl-none rounded-tr-none">
      <Editor
        height="30vh"
        width="100%"
        defaultLanguage="plaintext"
        theme={darkMode ? 'vs-dark' : 'light'}
        onChange={handleChange}
        options={{
          minimap: { enabled: false },
          scrollbar: { vertical: 'auto', horizontal: 'auto' },
          fontSize: 14,
        }}
      />
    </div>
  </div>
);

export default QueryEditor;
