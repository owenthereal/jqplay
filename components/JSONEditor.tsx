import Editor from './Editor';
import HTTP from './HTTP';
import TabList from './TabList';

interface JSONEditorProps {
    value?: string;
    handleJSONChange: (value: string | undefined) => void;
    handleHTTPChange: (method: string, url: string, headers?: string, body?: string) => void;
}

const JSONEditor: React.FC<JSONEditorProps> = ({ value, handleJSONChange, handleHTTPChange }) => {
    return (
        <TabList tabs={[
            { label: "JSON", value: "editor", content: <Editor handleChange={handleJSONChange} value={value} language="json" readOnly={false} /> },
            { label: "HTTP", value: "http", content: <HTTP handleHttp={handleHTTPChange} /> },
        ]} />
    )
}

export default JSONEditor;
