/**
 * Format distance for display
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * Format time ago
 */
export const timeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return past.toLocaleDateString();
};

/**
 * Format time for messages
 */
export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Get initials from username
 */
export const getInitials = (username) => {
  if (!username) return "?";
  return username.charAt(0).toUpperCase();
};

/**
 * Generate random color for avatar
 */
export const getAvatarColor = (username) => {
  const colors = [
    "bg-blue-600",
    "bg-green-600",
    "bg-purple-600",
    "bg-pink-600",
    "bg-indigo-600",
    "bg-cyan-600",
    "bg-orange-600",
    "bg-teal-600",
  ];

  if (!username) return colors[0];

  const index = username.charCodeAt(0) % colors.length;
  return colors[index];
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }
  if (!/[A-Za-z]/.test(password)) {
    errors.push("Password must contain at least one letter");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return errors;
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
};

/**
 * Get error message from API response
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return "Something went wrong";
};

/**
 * Store data in localStorage
 */
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Storage set error:", error);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Storage remove error:", error);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Storage clear error:", error);
    }
  },
};
