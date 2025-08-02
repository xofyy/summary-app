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
  const { user } = useAuthStore();

  useEffect(() => {
    loadSummaries();
  }, [page]);

  const loadSummaries = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/summaries?page=${page}&limit=10`);
      
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold bg-gradient-to-r from-secondary-900 to-secondary-700 dark:from-white dark:to-secondary-200 bg-clip-text text-transparent mb-2">
            İçerik Akışı
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            AI tarafından özetlenen en güncel haberler
          </p>
        </div>
        {user?.interests && user.interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {user.interests.slice(0, 3).map((interest, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-full border border-primary-200 dark:border-primary-700 shadow-soft"
              >
                {interest}
              </span>
            ))}
            {user.interests.length > 3 && (
              <span className="inline-flex items-center px-3 py-1.5 bg-secondary-50 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 text-sm font-medium rounded-full border border-secondary-200 dark:border-secondary-600">
                +{user.interests.length - 3} daha
              </span>
            )}
          </div>
        )}
      </div>

      {summaries.length === 0 ? (
        <div className="bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-800/50 dark:to-primary-900/30 rounded-2xl p-12 text-center shadow-soft border border-secondary-100 dark:border-secondary-700">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-medium">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-heading font-semibold text-secondary-900 dark:text-white mb-3">
            Henüz özet yok
          </h3>
          <p className="text-secondary-600 dark:text-secondary-300 mb-8 max-w-md mx-auto leading-relaxed">
            RSS kaynaklarınızdan makaleler çekilip AI tarafından özetlenmeyi bekliyor. Başlamak için RSS kaynaklarınızı ekleyin.
          </p>
          <Link 
            to="/sources" 
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-medium hover:shadow-glow transform hover:scale-105 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>RSS Kaynakları Ekle</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {summaries.map((summary, index) => (
            <article 
              key={summary._id} 
              className="stagger-animation group bg-white/70 dark:bg-secondary-800/70 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border border-secondary-100 dark:border-secondary-700 hover:border-primary-200 dark:hover:border-primary-600 hover:scale-[1.01]"
              style={{ 
                animation: `staggerFadeIn 0.6s ease-out both`,
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-2 sm:space-y-0">
                  <h2 className="text-xl sm:text-2xl font-heading font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">
                    <Link to={`/summary/${summary._id}`} className="hover:underline decoration-primary-300 dark:decoration-primary-400 decoration-2 underline-offset-4">
                      {summary.article?.title || 'Başlık mevcut değil'}
                    </Link>
                  </h2>
                  <div className="flex items-center space-x-3 text-sm text-secondary-500 dark:text-secondary-400">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="whitespace-nowrap">
                        {formatDate(summary.createdAt || summary.article?.publishedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"></div>
                    <span className="inline-flex items-center px-3 py-1 bg-secondary-50 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm font-medium rounded-full border border-secondary-200 dark:border-secondary-600">
                      {summary.article.source?.name || 'Bilinmeyen Kaynak'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-secondary-500 dark:text-secondary-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-sm">{summary.readCount} okunma</span>
                  </div>
                </div>

                <p className="text-secondary-700 dark:text-secondary-300 mb-6 leading-relaxed text-base">
                  {truncateText(summary.text)}
                </p>

                {summary.keywords && Array.isArray(summary.keywords) && summary.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {summary.keywords.slice(0, 5).map((keyword, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-1 bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-xs font-medium rounded-lg border border-accent-200 dark:border-accent-700 hover:bg-accent-100 dark:hover:bg-accent-900/50 transition-colors"
                      >
                        {keyword || 'Anahtar kelime'}
                      </span>
                    ))}
                    {summary.keywords.length > 5 && (
                      <span className="inline-flex items-center px-2.5 py-1 bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 text-xs font-medium rounded-lg">
                        +{summary.keywords.length - 5} daha
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 pt-4 border-t border-secondary-100 dark:border-secondary-700">
                  <Link 
                    to={`/summary/${summary._id}`}
                    className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm group/link transition-colors"
                  >
                    <span>Devamını Oku</span>
                    <svg className="w-4 h-4 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  {summary.article?.url && (
                    <a 
                      href={summary.article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200 text-sm transition-colors group/link"
                    >
                      <span>Orijinal Makale</span>
                      <svg className="w-4 h-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      )}
    </div>
  );
};

export default Home;