import { AppBar, Toolbar, IconButton, Box, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Brightness4, Brightness7, ContentCopy, Help, Share, VolunteerActivism } from '@mui/icons-material';
import Logo from './Logo';
import Link from 'next/link';
import { useDarkMode } from './ThemeProvider';
import { MouseEvent, useState } from 'react';
import CheatSheetDialog from './CheatSheetDialog';

interface HeaderProps {
    onShare: () => void;
    onExampleClick: (json: string, query: string) => void;
    onCopyClick: () => void;
    enableCopyButton: boolean;
}

const Header: React.FC<HeaderProps> = ({ onShare, onExampleClick, onCopyClick, enableCopyButton }) => {
    const { darkMode, toggleDarkMode } = useDarkMode();
    const [cheatsheetOpen, setCheatSheetOpen] = useState<boolean>(false);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const toolbarStyle: React.CSSProperties = {
        backgroundColor: darkMode ? '#333333' : '#f5f5f5',
        color: darkMode ? '#ffffff' : '#333333',
    };

    const subtitleStyle: React.CSSProperties = {
        color: darkMode ? '#cccccc' : '#666666',
    };

    function handleCheatsheetOpen(event: MouseEvent<HTMLButtonElement>): void {
        setCheatSheetOpen(true);
    }

    function handleCheatsheetClose(): void {
        setCheatSheetOpen(false);
    }

    function handleExampleClick(json: string, query: string): void {
        setCheatSheetOpen(false);
        onExampleClick(json, query);
    }

    return (
        <AppBar position="static" style={toolbarStyle}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Link href="/" passHref style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <Logo darkMode={darkMode} />
                    </Link>
                    {!isSmallScreen && (
                        <Typography variant="subtitle1" sx={subtitleStyle} ml={1}>
                            A playground for <Link href="https://jqlang.github.io/jq" passHref style={{ textDecoration: 'none', color: 'inherit' }}>jq</Link>
                        </Typography>
                    )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                        <IconButton color="inherit" onClick={toggleDarkMode} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} >
                            {darkMode ? <Brightness7 /> : <Brightness4 />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy command to clipboard">
                        <div>
                            <IconButton color="inherit" onClick={onCopyClick} aria-label="Copy command to clipboard" disabled={!enableCopyButton}>
                                <ContentCopy />
                            </IconButton>
                        </div>
                    </Tooltip>
                    <Tooltip title="Cheatsheet">
                        <IconButton color="inherit" onClick={handleCheatsheetOpen} aria-label="Cheatsheet">
                            <Help />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Share">
                        <IconButton color="inherit" onClick={onShare} aria-label="Share">
                            <Share />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Sponsor">
                        <IconButton color="inherit" aria-label="Sponsor">
                            <Link href="https://github.com/sponsors/owenthereal" passHref={true}>
                                <VolunteerActivism />
                            </Link>
                        </IconButton>
                    </Tooltip>
                    <CheatSheetDialog onExampleClick={handleExampleClick} open={cheatsheetOpen} onClose={handleCheatsheetClose} />
                </Box>
            </Toolbar>
        </AppBar >
    );
};

export default Header;
