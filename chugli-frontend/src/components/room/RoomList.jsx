// src/components/room/RoomList.jsx

import { memo } from "react";
import RoomCard from "./RoomCard";
import RoomCardSkeleton from "./RoomCardSkeleton";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/common/Button";
import { MessageCircle, Plus, RefreshCw } from "lucide-react";

const RoomList = memo(
  ({
    rooms = [],
    isLoading = false,
    error = null,
    showDistance = true,
    showActions = false,
    emptyTitle = "No rooms found",
    emptyDescription = "Try adjusting your search radius or create a new room.",
    emptyAction = null,
    onRetry = null,
    onJoinRoom,
    className = "",
  }) => {
    // Loading State
    if (isLoading && rooms.length === 0) {
      return (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
        >
          {[...Array(6)].map((_, index) => (
            <RoomCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    // Error State
    if (error) {
      return (
        <EmptyState
          icon={<RefreshCw className="w-8 h-8" />}
          title="Failed to load rooms"
          description={error}
          action={
            onRetry && (
              <Button onClick={onRetry} variant="secondary">
                Try Again
              </Button>
            )
          }
        />
      );
    }

    // Empty State
    if (rooms.length === 0) {
      return (
        <EmptyState
          icon={<MessageCircle className="w-8 h-8" />}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      );
    }

    // Room Grid
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
      >
        {rooms.map((room) => (
          <RoomCard
            key={room._id}
            room={room}
            showDistance={showDistance}
            showActions={showActions}
            onJoin={onJoinRoom}
          />
        ))}

        {/* Loading more indicator */}
        {isLoading && rooms.length > 0 && (
          <>
            <RoomCardSkeleton />
            <RoomCardSkeleton />
            <RoomCardSkeleton />
          </>
        )}
      </div>
    );
  }
);

RoomList.displayName = "RoomList";

export default RoomList;
