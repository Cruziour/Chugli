// src/pages/auth/Login.jsx

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { login, clearError, setOtpEmail } from "@/features/auth/authSlice";
import { validateLoginForm } from "@/utils/validation";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading, error, otpEmail, otpSent } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect to OTP page if verification needed
  useEffect(() => {
    if (otpEmail && otpSent) {
      toast.error("Please verify your email first");
      navigate("/verify-otp", {
        state: { email: otpEmail, purpose: "verify" },
      });
    }
  }, [otpEmail, otpSent, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await dispatch(login(formData)).unwrap();

      toast.success("Welcome back! 👋");

      // Navigate to intended destination or dashboard
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by the slice and shown below
      if (typeof err === "object" && err.requiresVerification) {
        // Will redirect via useEffect
      } else {
        toast.error(err?.message || err || "Login failed");
      }
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue to Chugli">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Global Error */}
        {error && typeof error === "string" && (
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
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          leftIcon={<Mail className="w-5 h-5" />}
          autoComplete="email"
          disabled={isLoading}
        />

        {/* Password Input */}
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          leftIcon={<Lock className="w-5 h-5" />}
          autoComplete="current-password"
          disabled={isLoading}
        />

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          leftIcon={<LogIn className="w-5 h-5" />}
        >
          Sign In
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dark-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-dark-900 text-dark-500">
              New to Chugli?
            </span>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center w-full px-6 py-3 
                     border border-primary-500 text-primary-400 rounded-lg
                     hover:bg-primary-500/10 transition-colors font-medium"
          >
            Create an Account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
