// src/pages/profile/Profile.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  MessageCircle,
  Settings,
  Edit3,
  RefreshCw,
  CheckCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

import ProfileHeader from "@/components/profile/ProfileHeader";
import LocationUpdate from "@/components/profile/LocationUpdate";
import Button from "@/components/common/Button";
import { selectUser, getMe } from "@/features/auth/authSlice";
import { getMyRooms, selectMyRooms } from "@/features/room/roomSlice";
import { timeAgo, formatDistance } from "@/utils/helpers";
import { ROOM_CONSTRAINTS } from "@/utils/constants";

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const myRooms = useSelector(selectMyRooms);
  const { myRoomsLoading } = useSelector((state) => state.room);
  const { isLoading } = useSelector((state) => state.auth);

  const [showLocationModal, setShowLocationModal] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    dispatch(getMe());
    dispatch(getMyRooms());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(getMe());
    dispatch(getMyRooms());
    toast.success("Profile refreshed!");
  };

  // Calculate stats
  const stats = {
    roomsCreated: myRooms.length,
    maxRooms: ROOM_CONSTRAINTS.MAX_ROOMS_PER_USER,
    totalActiveUsers: myRooms.reduce(
      (sum, room) => sum + (room.activeMembers || 0),
      0
    ),
    memberSince: user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Unknown",
    lastActive: user?.lastActiveAt ? timeAgo(user.lastActiveAt) : "Just now",
  };

  // Check if location is set
  const hasLocation =
    user?.location?.coordinates &&
    !(user.location.coordinates[0] === 0 && user.location.coordinates[1] === 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <ProfileHeader
        user={user}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Rooms Created */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.roomsCreated}/{stats.maxRooms}
          </p>
          <p className="text-sm text-dark-400">Rooms Created</p>
        </div>

        {/* Active Users in Your Rooms */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.totalActiveUsers}
          </p>
          <p className="text-sm text-dark-400">Active Users</p>
        </div>

        {/* Member Since */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-lg font-bold text-white truncate">
            {stats.memberSince}
          </p>
          <p className="text-sm text-dark-400">Member Since</p>
        </div>

        {/* Last Active */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <p className="text-lg font-bold text-white">{stats.lastActive}</p>
          <p className="text-sm text-dark-400">Last Active</p>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Your Location</h3>
              <p className="text-sm text-dark-400">
                {hasLocation ? "Location is set" : "Location not set"}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="small"
            onClick={() => setShowLocationModal(true)}
            leftIcon={<Edit3 className="w-4 h-4" />}
          >
            {hasLocation ? "Update" : "Set Location"}
          </Button>
        </div>

        {hasLocation ? (
          <div className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-lg">
            <div className="flex-1">
              <p className="text-dark-300 text-sm">
                <span className="text-dark-500">Latitude:</span>{" "}
                {user.location.coordinates[1].toFixed(6)}
              </p>
              <p className="text-dark-300 text-sm">
                <span className="text-dark-500">Longitude:</span>{" "}
                {user.location.coordinates[0].toFixed(6)}
              </p>
            </div>
            <div className="text-green-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">Active</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ Set your location to discover and create rooms near you.
            </p>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/my-rooms"
          className="flex items-center gap-4 p-4 bg-dark-800 border border-dark-700 rounded-xl
                   hover:border-primary-500/50 transition-colors group"
        >
          <div
            className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center
                        group-hover:bg-primary-500/30 transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">My Rooms</h3>
            <p className="text-sm text-dark-400">Manage your created rooms</p>
          </div>
        </Link>

        <Link
          to="/settings"
          className="flex items-center gap-4 p-4 bg-dark-800 border border-dark-700 rounded-xl
                   hover:border-primary-500/50 transition-colors group"
        >
          <div
            className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center
                        group-hover:bg-dark-600 transition-colors"
          >
            <Settings className="w-6 h-6 text-dark-300" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Settings</h3>
            <p className="text-sm text-dark-400">Account & security settings</p>
          </div>
        </Link>
      </div>

      {/* Location Update Modal */}
      <LocationUpdate
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
};

export default Profile;
