import { useState, useEffect } from 'react';

export const useSystemDarkMode = () => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    useEffect(() => {
        const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            setIsDarkMode(e.matches);
        };

        // Set initial state
        setIsDarkMode(matchMedia.matches);

        // Listen for changes
        matchMedia.addEventListener('change', handleChange);

        // Clean up the event listener on component unmount
        return () => {
            matchMedia.removeEventListener('change', handleChange);
        };
    }, []);

    return isDarkMode;
};
