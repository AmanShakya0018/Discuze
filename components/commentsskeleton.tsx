import React from 'react'
interface CommentSkeletonProps {
  count?: number;
}


const Commentskeleton: React.FC<CommentSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="">
      <div className="animate-pulse max-w-2xl space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="space-y-4">
            <div className="flex gap-3 py-3">
              <div className="w-8 h-8 bg-neutral-300 dark:bg-neutral-800 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-3 bg-neutral-300 dark:bg-neutral-800 rounded w-24" />
                  <div className="h-3 bg-neutral-300 dark:bg-neutral-800 rounded w-16" />
                </div>
                <div className="mt-2 space-y-2">
                  <div className="h-3 bg-neutral-300 dark:bg-neutral-800 rounded w-5/6" />
                  <div className="h-3 bg-neutral-300 dark:bg-neutral-800 rounded w-2/3" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Commentskeleton