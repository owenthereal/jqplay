import { Box, Typography, useTheme, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDarkMode } from './ThemeProvider';

interface SectionTitleProps {
    title: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => {
    const { darkMode } = useDarkMode();
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: darkMode ? theme.palette.common.white : theme.palette.text.primary,
                padding: theme.spacing(1.5),
                borderBottom: `1px solid ${darkMode ? theme.palette.grey[700] : theme.palette.grey[300]}`,
            }}
        >
            <Typography variant="h6">
                {title}
            </Typography>
        </Box>
    );
}

export default SectionTitle;
