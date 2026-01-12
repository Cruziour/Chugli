// src/pages/auth/VerifyOTP.jsx

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ShieldCheck, RefreshCw, AlertCircle, Mail } from "lucide-react";
import toast from "react-hot-toast";

import AuthLayout from "@/components/auth/AuthLayout";
import OTPInput from "@/components/auth/OTPInput";
import Button from "@/components/common/Button";
import {
  verifyOTP,
  resendOTP,
  clearError,
  clearOtpState,
} from "@/features/auth/authSlice";
import { validateOTP } from "@/utils/validation";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading, error, otpEmail } = useSelector((state) => state.auth);

  // Get email from location state or Redux
  const email = location.state?.email || otpEmail;
  const purpose = location.state?.purpose || "verify";

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate("/login");
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
    setOtpError("");
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    // Validate OTP
    const otpValidationError = validateOTP(otp);
    if (otpValidationError) {
      setOtpError(otpValidationError);
      return;
    }

    try {
      await dispatch(verifyOTP({ email, otp })).unwrap();

      dispatch(clearOtpState());
      toast.success("Email verified successfully! 🎉");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setOtpError(err || "Invalid OTP");
      toast.error(err || "Verification failed");
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      await dispatch(resendOTP({ email, purpose })).unwrap();

      toast.success("OTP sent successfully!");
      setResendCooldown(60); // 60 seconds cooldown
      setOtp("");
      setOtpError("");
    } catch (err) {
      toast.error(err || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  // Mask email for display
  const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : "";

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="Enter the 6-digit code we sent to your email"
    >
      <form onSubmit={handleVerify} className="space-y-6">
        {/* Email Display */}
        <div className="flex items-center justify-center gap-2 p-3 bg-dark-800 rounded-lg">
          <Mail className="w-4 h-4 text-primary-400" />
          <span className="text-dark-300 text-sm">{maskedEmail}</span>
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
            error={!!otpError}
          />
          {otpError && (
            <p className="text-center text-sm text-red-400">{otpError}</p>
          )}
        </div>

        {/* Verify Button */}
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={otp.length !== 6}
          leftIcon={<ShieldCheck className="w-5 h-5" />}
        >
          Verify Email
        </Button>

        {/* Resend OTP */}
        <div className="text-center space-y-3">
          <p className="text-dark-500 text-sm">Didn't receive the code?</p>

          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendCooldown > 0 || isResending}
            className={`
              inline-flex items-center gap-2 text-sm font-medium
              transition-colors
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

        {/* Info Box */}
        <div className="mt-6 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
          <div className="flex gap-3">
            <ShieldCheck className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-primary-400 font-medium">
                OTP Valid for 10 minutes
              </p>
              <p className="text-dark-400 mt-1">
                Check your spam folder if you don't see the email in your inbox.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => {
              dispatch(clearOtpState());
              navigate("/login");
            }}
            className="text-dark-400 hover:text-white text-sm transition-colors"
          >
            ← Back to Login
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default VerifyOTP;
