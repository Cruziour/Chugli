// src/components/profile/LocationUpdate.jsx

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Navigation,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { updateLocation, selectUser } from "@/features/auth/authSlice";
import { useGeolocation } from "@/hooks/useGeolocation";

const LocationUpdate = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { isLoading: authLoading } = useSelector((state) => state.auth);

  const {
    location: geoLocation,
    getCurrentPosition,
    isLoading: geoLoading,
    error: geoError,
    hasLocation: hasGeoLocation,
  } = useGeolocation();

  const [step, setStep] = useState("initial"); // 'initial' | 'fetching' | 'confirm' | 'success'
  const [newLocation, setNewLocation] = useState(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("initial");
      setNewLocation(null);
    }
  }, [isOpen]);

  const handleGetLocation = async () => {
    setStep("fetching");

    try {
      const location = await getCurrentPosition();
      setNewLocation(location);
      setStep("confirm");
    } catch (error) {
      toast.error("Failed to get location. Please enable location access.");
      setStep("initial");
    }
  };

  const handleConfirmLocation = async () => {
    if (!newLocation) return;

    try {
      await dispatch(
        updateLocation({
          longitude: newLocation.longitude,
          latitude: newLocation.latitude,
        })
      ).unwrap();

      setStep("success");
      toast.success("Location updated successfully!");

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      toast.error(error || "Failed to update location");
      setStep("confirm");
    }
  };

  const currentLocation = user?.location?.coordinates;
  const hasCurrentLocation =
    currentLocation && !(currentLocation[0] === 0 && currentLocation[1] === 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Location"
      size="default"
    >
      <div className="space-y-6">
        {/* Current Location */}
        {hasCurrentLocation && step === "initial" && (
          <div className="p-4 bg-dark-700/50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 text-primary-400" />
              <span className="font-medium text-white">Current Location</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-dark-500">Latitude</span>
                <p className="text-dark-200">{currentLocation[1].toFixed(6)}</p>
              </div>
              <div>
                <span className="text-dark-500">Longitude</span>
                <p className="text-dark-200">{currentLocation[0].toFixed(6)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step: Initial */}
        {step === "initial" && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {hasCurrentLocation
                ? "Update Your Location"
                : "Set Your Location"}
            </h3>
            <p className="text-dark-400 text-sm mb-6">
              We'll use your device's GPS to get your current location. This
              helps you discover nearby chat rooms.
            </p>
            <Button
              onClick={handleGetLocation}
              fullWidth
              leftIcon={<Navigation className="w-5 h-5" />}
            >
              Get Current Location
            </Button>
          </div>
        )}

        {/* Step: Fetching */}
        {step === "fetching" && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Getting Your Location
            </h3>
            <p className="text-dark-400 text-sm">
              Please wait while we fetch your location...
            </p>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && newLocation && (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-medium text-green-400">
                  New Location Found
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-dark-500">Latitude</span>
                  <p className="text-white">
                    {newLocation.latitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <span className="text-dark-500">Longitude</span>
                  <p className="text-white">
                    {newLocation.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={handleGetLocation}>
                Retry
              </Button>
              <Button
                fullWidth
                onClick={handleConfirmLocation}
                isLoading={authLoading}
              >
                Confirm & Save
              </Button>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Location Updated!
            </h3>
            <p className="text-dark-400 text-sm">
              Your location has been saved successfully.
            </p>
          </div>
        )}

        {/* Privacy Note */}
        {step !== "success" && (
          <div className="flex items-start gap-3 p-3 bg-dark-700/50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-dark-400">
              Your exact location is never shared with other users. It's only
              used to find rooms near you.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LocationUpdate;
