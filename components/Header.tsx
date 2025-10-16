import React, { useState, useEffect, useRef } from 'react';
import { LogoIcon } from './icons/NavigationIcons.tsx'; // Import the new LogoIcon

interface HeaderProps {
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-gray-800 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <LogoIcon className="h-8 w-8 text-green-400" />
                        <div className="flex-shrink-0 text-white font-bold text-xl">
                            Indian Money Code
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            {/* Profile dropdown */}
                            <div className="ml-3 relative" ref={dropdownRef}>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                                        id="user-menu-button"
                                        aria-expanded={isDropdownOpen}
                                        aria-haspopup="true"
                                    >
                                        <span className="sr-only">Open user menu</span>
                                        <img
                                            className="h-8 w-8 rounded-full"
                                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                            alt="User profile"
                                        />
                                    </button>
                                </div>
                                {isDropdownOpen && (
                                    <div 
                                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none" 
                                        role="menu" 
                                        aria-orientation="vertical" 
                                        aria-labelledby="user-menu-button"
                                    >
                                        <button
                                            onClick={onLogout}
                                            className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                                            role="menuitem"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};