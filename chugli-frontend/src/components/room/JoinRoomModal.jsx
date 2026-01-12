// src/components/room/JoinRoomModal.jsx

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Lock, LogIn, AlertCircle, Users } from "lucide-react";
import toast from "react-hot-toast";

import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Avatar from "@/components/common/Avatar";
import {
  closePasswordModal,
  selectSelectedRoom,
  selectUI,
} from "@/features/ui/uiSlice";
import { verifyRoomPassword } from "@/features/room/roomSlice";

const JoinRoomModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isPasswordModalOpen } = useSelector(selectUI);
  const room = useSelector(selectSelectedRoom);
  const { currentRoomLoading, currentRoomError } = useSelector(
    (state) => state.room
  );

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Reset on open
  useEffect(() => {
    if (isPasswordModalOpen) {
      setPassword("");
      setError("");
    }
  }, [isPasswordModalOpen]);

  const handleClose = () => {
    dispatch(closePasswordModal());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    try {
      await dispatch(
        verifyRoomPassword({
          roomId: room._id,
          password,
        })
      ).unwrap();

      handleClose();
      navigate(`/chat/${room._id}`, {
        state: { password }, // Pass password to chat page
      });
    } catch (err) {
      setError(err || "Invalid password");
      toast.error("Invalid password");
    }
  };

  if (!room) return null;

  return (
    <Modal
      isOpen={isPasswordModalOpen}
      onClose={handleClose}
      title="Join Private Room"
      size="small"
    >
      <div className="space-y-6">
        {/* Room Info */}
        <div className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-lg">
          <Avatar username={room.creator?.username} size="large" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white truncate">{room.name}</h3>
              <Lock className="w-4 h-4 text-primary-400 flex-shrink-0" />
            </div>
            <p className="text-sm text-dark-400">
              by @{room.creator?.username}
            </p>
            <div className="flex items-center gap-1 text-xs text-dark-500 mt-1">
              <Users className="w-3 h-3" />
              <span>{room.activeMembers || 0} online</span>
            </div>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error */}
          {(error || currentRoomError) && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error || currentRoomError}</span>
            </div>
          )}

          {/* Password Input */}
          <Input
            label="Room Password"
            type="password"
            placeholder="Enter the room password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            leftIcon={<Lock className="w-5 h-5" />}
            disabled={currentRoomLoading}
            autoFocus
          />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={handleClose}
              disabled={currentRoomLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              isLoading={currentRoomLoading}
              leftIcon={<LogIn className="w-5 h-5" />}
            >
              Join Room
            </Button>
          </div>
        </form>

        {/* Info */}
        <p className="text-xs text-dark-500 text-center">
          This room is password protected. Ask the room creator for the
          password.
        </p>
      </div>
    </Modal>
  );
};

export default JoinRoomModal;
