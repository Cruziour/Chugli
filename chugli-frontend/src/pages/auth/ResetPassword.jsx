// src/pages/auth/ResetPassword.jsx

import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Lock,
  Key,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import OTPInput from "@/components/auth/OTPInput";
import PasswordStrength from "@/components/auth/PasswordStrength";
import {
  resetPassword,
  resendOTP,
  clearError,
  clearOtpState,
} from "@/features/auth/authSlice";
import { validateResetPasswordForm, validateOTP } from "@/utils/validation";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading, error, resetEmail, otpEmail } = useSelector(
    (state) => state.auth
  );

  // Get email from location state or Redux
  const email = location.state?.email || resetEmail || otpEmail;

  const [step, setStep] = useState(1); // 1: OTP, 2: New Password
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOTPChange = (value) => {
    setOtp(value);
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: null }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleOTPSubmit = (e) => {
    e.preventDefault();

    const otpError = validateOTP(otp);
    if (otpError) {
      setErrors({ otp: otpError });
      return;
    }

    setStep(2);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateResetPasswordForm({ otp, ...formData });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await dispatch(
        resetPassword({
          email,
          otp,
          newPassword: formData.newPassword,
          confirmNewPassword: formData.confirmNewPassword,
        })
      ).unwrap();

      dispatch(clearOtpState());
      setIsSuccess(true);
      toast.success("Password reset successful!");

      // Redirect to login after delay
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    } catch (err) {
      toast.error(err || "Failed to reset password");
      // Go back to OTP step if OTP is invalid
      if (
        err?.toLowerCase().includes("otp") ||
        err?.toLowerCase().includes("invalid")
      ) {
        setStep(1);
        setOtp("");
      }
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      await dispatch(resendOTP({ email, purpose: "reset" })).unwrap();

      toast.success("OTP sent successfully!");
      setResendCooldown(60);
      setOtp("");
      setStep(1);
    } catch (err) {
      toast.error(err || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  // Success State
  if (isSuccess) {
    return (
      <AuthLayout
        title="Password Reset!"
        subtitle="Your password has been successfully reset"
      >
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto animate-scale-in">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>

          {/* Message */}
          <p className="text-dark-400">
            You can now sign in with your new password.
          </p>

          {/* Redirecting */}
          <div className="flex items-center justify-center gap-2 text-primary-400 text-sm">
            <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
            <span>Redirecting to login...</span>
          </div>

          {/* Manual Login Button */}
          <Button
            onClick={() => navigate("/login", { replace: true })}
            fullWidth
          >
            Go to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // Step 1: OTP Input
  if (step === 1) {
    return (
      <AuthLayout
        title="Enter OTP"
        subtitle="Enter the code sent to your email"
      >
        <form onSubmit={handleOTPSubmit} className="space-y-6">
          {/* Email Display */}
          <div className="text-center p-3 bg-dark-800 rounded-lg">
            <p className="text-dark-400 text-sm">Sending OTP to</p>
            <p className="text-white font-medium">{email}</p>
          </div>

          {/* Global Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* OTP Input */}
          <div className="space-y-2">
            <OTPInput
              length={6}
              value={otp}
              onChange={handleOTPChange}
              disabled={isLoading}
              error={!!errors.otp}
            />
            {errors.otp && (
              <p className="text-center text-sm text-red-400">{errors.otp}</p>
            )}
          </div>

          {/* Continue Button */}
          <Button
            type="submit"
            fullWidth
            disabled={otp.length !== 6}
            leftIcon={<Key className="w-5 h-5" />}
          >
            Continue
          </Button>

          {/* Resend OTP */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendCooldown > 0 || isResending}
              className={`
                inline-flex items-center gap-2 text-sm font-medium transition-colors
                ${
                  resendCooldown > 0 || isResending
                    ? "text-dark-500 cursor-not-allowed"
                    : "text-primary-400 hover:text-primary-300"
                }
              `}
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend OTP
                </>
              )}
            </button>
          </div>

          {/* Back to Login */}
          <div className="text-center pt-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-dark-400 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </form>
      </AuthLayout>
    );
  }

  // Step 2: New Password
  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Enter your new password below"
    >
      <form onSubmit={handleResetSubmit} className="space-y-5">
        {/* OTP Verified Badge */}
        <div className="flex items-center justify-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm">OTP Verified</span>
        </div>

        {/* Global Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* New Password */}
        <div>
          <Input
            label="New Password"
            type="password"
            name="newPassword"
            placeholder="Enter new password"
            value={formData.newPassword}
            onChange={handlePasswordChange}
            error={errors.newPassword}
            leftIcon={<Lock className="w-5 h-5" />}
            autoComplete="new-password"
            disabled={isLoading}
          />
          <PasswordStrength password={formData.newPassword} />
        </div>

        {/* Confirm Password */}
        <Input
          label="Confirm New Password"
          type="password"
          name="confirmNewPassword"
          placeholder="Confirm new password"
          value={formData.confirmNewPassword}
          onChange={handlePasswordChange}
          error={errors.confirmNewPassword}
          leftIcon={<Lock className="w-5 h-5" />}
          autoComplete="new-password"
          disabled={isLoading}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          leftIcon={<Key className="w-5 h-5" />}
        >
          Reset Password
        </Button>

        {/* Back Button */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-dark-400 hover:text-white text-sm transition-colors"
          >
            ← Back to OTP
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
