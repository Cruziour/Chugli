// src/hooks/useGeolocation.js

import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setLocationPermission } from "@/features/ui/uiSlice";
import { updateLocation } from "@/features/auth/authSlice";
import { storage } from "@/utils/helpers";
import { STORAGE_KEYS } from "@/utils/constants";

export const useGeolocation = (options = {}) => {
  const dispatch = useDispatch();
  const [location, setLocation] = useState(() => {
    // Try to get last saved location
    const saved = storage.get(STORAGE_KEYS.LAST_LOCATION);
    return saved || { latitude: null, longitude: null };
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000, // 5 minutes
    updateBackend = false,
  } = options;

  // Get current position
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      dispatch(setLocationPermission("denied"));
      return Promise.reject(new Error("Geolocation not supported"));
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { latitude, longitude };

          setLocation(newLocation);
          setIsLoading(false);
          dispatch(setLocationPermission("granted"));

          // Save to localStorage
          storage.set(STORAGE_KEYS.LAST_LOCATION, newLocation);

          // Update backend if requested
          if (updateBackend) {
            try {
              await dispatch(updateLocation({ longitude, latitude })).unwrap();
            } catch (err) {
              console.error("Failed to update location on backend:", err);
            }
          }

          resolve(newLocation);
        },
        (err) => {
          setIsLoading(false);

          let errorMessage = "Failed to get location";
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = "Location permission denied";
              dispatch(setLocationPermission("denied"));
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case err.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }

          setError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    });
  }, [dispatch, enableHighAccuracy, timeout, maximumAge, updateBackend]);

  // Check permission status
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      return "unknown";
    }

    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      dispatch(setLocationPermission(result.state));
      return result.state;
    } catch (err) {
      return "unknown";
    }
  }, [dispatch]);

  // Request location on mount if needed
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Watch position (continuous updates)
  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { latitude, longitude };
        setLocation(newLocation);
        storage.set(STORAGE_KEYS.LAST_LOCATION, newLocation);
      },
      (err) => {
        console.error("Watch position error:", err);
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );

    return watchId;
  }, [enableHighAccuracy, timeout, maximumAge]);

  // Clear watch
  const clearWatch = useCallback((watchId) => {
    if (navigator.geolocation && watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return {
    location,
    error,
    isLoading,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    checkPermission,
    hasLocation: location.latitude !== null && location.longitude !== null,
  };
};

export default useGeolocation;
