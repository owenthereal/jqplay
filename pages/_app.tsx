import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { AppProps } from 'next/app';
import { useState, useEffect } from 'react';

const theme = createTheme({
    palette: {
        mode: 'dark', // Use 'light' for light mode
    },
});

function MyApp({ Component, pageProps }: AppProps) {
    const [darkMode, setDarkMode] = useState(true);

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

    const appliedTheme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    return (
        <ThemeProvider theme={appliedTheme}>
            <CssBaseline />
            <Component {...pageProps} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </ThemeProvider>
    );
}

export default MyApp;
