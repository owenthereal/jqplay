import React from 'react';

type LogoProps = {
    darkMode: boolean;
};

const Logo: React.FC<LogoProps> = ({ darkMode }) => {
    return (
        <img
            src="/jq.svg"
            alt="jq logo"
            style={{
                height: '1.5em',
                width: 'auto',
            }}
        />
    );
};

export default Logo;
