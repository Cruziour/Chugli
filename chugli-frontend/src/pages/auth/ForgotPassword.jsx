// src/pages/auth/ForgotPassword.jsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Send, AlertCircle, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { forgotPassword, clearError } from "@/features/auth/authSlice";
import { validateEmail } from "@/utils/validation";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    const validationError = validateEmail(email);
    if (validationError) {
      setEmailError(validationError);
      return;
    }

    try {
      await dispatch(forgotPassword(email)).unwrap();

      setIsSubmitted(true);
      toast.success("Reset instructions sent to your email!");

      // Navigate to reset password page after short delay
      setTimeout(() => {
        navigate("/reset-password", {
          state: { email, purpose: "reset" },
        });
      }, 2000);
    } catch (err) {
      // Show generic message for security
      toast.error("If an account exists, reset instructions have been sent.");
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent password reset instructions"
      >
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-10 h-10 text-green-400" />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <p className="text-dark-300">We've sent an OTP to</p>
            <p className="text-white font-medium">{email}</p>
          </div>

          {/* Instructions */}
          <p className="text-dark-400 text-sm">
            Please check your email and enter the OTP on the next screen to
            reset your password.
          </p>

          {/* Redirecting message */}
          <div className="flex items-center justify-center gap-2 text-primary-400 text-sm">
            <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
            <span>Redirecting to reset password...</span>
          </div>

          {/* Manual navigation */}
          <Button
            onClick={() =>
              navigate("/reset-password", {
                state: { email, purpose: "reset" },
              })
            }
            fullWidth
          >
            Continue to Reset Password
          </Button>

          {/* Back to Login */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-dark-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="No worries, we'll send you reset instructions"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Global Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email Input */}
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={handleEmailChange}
          error={emailError}
          leftIcon={<Mail className="w-5 h-5" />}
          autoComplete="email"
          disabled={isLoading}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          leftIcon={<Send className="w-5 h-5" />}
        >
          Send Reset Instructions
        </Button>

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
};

export default ForgotPassword;
