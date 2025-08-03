import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'spinner' | 'pulse' | 'dots';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Yükleniyor...',
  variant = 'spinner'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'pulse':
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} bg-gradient-to-br from-primary-200 to-purple-200 dark:from-primary-800 dark:to-purple-800 rounded-full animate-pulse shadow-lg`}></div>
            <div className={`absolute inset-0 ${sizeClasses[size]} bg-gradient-to-br from-primary-500 to-purple-600 rounded-full animate-ping opacity-75 shadow-xl`}></div>
          </div>
        );
      
      case 'dots':
        return (
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full animate-bounce shadow-md" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full animate-bounce shadow-md" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full animate-bounce shadow-md" style={{ animationDelay: '0.2s' }}></div>
          </div>
        );
      
      default:
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} border-4 border-primary-200 dark:border-primary-800 rounded-full animate-pulse`}></div>
            <div className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin`}></div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in">
      {renderSpinner()}
      {text && (
        <p className="text-secondary-600 text-sm font-medium animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;