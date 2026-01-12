// src/components/room/CreateRoomModal.jsx

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Lock,
  Unlock,
  MapPin,
  Hash,
  X,
  Plus,
  AlertCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import {
  closeCreateRoomModal,
  selectIsCreateRoomModalOpen,
} from "@/features/ui/uiSlice";
import { createRoom, getMyRooms } from "@/features/room/roomSlice";
import { selectUser } from "@/features/auth/authSlice";
import { useGeolocation } from "@/hooks/useGeolocation";
import { ROOM_CONSTRAINTS } from "@/utils/constants";

const CreateRoomModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector(selectIsCreateRoomModalOpen);
  const user = useSelector(selectUser);
  const { createLoading, createError, myRooms } = useSelector(
    (state) => state.room
  );
  const {
    location,
    getCurrentPosition,
    isLoading: geoLoading,
    hasLocation,
  } = useGeolocation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false,
    password: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  // Check room limit
  const roomCount = myRooms?.length || user?.roomsCreated || 0;
  const canCreateRoom = roomCount < ROOM_CONSTRAINTS.MAX_ROOMS_PER_USER;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        description: "",
        isPrivate: false,
        password: "",
        tags: [],
      });
      setTagInput("");
      setErrors({});

      // Fetch my rooms to check limit
      dispatch(getMyRooms());
    }
  }, [isOpen, dispatch]);

  const handleClose = () => {
    dispatch(closeCreateRoomModal());
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    if (!tag) return;
    if (formData.tags.length >= 5) {
      toast.error("Maximum 5 tags allowed");
      return;
    }
    if (formData.tags.includes(tag)) {
      toast.error("Tag already added");
      return;
    }
    if (tag.length > 20) {
      toast.error("Tag too long (max 20 characters)");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
    }));
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleGetLocation = async () => {
    try {
      await getCurrentPosition();
      toast.success("Location updated!");
    } catch (err) {
      toast.error("Failed to get location");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Room name is required";
    } else if (formData.name.length < ROOM_CONSTRAINTS.MIN_ROOM_NAME_LENGTH) {
      newErrors.name = `Name must be at least ${ROOM_CONSTRAINTS.MIN_ROOM_NAME_LENGTH} characters`;
    } else if (formData.name.length > ROOM_CONSTRAINTS.MAX_ROOM_NAME_LENGTH) {
      newErrors.name = `Name cannot exceed ${ROOM_CONSTRAINTS.MAX_ROOM_NAME_LENGTH} characters`;
    }

    if (formData.isPrivate && !formData.password) {
      newErrors.password = "Password is required for private rooms";
    } else if (formData.isPrivate && formData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }

    if (!hasLocation) {
      newErrors.location = "Location is required to create a room";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const roomData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        isPrivate: formData.isPrivate,
        password: formData.isPrivate ? formData.password : undefined,
        tags: formData.tags,
        longitude: location.longitude,
        latitude: location.latitude,
      };

      const result = await dispatch(createRoom(roomData)).unwrap();

      toast.success("Room created successfully! 🎉");
      handleClose();

      // Navigate to the new room
      if (result.data?.room?._id) {
        navigate(`/chat/${result.data.room._id}`);
      }
    } catch (err) {
      toast.error(err || "Failed to create room");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Room"
      size="large"
    >
      {/* Room Limit Warning */}
      {!canCreateRoom ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Room Limit Reached
          </h3>
          <p className="text-dark-400 mb-6">
            You can only create {ROOM_CONSTRAINTS.MAX_ROOMS_PER_USER} rooms at a
            time. Delete an existing room to create a new one.
          </p>
          <Button variant="secondary" onClick={handleClose}>
            Got it
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Global Error */}
          {createError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          {/* Room Name */}
          <Input
            label="Room Name"
            name="name"
            placeholder="Enter room name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            leftIcon={<MessageCircle className="w-5 h-5" />}
            disabled={createLoading}
            maxLength={ROOM_CONSTRAINTS.MAX_ROOM_NAME_LENGTH}
          />

          {/* Description */}
          <div>
            <label className="input-label">Description (Optional)</label>
            <textarea
              name="description"
              placeholder="What's this room about?"
              value={formData.description}
              onChange={handleChange}
              disabled={createLoading}
              maxLength={200}
              rows={3}
              className="input-field resize-none"
            />
            <p className="text-xs text-dark-500 mt-1 text-right">
              {formData.description.length}/200
            </p>
          </div>

          {/* Private Toggle */}
          <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              {formData.isPrivate ? (
                <Lock className="w-5 h-5 text-primary-400" />
              ) : (
                <Unlock className="w-5 h-5 text-green-400" />
              )}
              <div>
                <p className="font-medium text-white">Private Room</p>
                <p className="text-xs text-dark-400">
                  {formData.isPrivate
                    ? "Users need password to join"
                    : "Anyone nearby can join"}
                </p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleChange}
                disabled={createLoading}
                className="sr-only peer"
              />
              <div
                className="w-11 h-6 bg-dark-600 rounded-full peer 
                            peer-checked:bg-primary-600 transition-colors
                            after:content-[''] after:absolute after:top-0.5 after:left-[2px]
                            after:bg-white after:rounded-full after:h-5 after:w-5
                            after:transition-all peer-checked:after:translate-x-full"
              />
            </label>
          </div>

          {/* Password (if private) */}
          {formData.isPrivate && (
            <Input
              label="Room Password"
              type="password"
              name="password"
              placeholder="Set a password for this room"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<Lock className="w-5 h-5" />}
              disabled={createLoading}
            />
          )}

          {/* Tags */}
          <div>
            <label className="input-label">Tags (Optional)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  disabled={createLoading || formData.tags.length >= 5}
                  maxLength={20}
                  className="input-field pl-10"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddTag}
                disabled={
                  createLoading || !tagInput.trim() || formData.tags.length >= 5
                }
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            {/* Tags List */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500/20 
                             text-primary-400 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="p-0.5 hover:bg-primary-500/30 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-dark-500 mt-2">
              {formData.tags.length}/5 tags
            </p>
          </div>

          {/* Location */}
          <div className="p-4 bg-dark-700/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin
                  className={`w-5 h-5 ${
                    hasLocation ? "text-green-400" : "text-dark-400"
                  }`}
                />
                <div>
                  <p className="font-medium text-white">Location</p>
                  <p className="text-xs text-dark-400">
                    {hasLocation
                      ? "Location set - Room will appear to nearby users"
                      : "Location required to create room"}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={hasLocation ? "ghost" : "secondary"}
                size="small"
                onClick={handleGetLocation}
                isLoading={geoLoading}
              >
                {hasLocation ? "Update" : "Enable"}
              </Button>
            </div>
            {errors.location && (
              <p className="text-sm text-red-400 mt-2">{errors.location}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={handleClose}
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              isLoading={createLoading}
              disabled={!hasLocation}
            >
              Create Room
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default CreateRoomModal;
