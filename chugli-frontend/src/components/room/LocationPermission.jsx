// src/components/room/LocationPermission.jsx

import { MapPin, Navigation, AlertTriangle } from "lucide-react";
import Button from "@/components/common/Button";

const LocationPermission = ({
  onEnable,
  isLoading = false,
  error = null,
  variant = "default", // 'default' | 'compact' | 'banner'
}) => {
  if (variant === "banner") {
    return (
      <div
        className="bg-gradient-to-r from-primary-600/20 to-primary-500/10 
                    border border-primary-500/30 rounded-xl p-4 mb-6"
      >
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Enable Location</h3>
              <p className="text-sm text-dark-400">
                Discover chat rooms near you
              </p>
            </div>
          </div>
          <Button
            onClick={onEnable}
            isLoading={isLoading}
            leftIcon={<Navigation className="w-5 h-5" />}
            className="md:ml-auto w-full md:w-auto"
          >
            Enable Location
          </Button>
        </div>
        {error && (
          <div className="flex items-center gap-2 mt-3 text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={onEnable}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 
                 rounded-lg text-primary-400 hover:bg-primary-500/20 transition-colors"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Navigation className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">Enable Location</span>
      </button>
    );
  }

  // Default variant - Full card
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center max-w-md mx-auto">
      {/* Icon */}
      <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <MapPin className="w-10 h-10 text-primary-400" />
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-white mb-2">Location Required</h2>

      {/* Description */}
      <p className="text-dark-400 mb-6">
        To discover chat rooms near you, we need access to your location. Your
        exact location is never shared with other users.
      </p>

      {/* Button */}
      <Button
        onClick={onEnable}
        isLoading={isLoading}
        leftIcon={<Navigation className="w-5 h-5" />}
        fullWidth
      >
        Enable Location Access
      </Button>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-center gap-2 mt-4 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Privacy Note */}
      <p className="text-xs text-dark-500 mt-6">
        🔒 Your privacy is important. Location is only used to find nearby
        rooms.
      </p>
    </div>
  );
};

export default LocationPermission;
