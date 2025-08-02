import React, { useState } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const NetworkStatusIndicator: React.FC = () => {
  const { isOnline, isReconnecting, connectionQuality, retryConnection } = useNetworkStatus();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryConnection();
    } finally {
      setIsRetrying(false);
    }
  };

  // Don't show anything if connection is good
  if (isOnline && connectionQuality === 'good') {
    return null;
  }

  // Offline state
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-error-600 text-white px-4 py-2 text-center text-sm shadow-lg">
        <div className="flex items-center justify-center space-x-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
          </svg>
          <span>
            {isReconnecting ? 'Bağlantı kuruluyor...' : 'İnternet bağlantısı yok'}
          </span>
          {!isReconnecting && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center space-x-1 bg-error-700 hover:bg-error-800 px-2 py-1 rounded text-xs disabled:opacity-50"
            >
              {isRetrying ? (
                <>
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Deneniyor...</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Tekrar Dene</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Poor connection state
  if (connectionQuality === 'poor') {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-warning-500 text-white px-4 py-1 text-center text-sm">
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>Bağlantı yavaş</span>
        </div>
      </div>
    );
  }

  return null;
};

export default NetworkStatusIndicator;