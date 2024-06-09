import Editor from './Editor';
import { useDarkMode } from './ThemeProvider';

interface OutputEditorProps {
    result?: string;
}

const OutputEditor: React.FC<OutputEditorProps> = ({ result }) => {
    const { darkMode } = useDarkMode();

    return (
        <Editor title="Output" darkMode={darkMode} language="json" readOnly={true} value={result} />
    );
}

export default OutputEditor;
