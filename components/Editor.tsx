import MonacoEditor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { Box, Paper, useTheme } from '@mui/material';
import React from 'react';
import Tab from '@mui/material/Tab';
import { TabContext, TabList, TabPanel } from '@mui/lab';

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
            <TabContext value={title}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList
                        aria-label={title}
                        textColor='inherit'
                        indicatorColor='secondary'
                        sx={{
                            color: darkMode ? theme.palette.common.white : theme.palette.text.primary,
                            paddingBottom: 1,
                            paddingLeft: 1,
                        }}
                    >
                        <Tab label={title} value={title} sx={{ padding: 0, fontSize: theme.typography.h6 }} />
                    </TabList>
                </Box>
                <TabPanel value={title} sx={{ height: "100%", width: "100%", padding: 0 }}>
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
                            fontSize: theme.typography.body2.fontSize ? parseInt(theme.typography.body2.fontSize.toString()) : 12,
                            fontFamily: theme.typography.body2.fontFamily,
                            lineNumbers: 'on',
                            automaticLayout: true,
                        }}
                    />
                </TabPanel>
            </TabContext >
        </Box >
    );
};

export default Editor;
