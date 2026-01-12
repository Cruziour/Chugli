// src/pages/dashboard/MyRooms.jsx

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, MessageCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import Button from "@/components/common/Button";
import RoomList from "@/components/room/RoomList";
import { getMyRooms, selectMyRooms } from "@/features/room/roomSlice";
import { openCreateRoomModal } from "@/features/ui/uiSlice";
import { ROOM_CONSTRAINTS } from "@/utils/constants";

const MyRooms = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const myRooms = useSelector(selectMyRooms);
  const { myRoomsLoading, myRoomsError } = useSelector((state) => state.room);

  // Fetch my rooms on mount
  useEffect(() => {
    dispatch(getMyRooms());
  }, [dispatch]);

  // Check room limit
  const canCreateMore = myRooms.length < ROOM_CONSTRAINTS.MAX_ROOMS_PER_USER;

  const handleJoinRoom = (room) => {
    navigate(`/chat/${room._id}`);
  };

  const handleRefresh = () => {
    dispatch(getMyRooms());
    toast.success("Rooms refreshed!");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">My Rooms</h1>
          <p className="section-subtitle">
            Manage rooms you've created ({myRooms.length}/
            {ROOM_CONSTRAINTS.MAX_ROOMS_PER_USER})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => dispatch(openCreateRoomModal())}
            leftIcon={<Plus className="w-5 h-5" />}
            disabled={!canCreateMore}
          >
            Create Room
          </Button>
        </div>
      </div>

      {/* Room Limit Warning */}
      {!canCreateMore && (
        <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-400">Room limit reached</p>
            <p className="text-sm text-dark-400">
              You've created the maximum of{" "}
              {ROOM_CONSTRAINTS.MAX_ROOMS_PER_USER} rooms. Delete a room to
              create a new one.
            </p>
          </div>
        </div>
      )}

      {/* Room Stats */}
      {myRooms.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
            <p className="text-dark-400 text-sm">Total Rooms</p>
            <p className="text-2xl font-bold text-white">{myRooms.length}</p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
            <p className="text-dark-400 text-sm">Active Users</p>
            <p className="text-2xl font-bold text-primary-400">
              {myRooms.reduce(
                (sum, room) => sum + (room.activeMembers || 0),
                0
              )}
            </p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
            <p className="text-dark-400 text-sm">Private Rooms</p>
            <p className="text-2xl font-bold text-white">
              {myRooms.filter((room) => room.isPrivate).length}
            </p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
            <p className="text-dark-400 text-sm">Public Rooms</p>
            <p className="text-2xl font-bold text-white">
              {myRooms.filter((room) => !room.isPrivate).length}
            </p>
          </div>
        </div>
      )}

      {/* Room List */}
      <RoomList
        rooms={myRooms}
        isLoading={myRoomsLoading}
        error={myRoomsError}
        showDistance={false}
        showActions={true}
        onJoinRoom={handleJoinRoom}
        emptyTitle="No rooms created yet"
        emptyDescription="Create your first room and start chatting with people nearby!"
        emptyAction={
          <Button
            onClick={() => dispatch(openCreateRoomModal())}
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Create Your First Room
          </Button>
        }
        onRetry={handleRefresh}
      />
    </div>
  );
};

export default MyRooms;
