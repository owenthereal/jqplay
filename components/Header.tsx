// components/Header.tsx
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { Brightness4, Brightness7, Share } from '@mui/icons-material';

interface HeaderProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
    onShare: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode, onShare }) => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
                    jqplay
                </Typography>
                <IconButton color="inherit" onClick={onShare} title='Share snippet'>
                    <Share />
                </IconButton>
                <IconButton color="inherit" onClick={toggleDarkMode} title={darkMode ? 'Light mode' : 'Dark mode'}>
                    {darkMode ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
