import Editor from './Editor';

interface JSONEditorProps {
    darkMode: boolean;
    handleChange: (value: string | undefined) => void;
}

const JSONEditor: React.FC<JSONEditorProps> = ({ darkMode, handleChange }) => (
    <Editor title="JSON" darkMode={darkMode} language="json" handleChange={handleChange} />
);

export default JSONEditor;
