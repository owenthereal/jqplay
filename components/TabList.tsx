import { Box, Paper, useTheme } from '@mui/material';
import React from 'react';
import Tab from '@mui/material/Tab';
import { TabContext, TabList as MTabList, TabPanel } from '@mui/lab';
import { useDarkMode } from './ThemeProvider';

interface TabItem {
    label: string;
    value: string;
    content: React.ReactNode;
}

interface TabListProps {
    tabs: TabItem[];
}

const TabList: React.FC<TabListProps> = ({ tabs }) => {
    const { darkMode } = useDarkMode();
    const theme = useTheme();
    const [tab, setTab] = React.useState(tabs[0].value);

    const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
        setTab(newValue);
    };

    return (
        <Box component={Paper} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: 0, marginBottom: 2 }}>
            <TabContext value={tab}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <MTabList
                        aria-label={tabs[0].label}
                        textColor='inherit'
                        indicatorColor='secondary'
                        onChange={handleTabChange}
                        sx={{
                            color: darkMode ? theme.palette.common.white : theme.palette.text.primary,
                            paddingBottom: 1,
                            paddingLeft: 1,
                        }}
                    >
                        {tabs.map(({ label, value }) => (
                            <Tab key={value} label={label} value={value} sx={{ padding: 0, fontSize: theme.typography.h6 }} />
                        ))}
                    </MTabList>
                </Box>
                {tabs.map(({ value, content }) => (
                    <TabPanel key={value} value={value} sx={{ height: "100%", width: "100%", padding: 0 }}>
                        {content}
                    </TabPanel>
                ))}
            </TabContext >
        </Box >
    );
};

export default TabList;
