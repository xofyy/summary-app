import React, { useState, useEffect } from 'react';
import { api, networkUtils } from '../utils/api';
import ErrorBoundary from '../components/ErrorBoundary';

interface Source {
  _id: string;
  name: string;
  url: string;
  rssFeedUrl: string;
  isDefault: boolean;
  createdBy?: string;
}

const Sources: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    rssFeedUrl: ''
  });
  const [validatingRss, setValidatingRss] = useState(false);
  const [rssValid, setRssValid] = useState<boolean | null>(null);
  const [fetchingRss, setFetchingRss] = useState(false);
  const [processingSummaries, setProcessingSummaries] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    loadSources();
    
    // Listen for network changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadSources = async () => {
    try {
      setError(null);
      const response = await api.get('/sources');
      setSources(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Failed to load sources:', error);
      setError(error.message || 'Kaynaklar yüklenirken hata oluştu');
      // Set empty array as fallback
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  const validateRssUrl = async (url: string) => {
    if (!url || !url.trim()) {
      setRssValid(false);
      return;
    }
    
    if (!isOnline) {
      alert('İnternet bağlantısı yok. RSS doğrulaması yapılamıyor.');
      return;
    }
    
    setValidatingRss(true);
    setRssValid(null);
    
    try {
      const response = await api.post('/sources/validate-rss', { url });
      setRssValid(response.data?.isValid || false);
    } catch (error: any) {
      console.error('RSS validation failed:', error);
      setRssValid(false);
    } finally {
      setValidatingRss(false);
    }
  };

  const triggerRssFetch = async () => {
    if (!isOnline) {
      alert('İnternet bağlantısı yok. RSS getirme işlemi yapılamıyor.');
      return;
    }

    setFetchingRss(true);
    try {
      const response = await api.post('/articles/fetch');
      alert(response.data?.message || 'RSS getirme tamamlandı! Makaleler işleniyor.');
    } catch (error: any) {
      console.error('Failed to trigger RSS fetch:', error);
      alert(error.message || 'RSS getirme başarısız. Lütfen tekrar deneyin.');
    } finally {
      setFetchingRss(false);
    }
  };

  const triggerSummaryProcessing = async () => {
    if (!isOnline) {
      alert('İnternet bağlantısı yok. Özet işleme yapılamıyor.');
      return;
    }

    setProcessingSummaries(true);
    try {
      const response = await api.post('/articles/process-summaries');
      alert(response.data?.message || 'Özet işleme tamamlandı! Yeni özetler için ana sayfayı kontrol edin.');
    } catch (error: any) {
      console.error('Failed to trigger summary processing:', error);
      alert(error.message || 'Özet işleme başarısız. Lütfen tekrar deneyin.');
    } finally {
      setProcessingSummaries(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name?.trim() || !formData.url?.trim() || !formData.rssFeedUrl?.trim()) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    
    if (rssValid === false) {
      alert('Lütfen geçerli bir RSS feed URL\'si girin.');
      return;
    }

    if (!isOnline) {
      alert('İnternet bağlantısı yok. Kaynak eklenemez.');
      return;
    }

    try {
      if (editingSource) {
        await api.put(`/sources/custom/${editingSource._id}`, formData);
      } else {
        await api.post('/sources/custom', formData);
      }
      
      setFormData({ name: '', url: '', rssFeedUrl: '' });
      setShowAddForm(false);
      setEditingSource(null);
      setRssValid(null);
      await loadSources();
    } catch (error: any) {
      console.error('Save source failed:', error);
      alert(error.message || 'Kaynak kaydedilemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this source?')) return;
    
    try {
      await api.delete(`/sources/custom/${sourceId}`);
      loadSources();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete source');
    }
  };

  const startEdit = (source: Source) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      url: source.url,
      rssFeedUrl: source.rssFeedUrl
    });
    setRssValid(true); // Existing sources are assumed valid
    setShowAddForm(true);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingSource(null);
    setFormData({ name: '', url: '', rssFeedUrl: '' });
    setRssValid(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">RSS Sources</h1>
        <div className="flex space-x-3">
          <button
            onClick={triggerRssFetch}
            disabled={fetchingRss}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {fetchingRss ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Fetching...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Fetch RSS Now</span>
              </>
            )}
          </button>
          <button
            onClick={triggerSummaryProcessing}
            disabled={processingSummaries}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {processingSummaries ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Process Summaries</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Custom Source
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            {editingSource ? 'Edit Source' : 'Add New Source'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RSS Feed URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={formData.rssFeedUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, rssFeedUrl: e.target.value });
                    setRssValid(null);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => validateRssUrl(formData.rssFeedUrl)}
                  disabled={validatingRss || !formData.rssFeedUrl}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                  {validatingRss ? 'Validating...' : 'Validate'}
                </button>
              </div>
              {rssValid === true && (
                <p className="text-green-600 text-sm mt-1">✓ Valid RSS feed</p>
              )}
              {rssValid === false && (
                <p className="text-red-600 text-sm mt-1">✗ Invalid RSS feed URL</p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={rssValid === false}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {editingSource ? 'Update' : 'Add'} Source
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sources List */}
      <div className="space-y-4">
        {sources.map((source) => (
          <div key={source._id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {source.name}
                  {source.isDefault && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </h3>
                <p className="text-gray-600 text-sm">Website: {source.url}</p>
                <p className="text-gray-600 text-sm">RSS: {source.rssFeedUrl}</p>
              </div>
              {!source.isDefault && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(source)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(source._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {sources.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No sources available. Add your first custom source!</p>
        </div>
      )}
    </div>
  );
};

export default Sources;