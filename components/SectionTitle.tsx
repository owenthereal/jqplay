import { Box, Typography, useTheme, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDarkMode } from './ThemeProvider';

interface SectionTitleProps {
    title: string;
    onClose?: () => void;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, onClose }) => {
    const { darkMode } = useDarkMode();
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                //backgroundColor: darkMode ? theme.palette.grey[900] : theme.palette.grey[100],
                color: darkMode ? theme.palette.common.white : theme.palette.text.primary,
                padding: theme.spacing(1.5),
                borderBottom: `1px solid ${darkMode ? theme.palette.grey[700] : theme.palette.grey[300]}`,
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {title}
            </Typography>
            {onClose && (
                <IconButton aria-label="close" onClick={onClose} sx={{ color: theme.palette.grey[500] }}>
                    <CloseIcon />
                </IconButton>
            )}
        </Box>
    );
}

export default SectionTitle;
