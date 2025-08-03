import React, { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, setTheme, theme } = useThemeStore();

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-secondary-600 dark:text-secondary-300">
        {isDarkMode ? '🌙' : '☀️'}
      </span>
      <button
        onClick={toggleTheme}
        className="relative inline-flex items-center w-14 h-7 bg-secondary-200 dark:bg-secondary-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-inner hover:bg-secondary-300 dark:hover:bg-secondary-600"
        title={isDarkMode ? 'Açık temaya geç' : 'Koyu temaya geç'}
      >
        <span className="sr-only">Tema değiştir</span>
        <div className={`
          inline-block w-5 h-5 transform transition-all duration-300 ease-in-out rounded-full shadow-lg
          ${isDarkMode 
            ? 'translate-x-8 bg-gradient-to-br from-primary-400 to-purple-500 scale-110' 
            : 'translate-x-1 bg-gradient-to-br from-yellow-400 to-orange-500 scale-100'
          }
        `}>
          <div className="flex items-center justify-center w-full h-full">
            {isDarkMode ? (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </button>
      <span className="text-xs text-secondary-600 dark:text-secondary-300 min-w-[40px]">
        {isDarkMode ? 'Koyu' : 'Açık'}
      </span>
    </div>
  );
};

export default ThemeToggle;