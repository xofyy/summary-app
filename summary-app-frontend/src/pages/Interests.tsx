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
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold bg-gradient-to-r from-secondary-900 to-secondary-700 dark:from-white dark:to-secondary-200 bg-clip-text text-transparent mb-4">
          İlgi Alanlarınızı Seçin
        </h1>
        <p className="text-lg text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
          Size özel içerik sunabilmemiz için ilgi alanlarınızı belirtin. Seçtiğiniz konulara göre haber özetleri kişiselleştirilecek.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {availableInterests.map((interest, index) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 animate-fade-in ${
                selectedInterests.includes(interest)
                  ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 shadow-medium hover:shadow-glow'
                  : 'border-secondary-200 dark:border-secondary-700 bg-white/70 dark:bg-secondary-800/70 text-secondary-700 dark:text-secondary-300 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 shadow-soft hover:shadow-medium'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col items-center space-y-2">
                {selectedInterests.includes(interest) && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-medium">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <span className="text-sm sm:text-base font-medium text-center leading-tight">
                  {interest}
                </span>
              </div>
              
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 opacity-0 transition-opacity duration-300 -z-10 ${
                selectedInterests.includes(interest) ? 'group-hover:opacity-10' : 'group-hover:opacity-5'
              }`}></div>
            </button>
          ))}
        </div>

        {selectedInterests.length > 0 && (
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/30 dark:to-accent-900/30 rounded-2xl p-6 border border-primary-200 dark:border-primary-700 animate-slide-up">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-heading font-semibold text-primary-800 dark:text-primary-200">
                Seçili İlgi Alanları ({selectedInterests.length})
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedInterests.map((interest) => (
                <span 
                  key={interest} 
                  className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-full border border-primary-200 dark:border-primary-600"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-700 rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-error-100 dark:bg-error-800 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-error-600 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-error-700 dark:text-error-300 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={selectedInterests.length === 0 || isLoading}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-medium hover:shadow-glow transform hover:scale-105 font-medium disabled:transform-none disabled:shadow-medium"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>
                  {selectedInterests.length === 0 
                    ? 'En az bir ilgi alanı seçin' 
                    : `Devam Et (${selectedInterests.length} seçili)`
                  }
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Interests;