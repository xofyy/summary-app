import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  const navLinkClass = (path: string) => `
    relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 
    ${isActiveLink(path) 
      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 shadow-soft' 
      : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800/50'
    }
    before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r 
    before:from-primary-500 before:to-primary-600 before:opacity-0 before:transition-opacity 
    hover:before:opacity-10 dark:hover:before:opacity-20 before:-z-10
  `;

  return (
    <header className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-lg border-b border-secondary-200 dark:border-secondary-700 sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-medium group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-heading font-semibold bg-gradient-to-r from-secondary-900 to-secondary-700 dark:from-white dark:to-secondary-200 bg-clip-text text-transparent">
                  Summary AI
                </h1>
                <p className="text-2xs text-secondary-500 dark:text-secondary-400 -mt-1">
                  Akıllı Özet
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Link to="/" className={navLinkClass('/')}>
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    <span>Ana Sayfa</span>
                  </span>
                </Link>
                <Link to="/interests" className={navLinkClass('/interests')}>
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>İlgi Alanları</span>
                  </span>
                </Link>
                <Link to="/sources" className={navLinkClass('/sources')}>
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                    </svg>
                    <span>RSS Kaynakları</span>
                  </span>
                </Link>
                
                {/* Theme Toggle */}
                <div className="hidden lg:block">
                  <ThemeToggle />
                </div>
                
                {/* User Menu */}
                <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-secondary-200 dark:border-secondary-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-500 rounded-lg flex items-center justify-center shadow-soft">
                      <span className="text-white text-sm font-semibold">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-secondary-900">
                        {user?.email?.split('@')[0]}
                      </p>
                      <p className="text-2xs text-secondary-500">
                        {user?.interests?.length || 0} ilgi alanı
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-error-600 bg-error-50 rounded-xl hover:bg-error-100 hover:text-error-700 transition-all duration-200 shadow-soft hover:shadow-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Çıkış</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-secondary-600 hover:text-primary-600 rounded-xl hover:bg-secondary-50 transition-all duration-200"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-medium hover:shadow-glow transform hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Kayıt Ol</span>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200 dark:border-secondary-700 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-sm animate-slide-down">
            <nav className="flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/"
                    className={`${navLinkClass('/')} block`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ana Sayfa
                  </Link>
                  <Link
                    to="/interests"
                    className={`${navLinkClass('/interests')} block`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    İlgi Alanları
                  </Link>
                  <Link
                    to="/sources"
                    className={`${navLinkClass('/sources')} block`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    RSS Kaynakları
                  </Link>
                  
                  {/* Mobile Theme Toggle */}
                  <div className="px-4 py-2">
                    <ThemeToggle />
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user?.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-secondary-600">{user?.email}</span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="px-3 py-1 text-sm text-error-600 bg-error-50 rounded-lg hover:bg-error-100 transition-colors"
                    >
                      Çıkış
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-sm text-secondary-600 hover:text-primary-600 rounded-lg hover:bg-secondary-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 text-sm text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Kayıt Ol
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;