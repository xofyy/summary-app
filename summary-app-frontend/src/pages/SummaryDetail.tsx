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
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Özet yükleniyor..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorMessage 
          message={error} 
          onRetry={() => navigate('/')}
          retryText="Ana Sayfaya Dön"
        />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Özet bulunamadı</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          ← Ana Sayfaya Dön
        </button>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <span>{summary.article.source.name}</span>
          <span className="mx-2">•</span>
          <span>{new Date(summary.article.publishedAt).toLocaleDateString('tr-TR')}</span>
          <span className="mx-2">•</span>
          <span>{summary.readCount} okunma</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {summary.article.title}
        </h1>
        
        {summary.article.description && (
          <p className="text-lg text-gray-600 mb-4">
            {summary.article.description}
          </p>
        )}
      </div>

      {/* Article Image */}
      {summary.article.imageUrl && (
        <div className="mb-6">
          <img
            src={summary.article.imageUrl}
            alt={summary.article.title}
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Summary Content */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">
          AI Özeti
        </h2>
        <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {summary.text}
        </div>
      </div>

      {/* Keywords */}
      {summary.keywords.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Anahtar Kelimeler
          </h3>
          <div className="flex flex-wrap gap-2">
            {summary.keywords.map((keyword, index) => (
              <span
                key={index}
                className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Original Article Link */}
      <div className="border-t pt-6">
        <a
          href={summary.article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Orijinal Makaleyi Oku
        </a>
        
        <p className="text-sm text-gray-500 mt-2">
          {summary.article.source.url}
        </p>
      </div>

      {/* Article Info */}
      <div className="mt-8 text-sm text-gray-500">
        <p>Özet oluşturulma tarihi: {new Date(summary.createdAt).toLocaleDateString('tr-TR')}</p>
      </div>
    </div>
  );
};

export default SummaryDetail;