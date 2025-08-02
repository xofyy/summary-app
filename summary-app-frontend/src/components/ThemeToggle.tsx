import React from 'react';
import { useThemeStore } from '../store/themeStore';

const ThemeToggle: React.FC = () => {
  const { theme, isDarkMode, setTheme } = useThemeStore();

  const toggleOptions = [
    {
      value: 'light' as const,
      label: 'Light',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    },
    {
      value: 'system' as const,
      label: 'System',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative">
      <div className="flex items-center bg-secondary-100 dark:bg-secondary-800 rounded-xl p-1 transition-colors">
        {toggleOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`
              relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${theme === option.value
                ? 'bg-white dark:bg-secondary-700 text-primary-600 dark:text-primary-400 shadow-soft'
                : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400'
              }
            `}
            title={`Switch to ${option.label.toLowerCase()} mode`}
          >
            <span className="flex items-center justify-center">
              {option.icon}
            </span>
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeToggle;