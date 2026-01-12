// src/components/profile/DeleteAccount.jsx

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Trash2, AlertTriangle, Lock } from "lucide-react";
import toast from "react-hot-toast";

import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { deleteAccount, clearError } from "@/features/auth/authSlice";

const DeleteAccount = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1); // 1: Warning, 2: Confirm
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const confirmPhrase = "DELETE";

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPassword("");
      setConfirmText("");
      setPasswordError("");
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const handleDelete = async () => {
    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    if (confirmText !== confirmPhrase) {
      toast.error(`Please type "${confirmPhrase}" to confirm`);
      return;
    }

    try {
      await dispatch(deleteAccount(password)).unwrap();
      toast.success("Account deleted successfully");
      navigate("/login", { replace: true });
    } catch (err) {
      setPasswordError(err || "Failed to delete account");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Account"
      size="default"
    >
      {step === 1 ? (
        // Step 1: Warning
        <div className="space-y-6">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>

          {/* Warning Message */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              Are you sure?
            </h3>
            <p className="text-dark-400">
              This action is permanent and cannot be undone.
            </p>
          </div>

          {/* What will be deleted */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-medium mb-3">
              The following will be permanently deleted:
            </h4>
            <ul className="space-y-2 text-sm text-dark-300">
              <li className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" />
                Your account and profile
              </li>
              <li className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" />
                All rooms you've created
              </li>
              <li className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" />
                Your account settings
              </li>
            </ul>
          </div>

          {/* Info about messages */}
          <div className="bg-dark-700/50 rounded-lg p-4">
            <p className="text-sm text-dark-400">
              💬 Your messages are already not stored on our servers, so they
              won't be affected by this action.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        </div>
      ) : (
        // Step 2: Confirm with password
        <div className="space-y-5">
          {/* Error */}
          {(error || passwordError) && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error || passwordError}</span>
            </div>
          )}

          {/* Confirm Text */}
          <div>
            <label className="input-label">
              Type{" "}
              <span className="text-red-400 font-mono">{confirmPhrase}</span> to
              confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="Type DELETE"
              className="input-field font-mono"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <Input
            label="Enter your password"
            type="password"
            placeholder="Your current password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError("");
            }}
            error={passwordError}
            leftIcon={<Lock className="w-5 h-5" />}
            disabled={isLoading}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setStep(1)}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleDelete}
              isLoading={isLoading}
              disabled={confirmText !== confirmPhrase || !password}
            >
              Delete Forever
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DeleteAccount;
