import { HttpInput } from "@/workers/worker";
import { Box, Grid, MenuItem, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import Editor from "./Editor";
import TabList from "./TabList";

interface HTTPProps {
    value?: HttpInput;
    minHeight?: number;
    handleHttp: (method: string, url: string, headers?: string, body?: string) => void;
}

const HTTP: React.FC<HTTPProps> = ({ value, minHeight, handleHttp }) => {
    const [method, setMethod] = useState<string>(value?.method || 'GET');
    const [url, setUrl] = useState<string | undefined>(value?.url);
    const [headers, setHeaders] = useState<string | undefined>(value?.headers);
    const [body, setBody] = useState<string | undefined>(value?.body);

    useEffect(() => {
        if (method.length === 0 || !url) {
            return;
        }

        handleHttp(method, url, headers, body);
    }, [method, url, headers, body]);

    const handleBodyChange = (value: string | undefined) => {
        setBody(value);
    }

    const handleHeadersChange = (value: string | undefined) => {
        setHeaders(value);
    }

    const bodyHeight = minHeight ? minHeight - 60 - 38 - 60 : 250;
    return (
        <Box component="form" sx={{ width: '100%' }}>
            <Grid container spacing={2} alignItems="center" sx={{ paddingLeft: 1, paddingRight: 1 }}>
                <Grid item xs={3}>
                    <TextField
                        select
                        label="Method"
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        fullWidth
                        margin="normal"
                    >
                        {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'].map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={9}>
                    <TextField
                        label="URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                </Grid>
            </Grid>
            <Grid container spacing={1} sx={{ flexGrow: 1, paddingLeft: 1, paddingRight: 1 }}>
                <Grid item xs={12} md={12} sx={{ display: 'flex', flexDirection: 'column', minHeight: bodyHeight }}>
                    <TabList tabs={[
                        { label: "Body", value: "body", content: <Editor value={body} language="json" readOnly={method == 'HEAD' || method == 'GET'} handleChange={handleBodyChange} /> },
                        { label: "Headers", value: "headers", content: <Editor value={headers} language="json" readOnly={false} handleChange={handleHeadersChange} /> },
                    ]} />
                </Grid>
            </Grid>
        </Box >
    );
};

export default HTTP;
