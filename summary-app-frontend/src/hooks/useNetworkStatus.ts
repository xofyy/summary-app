import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isReconnecting: boolean;
  lastDisconnected: Date | null;
  connectionQuality: 'good' | 'poor' | 'offline';
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isReconnecting: false,
    lastDisconnected: null,
    connectionQuality: navigator.onLine ? 'good' : 'offline'
  });

  useEffect(() => {
    let reconnectionTimeout: NodeJS.Timeout;
    let qualityCheckInterval: NodeJS.Timeout;

    const handleOnline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: true,
        isReconnecting: false,
        connectionQuality: 'good'
      }));
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false,
        isReconnecting: false,
        lastDisconnected: new Date(),
        connectionQuality: 'offline'
      }));

      // Start reconnection detection
      reconnectionTimeout = setTimeout(() => {
        if (!navigator.onLine) {
          setNetworkStatus(prev => ({
            ...prev,
            isReconnecting: true
          }));
        }
      }, 3000);
    };

    const checkConnectionQuality = async () => {
      if (!navigator.onLine) {
        setNetworkStatus(prev => ({
          ...prev,
          connectionQuality: 'offline'
        }));
        return;
      }

      try {
        const start = Date.now();
        const response = await fetch('/ping', { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000)
        });
        const duration = Date.now() - start;

        if (response.ok) {
          const quality = duration < 1000 ? 'good' : 'poor';
          setNetworkStatus(prev => ({
            ...prev,
            connectionQuality: quality
          }));
        } else {
          setNetworkStatus(prev => ({
            ...prev,
            connectionQuality: 'poor'
          }));
        }
      } catch (error) {
        setNetworkStatus(prev => ({
          ...prev,
          connectionQuality: 'poor'
        }));
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection quality periodically when online
    if (navigator.onLine) {
      qualityCheckInterval = setInterval(checkConnectionQuality, 30000); // Check every 30 seconds
    }

    // Initial connection quality check
    checkConnectionQuality();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (reconnectionTimeout) {
        clearTimeout(reconnectionTimeout);
      }
      
      if (qualityCheckInterval) {
        clearInterval(qualityCheckInterval);
      }
    };
  }, []);

  const retryConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch('/ping', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        setNetworkStatus(prev => ({
          ...prev,
          isOnline: true,
          isReconnecting: false,
          connectionQuality: 'good'
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('Connection retry failed:', error);
      return false;
    }
  };

  return {
    ...networkStatus,
    retryConnection
  };
};