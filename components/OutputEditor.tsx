import Editor from '@monaco-editor/react';
import { Box, Typography, Paper } from '@mui/material';

interface OutputEditorProps {
    darkMode: boolean;
    result: string;
}

const OutputEditor: React.FC<OutputEditorProps> = ({ darkMode, result }) => (
    <Box component={Paper} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Typography variant="h6" sx={{ p: 1 }}>
            Output
        </Typography>
        <Box sx={{ flexGrow: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Editor
                height="100%"
                width="100%"
                defaultLanguage="json"
                value={result}
                theme={darkMode ? 'vs-dark' : 'light'}
                options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollbar: { vertical: 'auto', horizontal: 'auto' },
                    fontSize: 14,
                }}
            />
        </Box>
    </Box>
);

export default OutputEditor;
