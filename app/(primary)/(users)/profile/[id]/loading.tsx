interface PostSkeletonProps {
  count?: number;
}

const PostSkeleton: React.FC<PostSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="">
      <div className="py-4 animate-pulse max-w-2xl mx-auto mt-8 space-y-3 ">
        <div className="w-20 h-20 ml-2 bg-neutral-300 dark:bg-neutral-800 rounded-full flex-shrink-0" />
        <div className="space-y-1">
          <div className="h-4 ml-2 bg-neutral-300 dark:bg-neutral-800 rounded w-1/3 sm:w-1/6" />
          <div className="h-4 ml-2 bg-neutral-300 dark:bg-neutral-800 rounded w-1/3 sm:w-1/6" />
          <div className="h-4 ml-2 bg-transparent rounded w-1/3 sm:w-1/6" />
        </div>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="space-y-4">
            <div className="flex gap-3 px-6 py-3 border rounded-xl">
              <div className="w-12 h-12 bg-neutral-300 dark:bg-neutral-800 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-neutral-300 dark:bg-neutral-800 rounded w-24" />
                  <div className="h-4 bg-neutral-300 dark:bg-neutral-800 rounded w-16" />
                </div>
                <div className="mt-2 space-y-2">
                  <div className="h-4 bg-neutral-300 dark:bg-neutral-800 rounded w-full" />
                  <div className="h-4 bg-neutral-300 dark:bg-neutral-800 rounded w-full" />
                  <div className="h-4 bg-neutral-300 dark:bg-neutral-800 rounded w-5/6" />
                  <div className="h-4 bg-neutral-300 dark:bg-neutral-800 rounded w-5/6" />
                  <div className="h-4 bg-neutral-300 dark:bg-neutral-800 rounded w-5/6" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostSkeleton;

