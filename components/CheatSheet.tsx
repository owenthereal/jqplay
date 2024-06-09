import { Box, Grid, Typography, Paper, useTheme } from '@mui/material';
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

interface CheatsheetProps {
    onExampleClick: (json: string, query: string) => void;
}

const Cheatsheet: React.FC<CheatsheetProps> = ({ onExampleClick }) => {
    const theme = useTheme();

    return (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 3 }}>
            <SectionTitle title="Cheatsheet" />
            <Grid container spacing={2} mt={1}>
                {cheatsheetData.map((row, index) => (
                    <Grid item xs={12} sm={6} key={index} onClick={() => onExampleClick(row.json, row.query)} sx={{ cursor: 'pointer' }}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', color: theme.palette.text.secondary, backgroundColor: theme.palette.background.default, padding: theme.spacing(0.5), borderRadius: theme.shape.borderRadius, whiteSpace: 'pre-wrap' }}>
                                {`\`${row.query}\``}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                                {row.description}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Cheatsheet;
