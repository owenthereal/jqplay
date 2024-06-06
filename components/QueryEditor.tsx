import Editor from './Editor';

interface QueryEditorProps {
  darkMode: boolean;
  handleChange: (value: string | undefined) => void;
}

const QueryEditor: React.FC<QueryEditorProps> = ({ darkMode, handleChange }) => (
  <Editor title="Query" darkMode={darkMode} language="plaintext" handleChange={handleChange} />
);

export default QueryEditor;
