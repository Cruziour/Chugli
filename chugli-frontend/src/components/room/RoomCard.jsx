// src/components/room/RoomCard.jsx

import { memo } from "react";
import {
  Lock,
  Unlock,
  Users,
  MapPin,
  Clock,
  MoreVertical,
  Trash2,
  Edit3,
  LogIn,
} from "lucide-react";
import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import Avatar from "@/components/common/Avatar";
import { formatDistance, timeAgo, truncateText } from "@/utils/helpers";
import { selectUser } from "@/features/auth/authSlice";
import {
  openJoinRoomModal,
  openDeleteRoomModal,
  openPasswordModal,
} from "@/features/ui/uiSlice";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

const RoomCard = memo(
  ({
    room,
    showDistance = true,
    showActions = false,
    onJoin,
    className = "",
  }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    useOnClickOutside(menuRef, () => setShowMenu(false));

    const isCreator = user?._id === room.creator?._id;
    const hasPassword = room.isPrivate || room.hasPassword;

    const handleCardClick = () => {
      if (hasPassword && !isCreator) {
        dispatch(openPasswordModal(room));
      } else {
        handleJoin();
      }
    };

    const handleJoin = () => {
      if (onJoin) {
        onJoin(room);
      } else {
        navigate(`/chat/${room._id}`);
      }
    };

    const handleDelete = (e) => {
      e.stopPropagation();
      setShowMenu(false);
      dispatch(openDeleteRoomModal(room));
    };

    return (
      <div
        onClick={handleCardClick}
        className={`
        group relative bg-dark-800 border border-dark-700 rounded-xl p-4
        hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10
        transition-all duration-300 cursor-pointer
        ${className}
      `}
      >
        {/* Top Row: Creator Avatar & Room Info */}
        <div className="flex items-start gap-3">
          {/* Creator Avatar */}
          <Avatar username={room.creator?.username} size="default" />

          {/* Room Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white truncate">{room.name}</h3>
              {hasPassword ? (
                <Lock className="w-4 h-4 text-primary-400 flex-shrink-0" />
              ) : (
                <Unlock className="w-4 h-4 text-green-400 flex-shrink-0" />
              )}
            </div>

            <p className="text-sm text-dark-400 truncate">
              by @{room.creator?.username || "unknown"}
            </p>
          </div>

          {/* Actions Menu (for creator) */}
          {showActions && isCreator && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700 
                       rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 top-full mt-1 w-40 bg-dark-800 border 
                            border-dark-700 rounded-lg shadow-xl py-1 z-20 animate-scale-in"
                >
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 
                           hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Room
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {room.description && (
          <p className="mt-3 text-sm text-dark-400 line-clamp-2">
            {truncateText(room.description, 100)}
          </p>
        )}

        {/* Tags */}
        {room.tags && room.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {room.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-dark-700 text-dark-300 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
            {room.tags.length > 3 && (
              <span className="px-2 py-0.5 text-dark-500 text-xs">
                +{room.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Bottom Row: Stats */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {/* Active Members */}
            <div className="flex items-center gap-1.5 text-dark-400">
              <Users className="w-4 h-4" />
              <span>{room.activeMembers || 0} online</span>
            </div>

            {/* Distance */}
            {showDistance && room.distance !== undefined && (
              <div className="flex items-center gap-1.5 text-dark-400">
                <MapPin className="w-4 h-4" />
                <span>{formatDistance(room.distance)}</span>
              </div>
            )}
          </div>

          {/* Last Activity */}
          <div className="flex items-center gap-1.5 text-dark-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">
              {timeAgo(room.lastActivityAt || room.createdAt)}
            </span>
          </div>
        </div>

        {/* Hover Join Button */}
        <div
          className="absolute inset-0 bg-dark-900/80 rounded-xl flex items-center 
                    justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 
                   text-white font-semibold rounded-lg transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Join Room
          </button>
        </div>

        {/* Creator Badge */}
        {isCreator && (
          <div
            className="absolute top-2 right-2 px-2 py-0.5 bg-primary-500/20 
                      text-primary-400 text-xs rounded-full border border-primary-500/30"
          >
            Your Room
          </div>
        )}
      </div>
    );
  }
);

RoomCard.displayName = "RoomCard";

export default RoomCard;
