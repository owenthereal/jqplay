import React from 'react';

type LogoProps = {
    darkMode: boolean;
};

const Logo: React.FC<LogoProps> = ({ darkMode }) => {
    const fillColor = darkMode ? "#ffffff" : "#212121";

    return (
        <svg
            width="130"
            height="40"
            viewBox="0 0 120 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-labelledby="title desc"
        >
            <title id="title">jqplay Logo</title>
            <desc id="desc">Logo for jqplay with a play button</desc>
            <g id="jqplay-logo">
                <text
                    id="jq"
                    fill={fillColor}
                    fontFamily="Roboto, Arial, Helvetica, sans-serif"
                    fontSize="32"
                    fontWeight="bold"
                >
                    <tspan x="0" y="32">jq</tspan>
                </text>
                <polygon id="play-button" points="40,16 55,24 40,32" fill="#1976d2" />
                <text
                    id="play"
                    fill={fillColor}
                    fontFamily="Roboto, Arial, Helvetica, sans-serif"
                    fontSize="32"
                    fontWeight="bold"
                >
                    <tspan x="60" y="32">play</tspan>
                </text>
            </g>
        </svg>
    );
};

export default Logo;
