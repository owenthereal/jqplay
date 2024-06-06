import { Box, Paper, MenuItem, Select, FormControl, InputLabel, Chip, SelectChangeEvent, OutlinedInput } from '@mui/material';
import React, { useState } from 'react';

interface OptionsProps {
    options: string[];
    setOptions: (options: string[]) => void;
}

const flagOptions: { [key: string]: string } = {
    '-c': '-c (Compact output)',
    '-M': '-M (Monochrome output)',
    '-r': '-r (Raw output)',
    '-s': '-s (Slurp: read into array)',
    '-S': '-S (Sort keys)',
    '-R': '-R (Raw input)',
};

const OptionsSelector: React.FC<OptionsProps> = ({ options: options, setOptions: setOptions }) => {
    const [open, setOpen] = useState(false);
    const handleOptionsChange = (event: SelectChangeEvent<string[]>) => {
        event.stopPropagation();
        setOptions(event.target.value as string[]);
        setOpen(false);
    };

    const handleDelete = (optionToDelete: string) => (event: React.MouseEvent) => {
        event.stopPropagation();
        setOptions(options.filter((option) => option !== optionToDelete));
    };

    return (
        <Box component={Paper} sx={{ mb: 2, p: 2 }}>
            <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
                <InputLabel id="options-label">Options</InputLabel>
                <Select
                    labelId="options-label"
                    multiple
                    value={options}
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                    onChange={handleOptionsChange}
                    input={<OutlinedInput id="select-multiple-chip" label="Options" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map((value) => (
                                <Chip
                                    key={value}
                                    label={flagOptions[value]}
                                    onMouseDown={(event) => event.stopPropagation()}
                                    onDelete={handleDelete(value)}
                                />
                            ))}
                        </Box>
                    )}
                >
                    {Object.entries(flagOptions).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                            {label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default OptionsSelector;
