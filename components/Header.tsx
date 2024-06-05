import { Switch } from '@headlessui/react';

interface HeaderProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
    onShare: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode, onShare }) => {
    return (
        <header className="w-full flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 mb-6">
            <div className="flex items-center">
                <img src="/logo.png" alt="jqPlay" className="h-8 mr-2" />
                <h1 className="text-xl font-bold">jqPlay</h1>
            </div>
            <div className="flex items-center">
                <button
                    onClick={onShare}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md mr-4"
                >
                    Share
                </button>
                <Switch
                    checked={darkMode}
                    onChange={toggleDarkMode}
                    className={`${darkMode ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                    <span className="sr-only">Enable dark mode</span>
                    <span
                        className={`${darkMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                </Switch>
            </div>
        </header>
    );
};

export default Header;
