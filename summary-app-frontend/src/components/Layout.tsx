import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NetworkStatusIndicator from './NetworkStatusIndicator';
import ThemeToggle from './ThemeToggle';
import { useAuthStore } from '../store/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();

  const navigation = [
    {
      name: 'Ana Sayfa',
      href: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'RSS Kaynakları',
      href: '/sources',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      )
    },
    {
      name: 'İlgi Alanları',
      href: '/interests',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
  ];

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900 transition-colors">
      <NetworkStatusIndicator />
      
      <div className={`flex h-screen ${!isAuthenticated ? 'justify-center items-center' : ''}`}>
        {/* Mobile sidebar backdrop - only show if authenticated */}
        {isAuthenticated && sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - only show if authenticated */}
        {isAuthenticated && (
          <aside className={`
            fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 transform transition-all duration-500 ease-out lg:translate-x-0 lg:block mobile-sidebar shadow-2xl lg:shadow-none
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
          <div className="flex flex-col h-full">
            
            {/* Logo & Brand */}
            <div className="px-6 py-6 border-b border-secondary-200/50 dark:border-secondary-700/50">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-heading font-bold text-secondary-900 dark:text-white">
                    Summary AI
                  </h1>
                  <p className="text-xs text-secondary-600 dark:text-secondary-300">
                    Akıllı Özet Platformu
                  </p>
                </div>
              </Link>
            </div>
            
            {/* User Profile Card */}
            <div className="px-4 py-4">
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs opacity-80 font-medium">Hoş geldin</p>
                      <p className="font-semibold truncate">{user?.name || 'Kullanıcı'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                      <p className="text-lg font-bold">12</p>
                      <p className="text-xs opacity-75">Özet</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                      <p className="text-lg font-bold">3</p>
                      <p className="text-xs opacity-75">Kaynak</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4">
              <div className="mb-3">
                <h3 className="text-xs font-bold text-secondary-600 dark:text-secondary-300 uppercase tracking-wider px-3">
                  Navigasyon
                </h3>
              </div>
              <ul className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        group relative flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02]
                        ${isCurrentPath(item.href)
                          ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-md'
                          : 'text-secondary-700 dark:text-secondary-200 hover:bg-gradient-to-r hover:from-secondary-100 hover:to-secondary-50 dark:hover:from-secondary-700/50 dark:hover:to-secondary-800/50 hover:text-secondary-900 dark:hover:text-white'
                        }
                      `}
                    >
                      <div className={`
                        p-1.5 rounded-lg transition-all duration-300
                        ${isCurrentPath(item.href) 
                          ? 'bg-white/20 text-white' 
                          : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 group-hover:bg-secondary-200 dark:group-hover:bg-secondary-600'
                        }
                      `}>
                        {item.icon}
                      </div>
                      <span className="font-medium text-sm">{item.name}</span>
                      {isCurrentPath(item.href) && (
                        <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full shadow-sm animate-pulse"></div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Theme Toggle */}
            <div className="px-4 py-3 border-t border-secondary-200/50 dark:border-secondary-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-secondary-600 dark:text-secondary-300 uppercase tracking-wider">
                  Tema
                </h3>
                <ThemeToggle />
              </div>
            </div>

            {/* Logout */}
            <div className="px-4 pb-4">
              <button
                onClick={logout}
                className="group relative flex items-center space-x-3 w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span>Çıkış Yap</span>
                </div>
              </button>
            </div>
          </div>
          </aside>
        )}

        {/* Main content */}
        <main className={`flex-1 overflow-y-auto animate-fade-in ${!isAuthenticated ? 'flex items-center justify-center' : ''}`}>
          {/* Mobile menu button - only show if authenticated */}
          {isAuthenticated && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden fixed top-4 left-4 z-40 bg-gradient-to-r from-primary-500 to-purple-500 text-white p-3 rounded-xl shadow-xl hover:from-primary-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <div className={isAuthenticated ? "p-4 lg:p-8" : "w-full max-w-md"}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;