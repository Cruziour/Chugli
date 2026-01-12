// src/pages/dashboard/Dashboard.jsx

import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, MapPin, Search } from "lucide-react";
import toast from "react-hot-toast";

import Button from "@/components/common/Button";
import RadiusSlider from "@/components/room/RadiusSlider";
import RoomList from "@/components/room/RoomList";
import LocationPermission from "@/components/room/LocationPermission";
import {
  discoverRooms,
  setRadius,
  selectRooms,
  selectSearchParams,
  selectPagination,
} from "@/features/room/roomSlice";
import { openCreateRoomModal } from "@/features/ui/uiSlice";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useDebounce } from "@/hooks/useDebounce";
import { ROOM_CONSTRAINTS } from "@/utils/constants";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const rooms = useSelector(selectRooms);
  const searchParams = useSelector(selectSearchParams);
  const pagination = useSelector(selectPagination);
  const { roomsLoading, roomsError } = useSelector((state) => state.room);

  const {
    location,
    getCurrentPosition,
    isLoading: geoLoading,
    error: geoError,
    hasLocation,
  } = useGeolocation({ updateBackend: true });

  const [radius, setRadiusLocal] = useState(
    searchParams.radius || ROOM_CONSTRAINTS.DEFAULT_RADIUS_METERS
  );
  const debouncedRadius = useDebounce(radius, 300);

  // Fetch rooms when location or radius changes
  useEffect(() => {
    if (hasLocation && debouncedRadius) {
      dispatch(
        discoverRooms({
          longitude: location.longitude,
          latitude: location.latitude,
          radius: debouncedRadius,
          page: 1,
        })
      );
    }
  }, [
    dispatch,
    hasLocation,
    location.longitude,
    location.latitude,
    debouncedRadius,
  ]);

  // Handle radius change
  const handleRadiusChange = useCallback(
    (value) => {
      setRadiusLocal(value);
      dispatch(setRadius(value));
    },
    [dispatch]
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (hasLocation) {
      dispatch(
        discoverRooms({
          longitude: location.longitude,
          latitude: location.latitude,
          radius: radius,
          page: 1,
        })
      );
      toast.success("Rooms refreshed!");
    }
  }, [dispatch, hasLocation, location, radius]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (pagination.hasMore && !roomsLoading && hasLocation) {
      dispatch(
        discoverRooms({
          longitude: location.longitude,
          latitude: location.latitude,
          radius: radius,
          page: pagination.currentPage + 1,
        })
      );
    }
  }, [dispatch, pagination, roomsLoading, hasLocation, location, radius]);

  // Handle enable location
  const handleEnableLocation = async () => {
    try {
      await getCurrentPosition();
      toast.success("Location enabled!");
    } catch (err) {
      toast.error("Failed to get location. Please enable location access.");
    }
  };

  // Handle join room
  const handleJoinRoom = (room) => {
    navigate(`/chat/${room._id}`);
  };

  // If no location, show permission screen
  if (!hasLocation && !geoLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <LocationPermission
          onEnable={handleEnableLocation}
          isLoading={geoLoading}
          error={geoError}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Discover Rooms</h1>
          <p className="section-subtitle">
            Find chat rooms near you within{" "}
            {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <Button
            variant="ghost"
            onClick={handleRefresh}
            disabled={roomsLoading || !hasLocation}
            leftIcon={
              <RefreshCw
                className={`w-5 h-5 ${roomsLoading ? "animate-spin" : ""}`}
              />
            }
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Create Room Button */}
          <Button
            onClick={() => dispatch(openCreateRoomModal())}
            leftIcon={<Plus className="w-5 h-5" />}
          >
            <span className="hidden sm:inline">Create Room</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      </div>

      {/* Location Banner (if just enabled) */}
      {hasLocation && (
        <div
          className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 
                      border border-green-500/30 rounded-lg px-4 py-2"
        >
          <MapPin className="w-4 h-4" />
          <span>Location enabled - Showing rooms near you</span>
        </div>
      )}

      {/* Radius Slider */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
        <RadiusSlider
          value={radius}
          onChange={handleRadiusChange}
          disabled={!hasLocation || roomsLoading}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-dark-400">
        <span>
          {pagination.totalRooms} room{pagination.totalRooms !== 1 ? "s" : ""}{" "}
          found
        </span>
        {pagination.totalPages > 1 && (
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
        )}
      </div>

      {/* Room List */}
      <RoomList
        rooms={rooms}
        isLoading={roomsLoading}
        error={roomsError}
        showDistance={true}
        onJoinRoom={handleJoinRoom}
        emptyTitle="No rooms nearby"
        emptyDescription={`No chat rooms found within ${
          radius >= 1000 ? `${radius / 1000}km` : `${radius}m`
        }. Try increasing your search radius or create a new room!`}
        emptyAction={
          <Button
            onClick={() => dispatch(openCreateRoomModal())}
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Create First Room
          </Button>
        }
        onRetry={handleRefresh}
      />

      {/* Load More Button */}
      {pagination.hasMore && !roomsLoading && rooms.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            variant="secondary"
            onClick={handleLoadMore}
            isLoading={roomsLoading}
          >
            Load More Rooms
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
