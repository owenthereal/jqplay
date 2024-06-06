import Editor from '@monaco-editor/react';
import { Box, Typography, Paper } from '@mui/material';

interface JSONEditorProps {
    darkMode: boolean;
    handleChange: (value: string | undefined) => void;
}

const JSONEditor: React.FC<JSONEditorProps> = ({ darkMode, handleChange }) => (
    <Box component={Paper} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Typography variant="h6" sx={{ p: 1 }}>
            JSON
        </Typography>
        <Box sx={{ flexGrow: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Editor
                height="100%"
                width="100%"
                defaultLanguage="json"
                theme={darkMode ? 'vs-dark' : 'light'}
                onChange={handleChange}
                options={{
                    readOnly: false,
                    minimap: { enabled: false },
                    scrollbar: { vertical: 'auto', horizontal: 'auto' },
                    fontSize: 14,
                }}
            />
        </Box>
    </Box>
);

export default JSONEditor;
