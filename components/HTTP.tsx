import { HttpInput } from "@/workers/worker";
import { Box, Grid, MenuItem, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

interface HTTPProps {
    value?: HttpInput
    handleHttp: (method: string, url: string, headers?: string, body?: string) => void;
}

const HTTP: React.FC<HTTPProps> = ({ value, handleHttp }) => {
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

    return (
        <Box component="form" sx={{ minWidth: "90%", mx: 1, mt: 1 }}>
            <Grid container spacing={1} alignItems="center">
                <Grid item xs={2}>
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
                <Grid item xs={10}>
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
            <TextField
                label="Headers (JSON format)"
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={4}
            />
            <TextField
                label="Body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={6}
                disabled={method === 'GET' || method === 'HEAD'}
            />
        </Box>
    );
}

export default HTTP;
