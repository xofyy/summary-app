import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const availableInterests = [
  'Teknoloji',
  'Bilim',
  'Spor',
  'Sağlık',
  'İş Dünyası',
  'Sanat',
  'Müzik',
  'Sinema',
  'Edebiyat',
  'Eğitim',
  'Çevre',
  'Seyahat'
];

const Interests: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateInterests, isLoading, error, clearError } = useAuthStore();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    if (user?.interests) {
      setSelectedInterests(user.interests);
    }
  }, [user]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    console.log('Submitting interests:', selectedInterests);
    console.log('User before update:', user);
    
    try {
      await updateInterests(selectedInterests);
      console.log('Update successful, navigating to home');
      navigate('/');
    } catch (error) {
      console.error('Error updating interests:', error);
      // Error is handled by the store
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-3xl mb-6 shadow-xl">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-secondary-900 dark:text-white mb-4">
          İlgi Alanlarınızı Keşfedin 🎯
        </h1>
        <p className="text-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto leading-relaxed">
          Size özel içerik sunabilmemiz için ilgi alanlarınızı belirtin. Seçtiğiniz konulara göre haber özetleri kişiselleştirilecek ve daha anlamlı deneyim yaşayacaksınız.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Interest Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {availableInterests.map((interest, index) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 animate-fade-in overflow-hidden ${
                selectedInterests.includes(interest)
                  ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/50 dark:to-purple-900/50 text-primary-700 dark:text-primary-300 shadow-xl hover:shadow-2xl'
                  : 'border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 shadow-lg hover:shadow-xl'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative flex flex-col items-center space-y-2">
                {selectedInterests.includes(interest) && (
                  <div className="absolute -top-3 -right-3 w-7 h-7 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <span className="text-sm sm:text-base font-semibold text-center leading-tight">
                  {interest}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Interests Summary */}
        {selectedInterests.length > 0 && (
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-3xl p-6 border border-indigo-200 dark:border-indigo-700 animate-slide-up shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-heading font-bold text-indigo-800 dark:text-indigo-200">
                  Seçili İlgi Alanları ({selectedInterests.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {selectedInterests.map((interest, index) => (
                  <span 
                    key={interest} 
                    className="inline-flex items-center px-4 py-2 bg-white dark:bg-secondary-800 text-indigo-700 dark:text-indigo-300 text-sm font-semibold rounded-xl border border-indigo-200 dark:border-indigo-700 shadow-md animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="relative overflow-hidden bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700/50 rounded-3xl p-6 animate-slide-up shadow-xl">
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

        {/* Submit Button */}
        <div className="text-center pt-6">
          <button
            type="submit"
            disabled={selectedInterests.length === 0 || isLoading}
            className="relative overflow-hidden inline-flex items-center space-x-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-primary-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-semibold disabled:transform-none text-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-3">
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span>
                    {selectedInterests.length === 0 
                      ? 'En az bir ilgi alanı seçin' 
                      : `Devam Et (${selectedInterests.length} seçili)`
                    }
                  </span>
                </>
              )}
            </div>
          </button>
          
          {selectedInterests.length === 0 && (
            <p className="text-sm text-secondary-500 dark:text-secondary-300 mt-3">
              💡 İlgi alanlarınızı seçerek kişiselleştirilmiş içerik deneyimi yaşayın
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Interests;