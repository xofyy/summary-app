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
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl animate-pulse">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </div>
        <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
        <p className="text-secondary-600 dark:text-secondary-300 font-medium">RSS Kaynakları yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-3xl mb-6 shadow-xl">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-secondary-900 dark:text-white mb-4">
          RSS Kaynakları Yönetimi 📡
        </h1>
        <p className="text-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto leading-relaxed">
          Haber kaynaklarınızı yönetin, yeni RSS beslemeleri ekleyin ve özet işlemlerini kontrol edin.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
        <button
          onClick={triggerRssFetch}
          disabled={fetchingRss || !isOnline}
          className="relative overflow-hidden group w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-2xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none font-semibold"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center space-x-3">
            {fetchingRss ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>RSS Getiriliyor...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>RSS'leri Getir</span>
              </>
            )}
          </div>
        </button>
        
        <button
          onClick={triggerSummaryProcessing}
          disabled={processingSummaries || !isOnline}
          className="relative overflow-hidden group w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none font-semibold"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center space-x-3">
            {processingSummaries ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>İşleniyor...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Özetleri İşle</span>
              </>
            )}
          </div>
        </button>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="relative overflow-hidden group w-full sm:w-auto bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-4 rounded-2xl hover:from-primary-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-semibold"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center space-x-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Yeni Kaynak Ekle</span>
          </div>
        </button>
      </div>

      {!isOnline && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/50 rounded-3xl p-6 mb-8 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-amber-800 dark:text-amber-200 font-semibold">İnternet bağlantısı yok</p>
              <p className="text-amber-700 dark:text-amber-300 text-sm">RSS işlemleri için internet bağlantısı gerekli.</p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="relative overflow-hidden bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl border border-secondary-200 dark:border-secondary-700 p-8 mb-8 animate-slide-down">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-2xl font-heading font-bold text-secondary-900 dark:text-white">
                {editingSource ? 'Kaynağı Düzenle 📝' : 'Yeni Kaynak Ekle ✨'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Kaynak Adı
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-600 rounded-2xl text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="örn. TechCrunch"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Website URL'si
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                  </div>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-600 rounded-2xl text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://techcrunch.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  RSS Feed URL'si
                </label>
                <div className="flex space-x-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </div>
                    <input
                      type="url"
                      value={formData.rssFeedUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, rssFeedUrl: e.target.value });
                        setRssValid(null);
                      }}
                      className="w-full pl-12 pr-4 py-4 bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-600 rounded-2xl text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="https://techcrunch.com/feed/"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => validateRssUrl(formData.rssFeedUrl)}
                    disabled={validatingRss || !formData.rssFeedUrl}
                    className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-2xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center space-x-2">
                      {validatingRss ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Kontrol</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Doğrula</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
                
                {rssValid === true && (
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-sm mt-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">Geçerli RSS beslemesi</span>
                  </div>
                )}
                {rssValid === false && (
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm mt-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="font-medium">Geçersiz RSS beslemesi</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={rssValid === false}
                  className="relative overflow-hidden flex-1 bg-gradient-to-r from-primary-500 to-purple-600 text-white py-4 px-6 rounded-2xl hover:from-primary-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{editingSource ? 'Güncelle' : 'Kaynak Ekle'}</span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={cancelForm}
                  className="relative overflow-hidden flex-1 sm:flex-none bg-gradient-to-r from-secondary-500 to-secondary-600 dark:from-secondary-600 dark:to-secondary-700 text-white py-4 px-6 rounded-2xl hover:from-secondary-600 hover:to-secondary-700 dark:hover:from-secondary-700 dark:hover:to-secondary-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>İptal</span>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sources List */}
      {error && (
        <div className="relative overflow-hidden bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700/50 rounded-3xl p-6 mb-8 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-700 dark:text-red-300 font-semibold">{error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sources.map((source, index) => (
          <div 
            key={source._id} 
            className="group relative overflow-hidden bg-white dark:bg-secondary-800 rounded-3xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </div>
                  {source.isDefault && (
                    <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-700/50 shadow-sm">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Varsayılan
                    </span>
                  )}
                </div>
                
                {!source.isDefault && (
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => startEdit(source)}
                      className="p-2 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-200 dark:hover:bg-primary-900/70 transition-colors shadow-md hover:shadow-lg"
                      title="Düzenle"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(source._id)}
                      className="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors shadow-md hover:shadow-lg"
                      title="Sil"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-heading font-bold text-secondary-900 dark:text-white mb-3 line-clamp-2">
                {source.name}
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-secondary-600 dark:text-secondary-300">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  <span className="truncate font-medium">{source.url}</span>
                </div>
                <div className="flex items-center space-x-2 text-secondary-600 dark:text-secondary-300">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                  <span className="truncate font-medium">{source.rssFeedUrl}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sources.length === 0 && !error && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-700 dark:to-secondary-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg className="w-12 h-12 text-secondary-300 dark:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-heading font-bold text-secondary-900 dark:text-white mb-2">
            Henüz kaynak yok
          </h3>
          <p className="text-secondary-600 dark:text-secondary-300 mb-6">
            İlk RSS kaynağınızı ekleyerek başlayın!
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="relative overflow-hidden inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-primary-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-semibold"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>İlk Kaynağı Ekle</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sources;