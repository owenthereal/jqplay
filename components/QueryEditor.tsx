import Editor from '@monaco-editor/react';
import { Box, Typography, Paper } from '@mui/material';

interface JQQueryEditorProps {
  darkMode: boolean;
  handleChange: (value: string | undefined) => void;
}

const JQQueryEditor: React.FC<JQQueryEditorProps> = ({ darkMode, handleChange }) => (
  <Box component={Paper} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
    <Typography variant="h6" sx={{ p: 1 }}>
      Query
    </Typography>
    <Box sx={{ flexGrow: 1, borderTop: '1px solid', borderColor: 'divider' }}>
      <Editor
        height="100%"
        width="100%"
        defaultLanguage="plaintext"
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

export default JQQueryEditor;
