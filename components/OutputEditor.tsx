import Editor from './Editor';
import { useTheme } from './ThemeProvider';

interface OutputEditorProps {
    result?: string;
}

const OutputEditor: React.FC<OutputEditorProps> = ({ result }) => {
    const { darkMode } = useTheme();

    return (
        <Editor title="Output" darkMode={darkMode} language="json" readOnly={true} value={result} />
    );
}

export default OutputEditor;
