import { Box, Paper, MenuItem, Select, FormControl, InputLabel, Chip, SelectChangeEvent, OutlinedInput, useTheme, Typography } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';

interface OptionsProps {
    options: string[];
    setOptions: (options: string[]) => void;
}

const flagOptions: { [key: string]: string } = {
    '-c': '-c (Compact output)',
    '-n': '-n (Null input)',
    '-R': '-R (Raw input)',
    '-r': '-r (Raw output)',
    '-s': '-s (Slurp: read into array)',
    '-S': '-S (Sort keys)',
};

const OptionsSelector: React.FC<OptionsProps> = ({ options, setOptions }) => {
    const theme = useTheme();
    const [selectState, setSelectState] = useState({ open: false, focus: false });

    const handleOptionsChange = (event: SelectChangeEvent<string[]>) => {
        setOptions(event.target.value as string[]);
        setSelectState({ open: false, focus: false });
    };

    const handleDelete = (optionToDelete: string) => (event: React.MouseEvent) => {
        const newOptions = options.filter((option) => option !== optionToDelete);
        setOptions(newOptions);
        if (newOptions.length === 0) {
            setSelectState({ open: false, focus: true });
        }
    };

    return (
        <Box component={Paper} sx={{ mb: 2, p: 2 }}>
            <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
                <InputLabel id="options-label" sx={{ fontSize: theme.typography.subtitle2.fontSize }}>Options</InputLabel>
                <Select
                    labelId="options-label"
                    multiple
                    value={options}
                    open={selectState.open}
                    onOpen={() => setSelectState({ ...selectState, open: true })}
                    onClose={() => setSelectState({ ...selectState, open: false })}
                    onChange={handleOptionsChange}
                    input={
                        <OutlinedInput
                            id="select-multiple-chip"
                            label="Options"
                            sx={{ fontSize: theme.typography.subtitle2.fontSize }}
                        />
                    }
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map((value) => (
                                <Chip
                                    key={value}
                                    label={
                                        <Typography variant="subtitle2">
                                            {flagOptions[value]}
                                        </Typography>
                                    }
                                    onMouseDown={(event) => event.stopPropagation()}
                                    onDelete={handleDelete(value)}
                                />
                            ))}
                        </Box>
                    )}
                    autoFocus={selectState.focus}
                >
                    {Object.entries(flagOptions).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                            {label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box >
    );
};

export default OptionsSelector;
