// src/components/room/DeleteRoomModal.jsx

import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import {
  closeDeleteRoomModal,
  selectSelectedRoom,
  selectUI,
} from "@/features/ui/uiSlice";
import { deleteRoom } from "@/features/room/roomSlice";

const DeleteRoomModal = () => {
  const dispatch = useDispatch();
  const { isDeleteRoomModalOpen } = useSelector(selectUI);
  const room = useSelector(selectSelectedRoom);
  const { deleteLoading } = useSelector((state) => state.room);

  const handleClose = () => {
    dispatch(closeDeleteRoomModal());
  };

  const handleDelete = async () => {
    if (!room) return;

    try {
      await dispatch(deleteRoom(room._id)).unwrap();
      toast.success("Room deleted successfully");
      handleClose();
    } catch (err) {
      toast.error(err || "Failed to delete room");
    }
  };

  if (!room) return null;

  return (
    <Modal
      isOpen={isDeleteRoomModalOpen}
      onClose={handleClose}
      title="Delete Room"
      size="small"
    >
      <div className="space-y-6">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Delete "{room.name}"?
          </h3>
          <p className="text-dark-400 text-sm">
            This action cannot be undone. All active users will be disconnected
            and all messages will be lost forever.
          </p>
        </div>

        {/* Active Users Warning */}
        {room.activeMembers > 0 && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm text-center">
              ⚠️ {room.activeMembers} user
              {room.activeMembers !== 1 ? "s are" : " is"} currently in this
              room
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleClose}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={handleDelete}
            isLoading={deleteLoading}
            leftIcon={<Trash2 className="w-5 h-5" />}
          >
            Delete Room
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteRoomModal;
