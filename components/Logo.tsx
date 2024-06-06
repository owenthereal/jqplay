import React from 'react';

const Logo = ({ darkMode }: { darkMode: boolean }) => {
    const fillColor = darkMode ? "#ffffff" : "#212121";

    return (
        <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="jqplay-logo">
                <text id="jq" fill={fillColor} font-family="Roboto, Arial, Helvetica, sans-serif" font-size="32" font-weight="bold">
                    <tspan x="0" y="32">jq</tspan>
                </text>
                <polygon id="play-button" points="40,16 55,24 40,32" fill="#1976d2" />
                <text id="play" fill={fillColor} font-family="Roboto, Arial, Helvetica, sans-serif" font-size="32" font-weight="bold">
                    <tspan x="60" y="32">play</tspan>
                </text>
            </g>
        </svg>
    );
};

export default Logo;
