import MonacoEditor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { Box, Typography, Paper, useTheme, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

interface EditorProps {
    title: string;
    darkMode: boolean;
    language: string;
    readOnly?: boolean;
    value?: string;
    handleChange?: (value: string | undefined) => void;
}

const Editor: React.FC<EditorProps> = ({ title, darkMode, handleChange, value, language, readOnly }) => {
    const theme = useTheme();

    const customizeContextMenu = (editor: editor.IStandaloneCodeEditor) => {
        try {
            const removableIds = ['editor.action.changeAll', 'editor.action.quickCommand'];
            const contextmenu = editor.getContribution('editor.contrib.contextmenu') as any;
            if (!contextmenu) return;
            const realMethod = contextmenu._getMenuActions;
            contextmenu._getMenuActions = function () {
                let items = realMethod.apply(contextmenu, arguments);
                items = items.filter((item: { id: string }) => !removableIds.includes(item.id));
                if (items.length > 0 && items[0].id === 'vs.actions.separator') {
                    items = items.slice(1, items.length - 1);
                }
                if (items.length > 0 && items[items.length - 1].id === 'vs.actions.separator') {
                    items = items.slice(0, items.length - 1);
                }
                return items;
            };
        } catch (error) {
            console.error('Error customizing context menu:', error);
        }
    };

    function handleEditorDidMount(editor: editor.IStandaloneCodeEditor) {
        customizeContextMenu(editor);
    }

    return (
        <Box component={Paper} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: 0, marginBottom: 2 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: darkMode ? theme.palette.grey[800] : theme.palette.grey[100],
                    color: darkMode ? theme.palette.common.white : theme.palette.text.primary,
                    padding: theme.spacing(1),
                    borderBottom: `1px solid ${darkMode ? theme.palette.grey[700] : theme.palette.grey[300]}`,
                    borderTopLeftRadius: theme.shape.borderRadius,
                    borderTopRightRadius: theme.shape.borderRadius,
                }}
            >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {title}
                </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                <MonacoEditor
                    height="100%"
                    width="100%"
                    defaultLanguage={language}
                    theme={darkMode ? 'vs-dark' : 'light'}
                    value={value}
                    onChange={handleChange}
                    onMount={handleEditorDidMount}
                    options={{
                        readOnly: readOnly,
                        minimap: { enabled: false },
                        scrollbar: { vertical: 'auto', horizontal: 'auto' },
                        fontSize: 14,
                        lineNumbers: 'on',
                        automaticLayout: true,
                    }}
                />
            </Box>
        </Box>
    );
};

export default Editor;
