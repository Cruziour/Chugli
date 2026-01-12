// src/components/chat/RoomDeletedModal.jsx

import { useNavigate } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";

const RoomDeletedModal = ({ isOpen, roomName }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/dashboard", { replace: true });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleGoHome}
      title=""
      size="small"
      closeOnOverlayClick={false}
      showCloseButton={false}
    >
      <div className="text-center py-4">
        {/* Warning Icon */}
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-2">Room Deleted</h2>

        {/* Message */}
        <p className="text-dark-400 mb-6">
          {roomName ? (
            <>
              The room "<span className="text-white">{roomName}</span>" has been
              deleted by its creator.
            </>
          ) : (
            "This room has been deleted by its creator."
          )}
        </p>

        {/* Button */}
        <Button
          onClick={handleGoHome}
          fullWidth
          leftIcon={<Home className="w-5 h-5" />}
        >
          Go to Dashboard
        </Button>
      </div>
    </Modal>
  );
};

export default RoomDeletedModal;
