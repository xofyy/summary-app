import React from 'react';

interface ArticleSkeletonProps {
  count?: number;
}

const ArticleSkeleton: React.FC<ArticleSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="grid gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <article 
          key={index} 
          className="relative overflow-hidden bg-white dark:bg-secondary-800 rounded-3xl shadow-lg border border-secondary-100 dark:border-secondary-700 animate-pulse"
          style={{ 
            animationDelay: `${index * 0.1}s`
          }}
        >
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-200 to-purple-200 dark:from-primary-700 dark:to-purple-700 shimmer"></div>
          
          <div className="p-8 sm:p-10">
            {/* Header Section */}
            <div className="flex flex-col space-y-4 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3 pr-4">
                  <div className="h-8 sm:h-10 bg-secondary-200 dark:bg-secondary-700 rounded-lg shimmer" style={{ width: '90%' }}></div>
                  <div className="h-6 bg-secondary-200 dark:bg-secondary-700 rounded-lg shimmer" style={{ width: '70%' }}></div>
                </div>
                <div className="flex-shrink-0 h-10 w-32 bg-gradient-to-r from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 rounded-full shimmer"></div>
              </div>
            </div>
            
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-emerald-200 dark:bg-emerald-700 rounded-full shimmer"></div>
                <div className="h-8 w-24 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-full shimmer"></div>
              </div>
              <div className="h-8 w-20 bg-gradient-to-r from-blue-100 to-primary-100 dark:from-blue-900/30 dark:to-primary-900/30 rounded-full shimmer"></div>
            </div>

            {/* Summary Content Box */}
            <div className="bg-gradient-to-r from-secondary-100/50 to-primary-100/30 dark:from-secondary-800/50 dark:to-primary-900/20 rounded-2xl p-6 mb-6 border border-secondary-100 dark:border-secondary-700">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-primary-300 to-purple-300 dark:from-primary-600 dark:to-purple-600 rounded-xl shimmer"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-20 bg-primary-200 dark:bg-primary-700 rounded shimmer"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-secondary-300 dark:bg-secondary-600 rounded shimmer" style={{ width: '100%' }}></div>
                    <div className="h-6 bg-secondary-300 dark:bg-secondary-600 rounded shimmer" style={{ width: '95%' }}></div>
                    <div className="h-6 bg-secondary-300 dark:bg-secondary-600 rounded shimmer" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Keywords Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-5 h-5 bg-gradient-to-r from-accent-300 to-orange-300 dark:from-accent-600 dark:to-orange-600 rounded-lg shimmer"></div>
                <div className="h-4 w-24 bg-secondary-200 dark:bg-secondary-700 rounded shimmer"></div>
              </div>
              <div className="flex flex-wrap gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-gradient-to-r from-accent-100 to-orange-100 dark:from-accent-900/30 dark:to-orange-900/30 rounded-full shimmer"></div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 pt-6 border-t-2 border-secondary-100 dark:border-secondary-700">
              <div className="h-12 w-36 bg-gradient-to-r from-primary-300 to-purple-300 dark:from-primary-600 dark:to-purple-600 rounded-xl shimmer"></div>
              <div className="h-12 w-32 bg-secondary-200 dark:bg-secondary-700 border-2 border-secondary-300 dark:border-secondary-600 rounded-xl shimmer"></div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ArticleSkeleton;