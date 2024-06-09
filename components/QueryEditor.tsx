import Editor from './Editor';
import { useDarkMode } from './ThemeProvider';

interface QueryEditorProps {
  value?: string;
  handleChange?: (value: string | undefined) => void;
}

const QueryEditor: React.FC<QueryEditorProps> = ({ value, handleChange }) => {
  const { darkMode } = useDarkMode();

  return (
    <Editor title="Query" darkMode={darkMode} language="plaintext" value={value} handleChange={handleChange} />
  );
}

export default QueryEditor;
