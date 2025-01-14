import { createContext, useContext, useState, ReactNode, useEffect, FC } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

interface ThemeContextType {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useDarkMode = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setDarkMode(savedTheme === 'dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            primary: {
                main: darkMode ? '#61dafb' : '#007acc',
            },
            secondary: {
                main: darkMode ? '#f6f8fa' : '#282c34',
            },
            background: {
                default: darkMode ? '#1e1e1e' : '#ffffff',
            },
            text: {
                primary: darkMode ? '#d4d4d4' : '#000000',
                secondary: darkMode ? '#858585' : '#333333',
            },
            action: {
                hover: darkMode ? '#333333' : '#e0e0e0',
            },
        },
        typography: {
            fontSize: 14,
            fontFamily: 'Roboto, Arial, Helvetica, sans-serif',
            h6: {
                fontWeight: 600,
                fontSize: '1rem',
                lineHeight: 1.5,
            },
            subtitle1: {
                fontWeight: 600,
                fontSize: '0.875rem',
                lineHeight: 1.5,
            },
            subtitle2: {
                fontWeight: 600,
                fontSize: '0.75rem',
                lineHeight: 1.5,
            },
            body1: {
                fontWeight: 400,
                fontSize: 14,
            },
            // editor font
            body2: {
                fontSize: 14,
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
            },
        },
        shape: {
            borderRadius: 4,
        },
    });

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
