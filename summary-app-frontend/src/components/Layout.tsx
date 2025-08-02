import React from 'react';
import Header from './Header';
import NetworkStatusIndicator from './NetworkStatusIndicator';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 dark:from-secondary-900 dark:via-secondary-800 dark:to-secondary-900 transition-colors">
      <NetworkStatusIndicator />
      <Header />
      <main className="flex-1 animate-fade-in">
        {children}
      </main>
      <footer className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-sm border-t border-secondary-200 dark:border-secondary-700 mt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-soft">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-heading font-medium text-secondary-700 dark:text-secondary-300">
                Summary AI
              </span>
            </div>
            <p className="text-center text-sm text-secondary-500 dark:text-secondary-400">
              © 2025 Summary AI. AI destekli habercilik platformu.
            </p>
            <div className="flex items-center space-x-4 text-xs text-secondary-400 dark:text-secondary-500">
              <span>v1.0.0</span>
              <span>•</span>
              <span>Made with ❤️ in Turkey</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;