import Editor from './Editor';
import { useSnippet } from './SnippetProvider';
import { useTheme } from './ThemeProvider';

interface QueryEditorProps {
  value?: string;
  handleChange: (value: string | undefined) => void;
}

const QueryEditor: React.FC<QueryEditorProps> = ({ value, handleChange }) => {
  const { darkMode } = useTheme();

  return (
    <Editor title="Query" darkMode={darkMode} language="plaintext" value={value} handleChange={handleChange} />
  );
}

export default QueryEditor;
