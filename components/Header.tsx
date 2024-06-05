import Image from 'next/image';
import { Switch } from '@headlessui/react';

interface HeaderProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => (
    <div className="flex items-center mb-8 w-full max-w-7xl">
        <Image src="/logo.png" alt="jqplay logo" width={40} height={40} />
        <h1 className="text-4xl font-bold ml-2">jqPlay</h1>
        <div className="ml-auto">
            <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                className={`${darkMode ? 'bg-blue-600' : 'bg-gray-200'
                    } relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
                <span
                    className={`${darkMode ? 'translate-x-6' : 'translate-x-1'
                        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                />
            </Switch>
        </div>
    </div>
);

export default Header;
