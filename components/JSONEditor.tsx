import Editor from './Editor';
import HTTP from './HTTP';
import TabList from './TabList';
import { JsonInput } from '@/workers';
import { HttpInput } from '@/workers/worker';

interface JSONEditorProps {
    input?: JsonInput;
    minHeight?: number;
    handleJSONChange: (value: string | undefined) => void;
    handleHTTPChange: (method: string, url: string, headers?: string, body?: string) => void;
}

const JSONEditor: React.FC<JSONEditorProps> = ({ input, minHeight, handleJSONChange, handleHTTPChange }) => {
    let json: string | undefined = undefined;
    let http: HttpInput | undefined = undefined;
    if (typeof input === 'string') {
        json = input
    } else {
        http = input
    }

    return (
        <TabList tabs={[
            { label: "JSON", value: "editor", content: <Editor handleChange={handleJSONChange} value={json} language="json" readOnly={false} /> },
            { label: "HTTP", value: "http", content: <HTTP handleHttp={handleHTTPChange} value={http} minHeight={minHeight} /> },
        ]} />
    )
}

export default JSONEditor;
