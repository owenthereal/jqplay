import EditorWrapper from './EditorWrapper';

interface JSONEditorProps {
    value?: string;
    handleChange?: (value: string | undefined) => void;
}

const JSONEditor: React.FC<JSONEditorProps> = ({ value, handleChange }) => {
    return (
        <EditorWrapper title="JSON" language="json" value={value} handleChange={handleChange} />
    );
}

export default JSONEditor;
