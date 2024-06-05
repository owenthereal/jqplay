import React from 'react';

import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });

interface FlagsSelectorProps {
    darkMode: boolean;
    flags: string[];
    setFlags: (flags: string[]) => void;
}

const flagsOptions = [
    { value: '-c', label: '-c (Compact output)' },
    { value: '-M', label: '-M (Monochrome output)' },
    { value: '-r', label: '-r (Raw output)' },
    { value: '-s', label: '-s (Slurp: read into array)' },
    { value: '-S', label: '-S (Sort keys)' },
    { value: '-R', label: '-R (Raw input)' },
];

const FlagsSelector: React.FC<FlagsSelectorProps> = ({ darkMode, flags, setFlags }) => {
    const handleFlagChange = (selectedOptions: any) => {
        setFlags(selectedOptions ? selectedOptions.map((option: any) => option.value) : []);
    };

    const customStyles = {
        control: (styles: any) => ({
            ...styles,
            backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
            borderColor: darkMode ? '#3c3c3c' : '#cccccc',
            color: darkMode ? '#ffffff' : '#000000',
        }),
        menu: (styles: any) => ({
            ...styles,
            backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
            color: darkMode ? '#ffffff' : '#000000',
        }),
        option: (styles: any, { isFocused }: any) => ({
            ...styles,
            backgroundColor: isFocused ? (darkMode ? '#555555' : '#eaeaea') : (darkMode ? '#2d2d2d' : '#ffffff'),
            color: darkMode ? '#ffffff' : '#000000',
            ':active': {
                backgroundColor: isFocused ? (darkMode ? '#444444' : '#d4d4d4') : (darkMode ? '#2d2d2d' : '#ffffff'),
            },
        }),
        multiValue: (styles: any) => ({
            ...styles,
            backgroundColor: darkMode ? '#3c3c3c' : '#eaeaea',
            color: darkMode ? '#ffffff' : '#000000',
        }),
        multiValueLabel: (styles: any) => ({
            ...styles,
            color: darkMode ? '#ffffff' : '#000000',
        }),
        multiValueRemove: (styles: any) => ({
            ...styles,
            color: darkMode ? '#ffffff' : '#000000',
            ':hover': {
                backgroundColor: darkMode ? '#555555' : '#cccccc',
                color: darkMode ? '#ffffff' : '#000000',
            },
        }),
        placeholder: (styles: any) => ({
            ...styles,
            color: darkMode ? '#aaaaaa' : '#666666',
        }),
        input: (styles: any) => ({
            ...styles,
            color: darkMode ? '#ffffff' : '#000000',
        }),
        singleValue: (styles: any) => ({
            ...styles,
            color: darkMode ? '#ffffff' : '#000000',
        }),
    };

    return (
        <div className="w-full max-w-7xl mb-6 mt-6">
            <h2 className="tab-title">Flags</h2>
            <Select
                isMulti
                value={flagsOptions.filter((option) => flags.includes(option.value))}
                onChange={handleFlagChange}
                options={flagsOptions}
                styles={customStyles}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select flags"
            />
        </div>
    );
};

export default FlagsSelector;
