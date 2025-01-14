import { Box, CircularProgress, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDarkMode } from './ThemeProvider';
import dynamic from 'next/dynamic';
import { InitMonacoEditor } from './InitMonacoEditor';

// Dynamically load MonacoEditor without SSR
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false,
});

interface EditorProps {
    language: string;
    readOnly?: boolean;
    value?: string;
    handleChange?: (value: string | undefined) => void;
}

const Editor: React.FC<EditorProps> = ({ handleChange, value, language, readOnly }) => {
    const { darkMode } = useDarkMode();
    const theme = useTheme();
    const [monacoConfigured, setMonacoConfigured] = useState(false);

    useEffect(() => {
        const configureMonaco = async () => {
            try {
                await InitMonacoEditor(); // Configure Monaco globally
                setMonacoConfigured(true); // Set the local state to true
            } catch (error) {
                console.error('Failed to configure Monaco:', error);
            }
        };

        configureMonaco();
    }, []);

    const customizeContextMenu = (editor: any) => {
        try {
            const removableIds = ['editor.action.changeAll', 'editor.action.quickCommand'];
            const contextmenu = editor.getContribution('editor.contrib.contextmenu');
            if (!contextmenu) return;
            const realMethod = contextmenu._getMenuActions;
            contextmenu._getMenuActions = function () {
                let items = realMethod.apply(contextmenu, arguments);
                items = items.filter((item: { id: string }) => !removableIds.includes(item.id));
                if (items.length > 0 && items[0].id === 'vs.actions.separator') {
                    items = items.slice(1);
                }
                if (items.length > 0 && items[items.length - 1].id === 'vs.actions.separator') {
                    items = items.slice(0, -1);
                }
                return items;
            };
        } catch (error) {
            console.error('Error customizing context menu:', error);
        }
    };

    const handleEditorDidMount = (editor: any) => {
        customizeContextMenu(editor);
    };

    const loadingComponent = (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
            <CircularProgress />
        </Box>
    );

    if (!monacoConfigured) {
        return loadingComponent;
    }

    return (
        <MonacoEditor
            height="100%"
            width="100%"
            defaultLanguage={language}
            theme={darkMode ? 'vs-dark' : 'light'}
            value={value}
            loading={loadingComponent}
            onChange={handleChange}
            onMount={handleEditorDidMount}
            options={{
                readOnly,
                minimap: { enabled: false },
                scrollbar: { vertical: 'auto', horizontal: 'auto' },
                fontSize: parseInt(theme.typography.body2.fontSize?.toString() || '12'),
                fontFamily: theme.typography.body2.fontFamily,
                lineNumbers: 'on',
                automaticLayout: true,
            }}
        />
    );
};

export default Editor;
