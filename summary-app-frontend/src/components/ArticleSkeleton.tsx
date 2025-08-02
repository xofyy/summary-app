import React from 'react';

interface ArticleSkeletonProps {
  count?: number;
}

const ArticleSkeleton: React.FC<ArticleSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="grid gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <article 
          key={index} 
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-soft border border-secondary-100 animate-pulse"
          style={{ 
            animationDelay: `${index * 0.1}s`
          }}
        >
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-2 sm:space-y-0">
              <div className="flex-1 space-y-2">
                <div className="h-6 sm:h-8 bg-secondary-200 rounded-lg shimmer" style={{ width: '85%' }}></div>
                <div className="h-4 bg-secondary-200 rounded-lg shimmer" style={{ width: '60%' }}></div>
              </div>
              <div className="h-4 w-32 bg-secondary-200 rounded shimmer"></div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="h-6 w-20 bg-secondary-200 rounded-full shimmer"></div>
              <div className="h-4 w-16 bg-secondary-200 rounded shimmer"></div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="h-4 bg-secondary-200 rounded shimmer" style={{ width: '100%' }}></div>
              <div className="h-4 bg-secondary-200 rounded shimmer" style={{ width: '95%' }}></div>
              <div className="h-4 bg-secondary-200 rounded shimmer" style={{ width: '80%' }}></div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 w-16 bg-secondary-200 rounded-lg shimmer"></div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 pt-4 border-t border-secondary-100">
              <div className="h-4 w-24 bg-secondary-200 rounded shimmer"></div>
              <div className="h-4 w-28 bg-secondary-200 rounded shimmer"></div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ArticleSkeleton;