import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

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
    description?: string;
    imageUrl?: string;
    publishedAt: string;
    source: {
      _id: string;
      name: string;
      url: string;
    };
  };
}

const SummaryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/summaries/${id}`);
        setSummary(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Özet yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
        <p className="text-xl font-semibold text-secondary-700 dark:text-secondary-300">Özet yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-heading font-bold text-red-800 dark:text-red-200 mb-4">Hata Oluştu</h2>
            <p className="text-red-700 dark:text-red-300 mb-6 font-medium">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="relative overflow-hidden inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-primary-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-semibold"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Ana Sayfaya Dön</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="relative overflow-hidden bg-white/80 dark:bg-secondary-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-secondary-200/50 dark:border-secondary-700/50 p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-700 dark:to-secondary-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <svg className="w-12 h-12 text-secondary-300 dark:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-heading font-bold text-secondary-900 dark:text-white mb-4">Özet Bulunamadı</h2>
            <p className="text-secondary-600 dark:text-secondary-300 mb-8">Aradığınız özet mevcut değil veya kaldırılmış olabilir.</p>
            <button
              onClick={() => navigate('/')}
              className="relative overflow-hidden inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-primary-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-semibold"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Ana Sayfaya Dön</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Back Navigation */}
      <div className="animate-fade-in">
        <button
          onClick={() => navigate('/')}
          className="group inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-all duration-200 hover:translate-x-1"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Ana Sayfaya Dön</span>
        </button>
      </div>

      {/* Article Header */}
      <div className="relative overflow-hidden bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl border border-secondary-200 dark:border-secondary-700 p-8 animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative">
          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-600 dark:text-secondary-300 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <span className="font-semibold">{summary.article.source.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(summary.article.publishedAt).toLocaleDateString('tr-TR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{summary.readCount} okunma</span>
            </div>
          </div>
          
          {/* Article Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-secondary-900 dark:text-white mb-6 leading-tight">
            {summary.article.title}
          </h1>
          
          {/* Article Description */}
          {summary.article.description && (
            <p className="text-lg sm:text-xl text-secondary-600 dark:text-secondary-300 leading-relaxed">
              {summary.article.description}
            </p>
          )}
        </div>
      </div>

      {/* Article Image */}
      {summary.article.imageUrl && (
        <div className="relative overflow-hidden rounded-3xl shadow-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
          <img
            src={summary.article.imageUrl}
            alt={summary.article.title}
            className="w-full h-64 sm:h-80 lg:h-96 object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* AI Summary */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-3xl border border-primary-200/50 dark:border-primary-700/50 p-8 shadow-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-2xl font-heading font-bold text-primary-800 dark:text-primary-200">
              AI Özeti 🤖
            </h2>
          </div>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="text-secondary-800 dark:text-secondary-200 leading-relaxed whitespace-pre-wrap font-medium text-lg">
              {summary.text}
            </div>
          </div>
        </div>
      </div>

      {/* Keywords */}
      {summary.keywords.length > 0 && (
        <div className="relative overflow-hidden bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl border border-secondary-200 dark:border-secondary-700 p-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-bold text-secondary-900 dark:text-white">
                Anahtar Kelimeler 🏷️
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {summary.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 animate-fade-in backdrop-blur-sm"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Original Article & Footer */}
      <div className="relative overflow-hidden bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl border border-secondary-200 dark:border-secondary-700 p-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h3 className="text-xl font-heading font-bold text-secondary-900 dark:text-white mb-2">
                Orijinal Makaleyi Oku 📰
              </h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4 sm:mb-0">
                Tam metne erişmek için kaynak siteyi ziyaret edin
              </p>
            </div>
            <a
              href={summary.article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-semibold"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Makaleyi Aç</span>
              </div>
            </a>
          </div>
          
          <div className="mt-6 pt-6 border-t border-secondary-200/50 dark:border-secondary-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-secondary-500 dark:text-secondary-300">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
                <span className="font-medium">{summary.article.source.url}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Özet tarihi: {new Date(summary.createdAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryDetail;