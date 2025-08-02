import React, { useState, useEffect } from 'react';

interface SafeImageProps {
  src?: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  fallbackIcon?: React.ReactNode;
  onError?: () => void;
  onLoad?: () => void;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = 'Image',
  className = '',
  fallbackSrc,
  fallbackIcon,
  onError,
  onLoad
}) => {
  const [currentSrc, setCurrentSrc] = useState<string | null>(src || null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!src);

  useEffect(() => {
    if (src) {
      setCurrentSrc(src);
      setHasError(false);
      setIsLoading(true);
    } else {
      setCurrentSrc(null);
      setHasError(false);
      setIsLoading(false);
    }
  }, [src]);

  const handleError = () => {
    setIsLoading(false);
    
    if (currentSrc === src && fallbackSrc) {
      // Try fallback image first
      setCurrentSrc(fallbackSrc);
      return;
    }
    
    // If fallback also fails or no fallback provided
    setHasError(true);
    setCurrentSrc(null);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  // Show loading state
  if (isLoading && currentSrc) {
    return (
      <div className={`flex items-center justify-center bg-secondary-100 dark:bg-secondary-700 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  // Show error state or fallback icon
  if (hasError || !currentSrc) {
    if (fallbackIcon) {
      return (
        <div className={`flex items-center justify-center bg-secondary-100 dark:bg-secondary-700 text-secondary-500 dark:text-secondary-400 ${className}`}>
          {fallbackIcon}
        </div>
      );
    }

    // Default fallback icon
    return (
      <div className={`flex items-center justify-center bg-secondary-100 dark:bg-secondary-700 text-secondary-500 dark:text-secondary-400 ${className}`}>
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="sr-only">Resim yüklenemedi</span>
      </div>
    );
  }

  // Show image
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
};

export default SafeImage;