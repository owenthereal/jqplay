import Editor from './Editor';
import { useTheme } from './ThemeProvider';

interface JSONEditorProps {
    value?: string;
    handleChange?: (value: string | undefined) => void;
}

const JSONEditor: React.FC<JSONEditorProps> = ({ value, handleChange }) => {
    const { darkMode } = useTheme();

    return (
        <Editor title="JSON" darkMode={darkMode} language="json" value={value} handleChange={handleChange} />
    );
}

export default JSONEditor;
