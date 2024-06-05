import React from 'react';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });
interface FlagsProps {
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

const Flags: React.FC<FlagsProps> = ({ darkMode, flags, setFlags }) => {
    const handleFlagChange = (selectedOptions: any) => {
        setFlags(selectedOptions ? selectedOptions.map((option: any) => option.value) : []);
    };

    const customStyles = {
        control: (styles: any) => ({
            ...styles,
            backgroundColor: darkMode ? '#1E1E1E' : '#FAFBFC',
            borderColor: darkMode ? '#30363D' : '#E1E4E8',
            color: darkMode ? '#C9D1D9' : '#24292E',
        }),
        menu: (styles: any) => ({
            ...styles,
            backgroundColor: darkMode ? '#1E1E1E' : '#FFFFFF',
            color: darkMode ? '#C9D1D9' : '#24292E',
        }),
        option: (styles: any, { isFocused }: any) => ({
            ...styles,
            backgroundColor: isFocused ? (darkMode ? '#30363D' : '#F6F8FA') : (darkMode ? '#1E1E1E' : '#FFFFFF'),
            color: darkMode ? '#C9D1D9' : '#24292E',
            ':active': {
                backgroundColor: isFocused ? (darkMode ? '#444C56' : '#D4D4D4') : (darkMode ? '#1E1E1E' : '#FFFFFF'),
            },
        }),
        multiValue: (styles: any) => ({
            ...styles,
            backgroundColor: darkMode ? '#3C4048' : '#E1E4E8',
            color: darkMode ? '#C9D1D9' : '#24292E',
        }),
        multiValueLabel: (styles: any) => ({
            ...styles,
            color: darkMode ? '#C9D1D9' : '#24292E',
        }),
        multiValueRemove: (styles: any) => ({
            ...styles,
            color: darkMode ? '#C9D1D9' : '#24292E',
            ':hover': {
                backgroundColor: darkMode ? '#444C56' : '#D4D4D4',
                color: darkMode ? '#C9D1D9' : '#24292E',
            },
        }),
        placeholder: (styles: any) => ({
            ...styles,
            color: darkMode ? '#C9D1D9' : '#666666',
        }),
        input: (styles: any) => ({
            ...styles,
            color: darkMode ? '#C9D1D9' : '#24292E',
        }),
        singleValue: (styles: any) => ({
            ...styles,
            color: darkMode ? '#C9D1D9' : '#24292E',
        }),
    };

    return (
        <div className="w-full flex flex-col">
            <div className="flex items-center">
                <h2 className="tab-title">Flags</h2>
            </div>
            <Select
                isMulti
                value={flagsOptions.filter(option => flags.includes(option.value))}
                onChange={handleFlagChange}
                options={flagsOptions}
                styles={customStyles}
                placeholder="Select flags"
            />
        </div>
    );
};

export default Flags;
