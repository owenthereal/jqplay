import { AppBar, Toolbar, IconButton, Box, Tooltip, Typography } from '@mui/material';
import { Brightness4, Brightness7, Share } from '@mui/icons-material';
import Logo from './Logo';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

interface HeaderProps {
    onShare: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShare }) => {
    const { darkMode, toggleDarkMode } = useTheme();

    const toolbarStyle = {
        backgroundColor: darkMode ? '#333333' : '#f5f5f5',
        color: darkMode ? '#ffffff' : '#333333',
    };

    const subtitleStyle = {
        color: darkMode ? '#cccccc' : '#666666',
    };

    return (
        <AppBar position="static" style={toolbarStyle}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Link href="/" passHref style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <Logo darkMode={darkMode} />
                    </Link>
                    <Typography variant="subtitle1" sx={subtitleStyle} ml={2}>
                        A playground for <Link href="https://jqlang.github.io/jq" passHref style={{ textDecoration: 'none', color: 'inherit' }}>jq</Link>
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Share">
                        <IconButton color="inherit" onClick={onShare} aria-label="Share">
                            <Share />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                        <IconButton color="inherit" onClick={toggleDarkMode} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} >
                            {darkMode ? <Brightness7 /> : <Brightness4 />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Toolbar>
        </AppBar >
    );
};

export default Header;
