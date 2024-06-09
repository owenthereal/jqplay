import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
    useTheme,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SectionTitle from './SectionTitle';

const cheatsheetData = [
    { query: '.', description: 'unchanged input', json: '{ "foo": { "bar": { "baz": 123 } } }' },
    { query: '.foo', description: 'value at key', json: '{ "foo": { "bar": "baz" } }' },
    { query: '.[]', description: 'array operation', json: '[1, 2, 3]' },
    { query: '{foo: .foo, bar: .bar}', description: 'object construction', json: '{ "foo": 1, "bar": 2 }' },
    { query: 'length', description: 'length of a value', json: '[1, 2, 3]' },
    { query: 'keys', description: 'keys in an array', json: '{ "foo": 1, "bar": 2 }' },
    { query: '.[] | select(.foo == "bar")', description: 'input unchanged if foo returns true', json: '[{ "foo": "bar" }, { "foo": "baz" }]' },
    { query: 'map(.foo)', description: 'invoke filter foo for each input', json: '[{ "foo": 1 }, { "foo": 2 }]' },
    { query: 'if .foo then .bar else .baz end', description: 'conditionals', json: '{ "foo": true, "bar": "yes", "baz": "no" }' },
    { query: '"\\(.foo)"', description: 'string interpolation', json: '{ "foo": "bar" }' },
    { query: 'add', description: 'sum all the numbers in an array', json: '[1, 2, 3]' },
    { query: '.foo | contains(["bar"])', description: 'checks if a value is in the input', json: '{ "foo": ["bar", "baz"] }' }
];

interface CheatsheetDialogProps {
    open: boolean;
    onClose: () => void;
    onExampleClick: (json: string, query: string) => void;
}

const CheatsheetDialog: React.FC<CheatsheetDialogProps> = ({ open, onClose, onExampleClick }) => {
    const theme = useTheme();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Cheatsheet</Typography>
                <IconButton aria-label="close" onClick={onClose} sx={{ color: theme.palette.grey[500] }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <TableContainer component={Paper} sx={{ backgroundColor: theme.palette.background.default }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Typography fontSize={theme.typography.fontSize} sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                                        Example
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography fontSize={theme.typography.fontSize} sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                                        Description
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cheatsheetData.map((row, index) => (
                                <TableRow
                                    key={index}
                                    onClick={() => onExampleClick(row.json, row.query)}
                                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.action.hover } }}
                                >
                                    <TableCell>
                                        <Typography fontSize={theme.typography.fontSize} component="span" sx={{ color: theme.palette.text.secondary }}>
                                            <code>{row.query}</code>
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontSize={theme.typography.fontSize} sx={{ color: theme.palette.text.secondary }}>
                                            {row.description}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
        </Dialog>
    );
};

export default CheatsheetDialog;
