import MonacoEditor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
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
    function handleEditorDidMount(editor: editor.IStandaloneCodeEditor) {
        const removableIds = ['editor.action.changeAll', 'editor.action.quickCommand'];
        const contextmenu = editor.getContribution('editor.contrib.contextmenu') as any;

        if (contextmenu && typeof contextmenu._getMenuActions === 'function') {
            const realMethod = contextmenu?._getMenuActions;
            contextmenu._getMenuActions = function () {
                let items = realMethod.apply(contextmenu, arguments);
                items = items.filter(function (item: { id: string }) {
                    return !removableIds.includes(item.id);
                });

                // Remove leading separator
                if (items.length > 0 && items[0].id === 'vs.actions.separator') {
                    items = items.slice(1)
                }
                // Remove trailing separator
                if (items.length > 0 && items[items.length - 1].id === 'vs.actions.separator') {
                    items = items.slice(0, items.length - 1)
                }

                return items;
            };
        }
    }

    return (
        <Box component={Paper} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <Typography variant="h6" sx={{ p: 1 }}>
                {title}
            </Typography>
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
                    }}
                />
            </Box>
        </Box>
    );
};

export default Editor;
