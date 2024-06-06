import MonacoEditor from '@monaco-editor/react';
import { Box, Typography, Paper } from '@mui/material';

interface EditorProps {
    title: string;
    darkMode: boolean;
    language: string;
    readOnly?: boolean;
    value?: string;
    handleChange?: (value: string | undefined) => void;
}

const Editor: React.FC<EditorProps> = ({ title, darkMode, handleChange, value, language, readOnly }) => {
    return (
        <Box component={Paper} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <Typography variant="h6" sx={{ p: 1 }}>
                {title}
            </Typography>
            <Box sx={{ flexGrow: 1, borderColor: 'divider' }}>
                <MonacoEditor
                    height="100%"
                    width="100%"
                    defaultLanguage={language}
                    theme={darkMode ? 'vs-dark' : 'light'}
                    value={value}
                    onChange={handleChange}
                    options={{
                        readOnly: readOnly,
                        minimap: { enabled: false },
                        scrollbar: { vertical: 'auto', horizontal: 'auto' },
                        fontSize: 14,
                    }}
                />
            </Box>
        </Box>
    );
};

export default Editor;
