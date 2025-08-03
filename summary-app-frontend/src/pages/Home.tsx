import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import ArticleSkeleton from '../components/ArticleSkeleton';

interface Summary {
  _id: string;
  text: string;
  keywords: string[];
  readCount: number;
  createdAt: string;
  article: {
    _id: string;
    title: string;
    url: string;
    publishedAt: string;
    source: {
      name: string;
      url: string;
    } | null;
  };
}

const Home: React.FC = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({
    totalSummaries: 0,
    totalSources: 0,
    todaySummaries: 0,
    avgReadTime: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    console.log('🏠 Home useEffect triggered:', { isAuthenticated, user: !!user });
    if (isAuthenticated) {
      console.log('✅ User authenticated, loading data...');
      loadSummaries();
      loadStats();
    } else {
      console.log('❌ User not authenticated, skipping data load');
    }
  }, [page, searchTerm, selectedCategory, sortBy, isAuthenticated]);

  const loadStats = async () => {
    try {
      const response = await api.get('/summaries/stats');
      setStats(response.data);
    } catch (err: any) {
      console.error('Load stats failed:', err);
      // Use fallback stats if API fails
      setStats({
        totalSummaries: summaries.length || 0,
        totalSources: 3,
        todaySummaries: 0,
        avgReadTime: 2
      });
    }
  };

  const loadSummaries = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sort: sortBy
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      const response = await api.get(`/summaries?${params.toString()}`);
      
      // Ensure response.data is an array
      const summariesData = Array.isArray(response.data) ? response.data : [];
      
      if (page === 1) {
        setSummaries(summariesData);
      } else {
        setSummaries(prev => [...prev, ...summariesData]);
      }
      setError(null);
    } catch (err: any) {
      console.error('Load summaries failed:', err);
      setError(err.message || 'Özetler yüklenirken hata oluştu');
      // On error, don't clear existing summaries if this is not the first page
      if (page === 1) {
        setSummaries([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Tarih bilinmiyor';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Geçersiz tarih';
      
      return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.warn('Date formatting error:', error);
      return 'Tarih bilinmiyor';
    }
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    try {
      if (!text || typeof text !== 'string') return 'İçerik mevcut değil';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength).trim() + '...';
    } catch (error) {
      console.warn('Text truncation error:', error);
      return 'İçerik mevcut değil';
    }
  };

  if (loading && page === 1) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <div className="h-10 w-64 bg-secondary-200 rounded-lg shimmer mb-2"></div>
            <div className="h-5 w-48 bg-secondary-200 rounded shimmer"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-secondary-200 rounded-full shimmer"></div>
            <div className="h-8 w-20 bg-secondary-200 rounded-full shimmer"></div>
          </div>
        </div>
        <ArticleSkeleton count={5} />
      </div>
    );
  }

  if (error && summaries.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-error-50 border border-error-200 rounded-2xl p-8 text-center shadow-soft">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-heading font-semibold text-error-800 mb-2">
            Bir sorun oluştu
          </h3>
          <p className="text-error-600 mb-6">{error}</p>
          <button 
            onClick={() => loadSummaries()}
            className="inline-flex items-center space-x-2 bg-error-600 text-white px-6 py-3 rounded-xl hover:bg-error-700 transition-all duration-200 shadow-medium hover:shadow-glow font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Tekrar Dene</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl shadow-glow-lg">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-red-600/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-yellow-400/10 to-orange-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
        
        <div className="relative px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0">
            <div className="flex-1 text-center lg:text-left z-10">
              <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
                🤖 AI Destekli Haber Özetleme
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 leading-tight">
                Hoş geldin,{' '}
                <span className="text-yellow-300 font-extrabold">
                  {user?.name?.split(' ')[0] || 'Kullanıcı'}
                </span>
                ! 👋
              </h1>
              <p className="text-xl text-white/80 mb-8 max-w-2xl leading-relaxed">
                Haberleri takip etmenin en akıllı yolu. AI ile özetlenen, 
                kişiselleştirilmiş içeriklerle güncel kal.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/sources" 
                  className="group relative inline-flex items-center justify-center space-x-3 bg-white text-indigo-600 px-8 py-4 rounded-2xl hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-bold text-lg"
                >
                  <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span>RSS Ekle</span>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link 
                  to="/interests" 
                  className="group inline-flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 px-8 py-4 rounded-2xl hover:bg-white/20 hover:border-white/40 transition-all duration-300 font-semibold text-lg"
                >
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span>İlgi Alanları</span>
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0 lg:block z-10">
              <div className="relative w-64 h-64 lg:w-80 lg:h-80">
                {/* Floating Cards Animation */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-0 w-24 h-32 bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl animate-float border border-white/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="absolute top-8 right-0 w-28 h-36 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 backdrop-blur-sm rounded-2xl shadow-xl animate-float border border-cyan-300/30 flex items-center justify-center" style={{animationDelay: '0.5s'}}>
                    <svg className="w-10 h-10 text-cyan-300/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="absolute bottom-0 left-8 w-32 h-40 bg-gradient-to-br from-pink-400/20 to-purple-600/20 backdrop-blur-sm rounded-2xl shadow-xl animate-float border border-pink-300/30 flex items-center justify-center" style={{animationDelay: '1s'}}>
                    <svg className="w-12 h-12 text-pink-300/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="absolute bottom-8 right-4 w-20 h-28 bg-gradient-to-br from-yellow-400/20 to-orange-600/20 backdrop-blur-sm rounded-2xl shadow-xl animate-float border border-yellow-300/30 flex items-center justify-center" style={{animationDelay: '1.5s'}}>
                    <svg className="w-6 h-6 text-yellow-300/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 stats-mobile">
        <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-rotate-1">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">{stats.totalSummaries}</p>
              <p className="text-white/80 text-sm font-medium">Toplam Özet</p>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:rotate-1">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">{stats.totalSources}</p>
              <p className="text-white/80 text-sm font-medium">RSS Kaynağı</p>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-rotate-1">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">{stats.todaySummaries}</p>
              <p className="text-white/80 text-sm font-medium">Bugün Özetlenen</p>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:rotate-1">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">{stats.avgReadTime}dk</p>
              <p className="text-white/80 text-sm font-medium">Ortalama Okuma</p>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
        </div>
      </div>

      {/* Interests Section */}
      {user?.interests && user.interests.length > 0 && (
        <div className="bg-white/70 dark:bg-secondary-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-secondary-100 dark:border-secondary-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">İlgi Alanların</h3>
            <Link 
              to="/interests" 
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
            >
              Düzenle
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-full border border-primary-200 dark:border-primary-700 shadow-soft"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-white/70 dark:bg-secondary-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-soft border border-secondary-100 dark:border-secondary-700">
        <div className="flex flex-col lg:flex-row gap-4 search-mobile">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-500 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Başlık, içerik veya anahtar kelime ara..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // Reset page when searching
                }}
                className="w-full pl-10 pr-4 py-3 bg-secondary-50 dark:bg-secondary-700 border border-secondary-200 dark:border-secondary-600 rounded-xl text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-500 dark:text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 bg-secondary-50 dark:bg-secondary-700 border border-secondary-200 dark:border-secondary-600 rounded-xl text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-w-[160px]"
            >
              <option value="all">Tüm Kategoriler</option>
              <option value="teknoloji">Teknoloji</option>
              <option value="spor">Spor</option>
              <option value="ekonomi">Ekonomi</option>
              <option value="siyaset">Siyaset</option>
              <option value="dünya">Dünya</option>
              <option value="kültür">Kültür</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 bg-secondary-50 dark:bg-secondary-700 border border-secondary-200 dark:border-secondary-600 rounded-xl text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-w-[140px]"
            >
              <option value="newest">En Yeni</option>
              <option value="oldest">En Eski</option>
              <option value="popular">En Popüler</option>
              <option value="alphabetical">Alfabetik</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || selectedCategory !== 'all' || sortBy !== 'newest') && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-600">
            <span className="text-sm text-secondary-600 dark:text-secondary-300 font-medium">Aktif filtreler:</span>
            
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full border border-primary-200 dark:border-primary-700">
                Arama: "{searchTerm}"
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setPage(1);
                  }}
                  className="ml-1 w-4 h-4 hover:text-primary-900 dark:hover:text-primary-100"
                >
                  ×
                </button>
              </span>
            )}
            
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-sm rounded-full border border-accent-200 dark:border-accent-700">
                Kategori: {selectedCategory}
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPage(1);
                  }}
                  className="ml-1 w-4 h-4 hover:text-accent-900 dark:hover:text-accent-100"
                >
                  ×
                </button>
              </span>
            )}
            
            {sortBy !== 'newest' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm rounded-full border border-secondary-200 dark:border-secondary-600">
                Sıralama: {sortBy === 'oldest' ? 'En Eski' : sortBy === 'popular' ? 'En Popüler' : 'Alfabetik'}
                <button
                  onClick={() => {
                    setSortBy('newest');
                    setPage(1);
                  }}
                  className="ml-1 w-4 h-4 hover:text-secondary-900 dark:hover:text-secondary-100"
                >
                  ×
                </button>
              </span>
            )}
            
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSortBy('newest');
                setPage(1);
              }}
              className="text-sm text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-300 font-medium"
            >
              Tümünü Temizle
            </button>
          </div>
        )}
      </div>

      {/* Content Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-secondary-900 dark:text-white mb-2">
            {searchTerm ? `"${searchTerm}" için sonuçlar` : 'Son Özetler'} 📰
          </h2>
          <p className="text-secondary-600 dark:text-secondary-300">
            {summaries.length > 0 && `${summaries.length} özet bulundu`}
          </p>
        </div>
      </div>

      {summaries.length === 0 ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-secondary-800/80 dark:via-primary-900/30 dark:to-purple-900/20 rounded-3xl p-16 text-center shadow-xl border border-secondary-100 dark:border-secondary-700">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-primary-200/30 to-blue-300/30 dark:from-primary-700/20 dark:to-blue-700/20 rounded-full animate-float"></div>
            <div className="absolute top-12 right-8 w-16 h-16 bg-gradient-to-br from-purple-200/30 to-pink-300/30 dark:from-purple-700/20 dark:to-pink-700/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-8 left-12 w-20 h-20 bg-gradient-to-br from-emerald-200/30 to-cyan-300/30 dark:from-emerald-700/20 dark:to-cyan-700/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-br from-yellow-200/30 to-orange-300/30 dark:from-yellow-700/20 dark:to-orange-700/20 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>
          </div>
          
          <div className="relative z-10">
            {/* Icon Stack */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-blue-500 to-purple-500 rounded-3xl shadow-2xl transform rotate-3 animate-pulse-slow"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-primary-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              {/* Floating elements around icon */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{animationDelay: '0.5s'}}>
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-4xl font-heading font-bold mb-4 text-secondary-900 dark:text-white">
              İlk özetinizi oluşturun! 🚀
            </h3>
            <h4 className="text-xl font-semibold text-secondary-700 dark:text-secondary-300 mb-6">
              Henüz içerik özetlenmemiş
            </h4>
            <p className="text-lg text-secondary-600 dark:text-secondary-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              AI destekli haber özetleme sisteminiz hazır! RSS kaynaklarınızı ekleyerek kişiselleştirilmiş içerik özetleri almaya başlayın.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link 
                to="/sources" 
                className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-8 py-4 rounded-2xl hover:from-primary-600 hover:to-purple-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-bold text-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                <span className="relative z-10">RSS Kaynakları Ekle</span>
                <svg className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link 
                to="/interests" 
                className="group inline-flex items-center space-x-3 bg-white/90 dark:bg-secondary-700/90 text-secondary-700 dark:text-secondary-200 border-2 border-secondary-200 dark:border-secondary-600 px-6 py-4 rounded-2xl hover:bg-secondary-50 dark:hover:bg-secondary-600 hover:border-primary-300 dark:hover:border-primary-500 transition-all duration-300 font-semibold backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>İlgi Alanları</span>
              </Link>
            </div>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/60 dark:bg-secondary-800/60 rounded-2xl p-6 backdrop-blur-sm border border-secondary-200 dark:border-secondary-700">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-secondary-900 dark:text-white mb-2">Hızlı Özetleme</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">AI ile saniyeler içinde kaliteli özetler</p>
              </div>
              
              <div className="bg-white/60 dark:bg-secondary-800/60 rounded-2xl p-6 backdrop-blur-sm border border-secondary-200 dark:border-secondary-700">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-secondary-900 dark:text-white mb-2">Kişiselleştirilmiş</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">İlgi alanlarınıza göre özelleştirme</p>
              </div>
              
              <div className="bg-white/60 dark:bg-secondary-800/60 rounded-2xl p-6 backdrop-blur-sm border border-secondary-200 dark:border-secondary-700">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-secondary-900 dark:text-white mb-2">Akıllı Takip</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-300">Otomatik RSS kaynağı izleme</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 mobile-grid-1">
          {/* Recent Activity Widget */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 dark:bg-secondary-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-secondary-100 dark:border-secondary-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Son Aktiviteler</h3>
                <span className="text-sm text-secondary-600 dark:text-secondary-300">Son 24 saat</span>
              </div>
              <div className="space-y-3">
                {[
                  { action: 'Yeni RSS kaynağı eklendi', source: 'TechCrunch', time: '2 saat önce', icon: '📡' },
                  { action: '5 makale özetlendi', source: 'AI özet', time: '4 saat önce', icon: '🤖' },
                  { action: 'İlgi alanları güncellendi', source: 'Profil', time: '6 saat önce', icon: '⚙️' },
                  { action: '12 makale işlendi', source: 'RSS tarama', time: '8 saat önce', icon: '📄' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors">
                    <span className="text-lg">{activity.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-secondary-900 dark:text-white">{activity.action}</p>
                      <p className="text-xs text-secondary-600 dark:text-secondary-300">{activity.source} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Summaries Widget */}
          <div>
            <div className="bg-white/70 dark:bg-secondary-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-secondary-100 dark:border-secondary-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Popüler Özetler</h3>
                <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'AI\'nın Geleceği ve İnsan Yaşamına Etkisi', reads: 234, trend: '+12%' },
                  { title: 'Blockchain Teknolojisinde Yeni Gelişmeler', reads: 189, trend: '+8%' },
                  { title: 'Sürdürülebilir Enerji Çözümleri', reads: 156, trend: '+15%' }
                ].map((item, index) => (
                  <div key={index} className="group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-secondary-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors cursor-pointer">
                          {item.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-secondary-600 dark:text-secondary-300">{item.reads} okunma</span>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">{item.trend}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 bg-accent-100 dark:bg-accent-900/30 rounded-lg text-accent-600 dark:text-accent-400 text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8">
          {summaries.map((summary, index) => (
            <article 
              key={summary._id} 
              className="stagger-animation group relative overflow-hidden bg-white dark:bg-secondary-800 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 border border-secondary-100 dark:border-secondary-700 hover:border-primary-200 dark:hover:border-primary-600 hover:scale-[1.02] hover:-translate-y-1"
              style={{ 
                animation: `staggerFadeIn 0.6s ease-out both`,
                animationDelay: `${index * 0.1}s`
              }}
            >
              {/* Gradient Background Accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"></div>
              
              <div className="p-8 sm:p-10">
                {/* Header Section */}
                <div className="flex flex-col space-y-4 mb-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-2xl sm:text-3xl font-heading font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors leading-tight pr-4">
                      <Link to={`/summary/${summary._id}`} className="hover:underline decoration-primary-400 dark:decoration-primary-300 decoration-2 underline-offset-8">
                        {summary.article?.title || 'Başlık mevcut değil'}
                      </Link>
                    </h2>
                    <div className="flex-shrink-0 bg-gradient-to-r from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 rounded-full px-4 py-2">
                      <div className="flex items-center space-x-2 text-sm text-primary-700 dark:text-primary-300 font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="whitespace-nowrap">
                          {formatDate(summary.createdAt || summary.article?.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-sm"></div>
                    <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 text-emerald-700 dark:text-emerald-300 text-sm font-semibold rounded-full border border-emerald-200 dark:border-emerald-700 shadow-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                      {summary.article.source?.name || 'Bilinmeyen Kaynak'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-700">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{summary.readCount} okunma</span>
                  </div>
                </div>

                {/* Summary Content */}
                <div className="bg-gradient-to-r from-secondary-50/50 to-primary-50/30 dark:from-secondary-800/50 dark:to-primary-900/20 rounded-2xl p-6 mb-6 border border-secondary-100 dark:border-secondary-700">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-2 uppercase tracking-wide">AI Özeti</h3>
                      <p className="text-secondary-800 dark:text-secondary-100 leading-relaxed text-lg font-medium">
                        {truncateText(summary.text)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Keywords Section */}
                {summary.keywords && Array.isArray(summary.keywords) && summary.keywords.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-5 h-5 bg-gradient-to-r from-accent-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wide">Anahtar Kelimeler</h4>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {summary.keywords.slice(0, 5).map((keyword, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-accent-50 to-orange-50 dark:from-accent-900/20 dark:to-orange-900/20 text-accent-700 dark:text-accent-300 text-sm font-medium rounded-full border border-accent-200 dark:border-accent-700 hover:bg-gradient-to-r hover:from-accent-100 hover:to-orange-100 dark:hover:from-accent-900/30 dark:hover:to-orange-900/30 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          #{keyword || 'Anahtar kelime'}
                        </span>
                      ))}
                      {summary.keywords.length > 5 && (
                        <span className="inline-flex items-center px-4 py-2 bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 text-sm font-medium rounded-full border border-secondary-200 dark:border-secondary-600">
                          +{summary.keywords.length - 5} daha
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 pt-6 border-t-2 border-gradient-to-r from-secondary-100 to-primary-100 dark:from-secondary-700 dark:to-primary-700">
                  <Link 
                    to={`/summary/${summary._id}`}
                    className="group inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-primary-600 hover:to-purple-600 font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Detaylı Oku</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  {summary.article?.url && (
                    <a 
                      href={summary.article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center justify-center space-x-3 bg-white dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 border-2 border-secondary-200 dark:border-secondary-600 px-6 py-3 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-600 hover:border-secondary-300 dark:hover:border-secondary-500 font-medium text-sm transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span>Orijinal Makale</span>
                      <svg className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}

          {summaries.length > 0 && (
            <div className="text-center pt-8">
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-medium hover:shadow-glow transform hover:scale-105 font-medium disabled:transform-none disabled:shadow-medium"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Yükleniyor...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span>Daha Fazla Yükle</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
};

export default Home;