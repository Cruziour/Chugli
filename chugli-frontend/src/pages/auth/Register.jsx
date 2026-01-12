// src/pages/auth/Register.jsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { User, Mail, Lock, UserPlus, AlertCircle, MapPin } from "lucide-react";
import toast from "react-hot-toast";

import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { register, clearError } from "@/features/auth/authSlice";
import { validateRegistrationForm } from "@/utils/validation";
import { useGeolocation } from "@/hooks/useGeolocation";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const {
    location: geoLocation,
    getCurrentPosition,
    isLoading: geoLoading,
  } = useGeolocation();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [locationEnabled, setLocationEnabled] = useState(false);

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert username to lowercase
    const processedValue = name === "username" ? value.toLowerCase() : value;

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleLocationToggle = async () => {
    if (!locationEnabled) {
      try {
        await getCurrentPosition();
        setLocationEnabled(true);
        toast.success("Location enabled!");
      } catch (err) {
        toast.error("Could not get location. You can add it later.");
      }
    } else {
      setLocationEnabled(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateRegistrationForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const registrationData = {
        ...formData,
        ...(locationEnabled &&
          geoLocation.latitude && {
            longitude: geoLocation.longitude,
            latitude: geoLocation.latitude,
          }),
      };

      await dispatch(register(registrationData)).unwrap();

      toast.success("Registration successful! Please verify your email.");
      navigate("/verify-otp", {
        state: { email: formData.email, purpose: "verify" },
      });
    } catch (err) {
      toast.error(err || "Registration failed");
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Chugli and connect with your neighbors"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Global Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Username Input */}
        <Input
          label="Username"
          type="text"
          name="username"
          placeholder="johndoe"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          leftIcon={<User className="w-5 h-5" />}
          helperText="Lowercase letters, numbers, and underscores only"
          autoComplete="username"
          disabled={isLoading}
        />

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
        <div>
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            leftIcon={<Lock className="w-5 h-5" />}
            autoComplete="new-password"
            disabled={isLoading}
          />
          <PasswordStrength password={formData.password} />
        </div>

        {/* Confirm Password Input */}
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          leftIcon={<Lock className="w-5 h-5" />}
          autoComplete="new-password"
          disabled={isLoading}
        />

        {/* Location Toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleLocationToggle}
            disabled={geoLoading}
            className={`
              w-full flex items-center justify-between p-4 rounded-lg border
              transition-all duration-200
              ${
                locationEnabled
                  ? "bg-primary-500/10 border-primary-500/50 text-primary-400"
                  : "bg-dark-800 border-dark-600 text-dark-400 hover:border-dark-500"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <MapPin
                className={`w-5 h-5 ${
                  locationEnabled ? "text-primary-400" : ""
                }`}
              />
              <div className="text-left">
                <p
                  className={`font-medium ${
                    locationEnabled ? "text-primary-400" : "text-dark-200"
                  }`}
                >
                  Enable Location
                </p>
                <p className="text-xs text-dark-500">
                  Required for discovering nearby rooms
                </p>
              </div>
            </div>
            <div
              className={`
              w-12 h-6 rounded-full transition-colors
              ${locationEnabled ? "bg-primary-500" : "bg-dark-600"}
              relative
            `}
            >
              <div
                className={`
                absolute top-1 w-4 h-4 rounded-full bg-white
                transition-transform duration-200
                ${locationEnabled ? "translate-x-6" : "translate-x-1"}
              `}
              />
            </div>
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          leftIcon={<UserPlus className="w-5 h-5" />}
          className="mt-6"
        >
          Create Account
        </Button>

        {/* Terms */}
        <p className="text-xs text-dark-500 text-center mt-4">
          By creating an account, you agree to our{" "}
          <Link to="/terms" className="text-primary-400 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-primary-400 hover:underline">
            Privacy Policy
          </Link>
        </p>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dark-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-dark-900 text-dark-500">
              Already have an account?
            </span>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <Link
            to="/login"
            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            Sign in instead
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
