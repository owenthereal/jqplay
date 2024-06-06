import Editor from './Editor';

interface OutputEditorProps {
    darkMode: boolean;
    result: string;
}

const OutputEditor: React.FC<OutputEditorProps> = ({ darkMode, result }) => (
    <Editor title="Output" darkMode={darkMode} language="json" readOnly={true} value={result} />
);

export default OutputEditor;
