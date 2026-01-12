// src/components/room/RadiusSlider.jsx

import { useState, useEffect, useCallback } from "react";
import { MapPin } from "lucide-react";
import { ROOM_CONSTRAINTS, RADIUS_MARKS } from "@/utils/constants";
import { formatDistance } from "@/utils/helpers";

const RadiusSlider = ({
  value = ROOM_CONSTRAINTS.DEFAULT_RADIUS_METERS,
  onChange,
  disabled = false,
  showLabel = true,
  className = "",
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  // Sync with external value
  useEffect(() => {
    if (!isDragging) {
      setLocalValue(value);
    }
  }, [value, isDragging]);

  // Calculate percentage for styling
  const percentage =
    ((localValue - ROOM_CONSTRAINTS.MIN_RADIUS_METERS) /
      (ROOM_CONSTRAINTS.MAX_RADIUS_METERS -
        ROOM_CONSTRAINTS.MIN_RADIUS_METERS)) *
    100;

  const handleChange = useCallback((e) => {
    const newValue = parseInt(e.target.value, 10);
    setLocalValue(newValue);
  }, []);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    onChange?.(localValue);
  };

  // Handle touch events for mobile
  const handleTouchEnd = () => {
    setIsDragging(false);
    onChange?.(localValue);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {showLabel && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-dark-200">
              Discovery Radius
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary-400">
              {formatDistance(localValue)}
            </span>
          </div>
        </div>
      )}

      {/* Slider Container */}
      <div className="relative">
        {/* Track Background */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center">
          <div className="w-full h-2 bg-dark-700 rounded-full">
            {/* Active Track */}
            <div
              className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-100"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Range Input */}
        <input
          type="range"
          min={ROOM_CONSTRAINTS.MIN_RADIUS_METERS}
          max={ROOM_CONSTRAINTS.MAX_RADIUS_METERS}
          step={100}
          value={localValue}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleTouchEnd}
          disabled={disabled}
          className="relative w-full h-8 appearance-none bg-transparent cursor-pointer
                     disabled:cursor-not-allowed disabled:opacity-50 z-10
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-6
                     [&::-webkit-slider-thumb]:h-6
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-primary-500
                     [&::-webkit-slider-thumb]:border-4
                     [&::-webkit-slider-thumb]:border-dark-900
                     [&::-webkit-slider-thumb]:shadow-lg
                     [&::-webkit-slider-thumb]:shadow-primary-500/30
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:transition-transform
                     [&::-webkit-slider-thumb]:hover:scale-110
                     [&::-webkit-slider-thumb]:active:scale-95
                     [&::-moz-range-thumb]:appearance-none
                     [&::-moz-range-thumb]:w-6
                     [&::-moz-range-thumb]:h-6
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-primary-500
                     [&::-moz-range-thumb]:border-4
                     [&::-moz-range-thumb]:border-dark-900
                     [&::-moz-range-thumb]:cursor-pointer"
        />

        {/* Marks */}
        <div className="absolute left-0 right-0 top-full mt-2 flex justify-between px-1">
          {RADIUS_MARKS.map((mark) => {
            const markPercentage =
              ((mark.value - ROOM_CONSTRAINTS.MIN_RADIUS_METERS) /
                (ROOM_CONSTRAINTS.MAX_RADIUS_METERS -
                  ROOM_CONSTRAINTS.MIN_RADIUS_METERS)) *
              100;
            const isActive = localValue >= mark.value;

            return (
              <button
                key={mark.value}
                onClick={() => {
                  setLocalValue(mark.value);
                  onChange?.(mark.value);
                }}
                disabled={disabled}
                className={`
                  text-xs transition-colors
                  ${isActive ? "text-primary-400" : "text-dark-500"}
                  hover:text-primary-300 disabled:hover:text-dark-500
                `}
                style={{
                  position: "absolute",
                  left: `${markPercentage}%`,
                  transform: "translateX(-50%)",
                }}
              >
                {mark.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacer for marks */}
      <div className="h-6" />
    </div>
  );
};

export default RadiusSlider;
