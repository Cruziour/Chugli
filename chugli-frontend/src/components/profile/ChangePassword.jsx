// src/components/profile/ChangePassword.jsx

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { changePassword, clearError } from "@/features/auth/authSlice";
import { validatePassword, validateConfirmPassword } from "@/utils/validation";

const ChangePassword = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setErrors({});
      setSuccess(false);
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    const confirmError = validateConfirmPassword(
      formData.newPassword,
      formData.confirmNewPassword
    );
    if (confirmError) {
      newErrors.confirmNewPassword = confirmError;
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await dispatch(
        changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmNewPassword: formData.confirmNewPassword,
        })
      ).unwrap();

      setSuccess(true);
      toast.success("Password changed successfully!");

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      toast.error(err || "Failed to change password");
    }
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="" size="small">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Password Changed!
          </h3>
          <p className="text-dark-400">
            Your password has been updated successfully.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Password"
      size="default"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Global Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Current Password */}
        <Input
          label="Current Password"
          type="password"
          name="currentPassword"
          placeholder="Enter current password"
          value={formData.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
          leftIcon={<Lock className="w-5 h-5" />}
          disabled={isLoading}
        />

        {/* New Password */}
        <div>
          <Input
            label="New Password"
            type="password"
            name="newPassword"
            placeholder="Enter new password"
            value={formData.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            leftIcon={<Lock className="w-5 h-5" />}
            disabled={isLoading}
          />
          <PasswordStrength password={formData.newPassword} />
        </div>

        {/* Confirm New Password */}
        <Input
          label="Confirm New Password"
          type="password"
          name="confirmNewPassword"
          placeholder="Confirm new password"
          value={formData.confirmNewPassword}
          onChange={handleChange}
          error={errors.confirmNewPassword}
          leftIcon={<Lock className="w-5 h-5" />}
          disabled={isLoading}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" fullWidth isLoading={isLoading}>
            Change Password
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePassword;
