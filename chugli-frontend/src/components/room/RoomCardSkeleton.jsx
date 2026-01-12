// src/components/room/RoomCardSkeleton.jsx

const RoomCardSkeleton = () => {
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 animate-pulse">
      {/* Top Row */}
      <div className="flex items-start gap-3">
        {/* Avatar Skeleton */}
        <div className="w-10 h-10 bg-dark-700 rounded-full" />

        {/* Info Skeleton */}
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-dark-700 rounded w-3/4" />
          <div className="h-4 bg-dark-700 rounded w-1/2" />
        </div>
      </div>

      {/* Description Skeleton */}
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-dark-700 rounded w-full" />
        <div className="h-4 bg-dark-700 rounded w-2/3" />
      </div>

      {/* Tags Skeleton */}
      <div className="mt-3 flex gap-2">
        <div className="h-5 bg-dark-700 rounded-full w-16" />
        <div className="h-5 bg-dark-700 rounded-full w-12" />
        <div className="h-5 bg-dark-700 rounded-full w-14" />
      </div>

      {/* Bottom Row Skeleton */}
      <div className="mt-4 flex justify-between">
        <div className="flex gap-4">
          <div className="h-4 bg-dark-700 rounded w-20" />
          <div className="h-4 bg-dark-700 rounded w-16" />
        </div>
        <div className="h-4 bg-dark-700 rounded w-12" />
      </div>
    </div>
  );
};

export default RoomCardSkeleton;
