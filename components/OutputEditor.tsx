import EditorWrapper from './EditorWrapper';

interface OutputEditorProps {
    result?: string;
}

const OutputEditor: React.FC<OutputEditorProps> = ({ result }) => {
    return (
        <EditorWrapper title="Output" language="json" readOnly={true} value={result} />
    );
}

export default OutputEditor;
