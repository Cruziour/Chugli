// src/utils/validation.js

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  return null;
};

/**
 * Validate username
 */
export const validateUsername = (username) => {
  if (!username) {
    return "Username is required";
  }

  if (username.length < 3) {
    return "Username must be at least 3 characters";
  }

  if (username.length > 30) {
    return "Username cannot exceed 30 characters";
  }

  const usernameRegex = /^[a-z0-9_]+$/;
  if (!usernameRegex.test(username.toLowerCase())) {
    return "Username can only contain lowercase letters, numbers, and underscores";
  }

  return null;
};

/**
 * Validate password
 */
export const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }

  if (password.length > 50) {
    return "Password cannot exceed 50 characters";
  }

  if (!/[A-Za-z]/.test(password)) {
    return "Password must contain at least one letter";
  }

  if (!/\d/.test(password)) {
    return "Password must contain at least one number";
  }

  return null;
};

/**
 * Validate confirm password
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return "Please confirm your password";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  return null;
};

/**
 * Validate OTP
 */
export const validateOTP = (otp) => {
  if (!otp) {
    return "OTP is required";
  }

  if (otp.length !== 6) {
    return "OTP must be 6 digits";
  }

  if (!/^\d+$/.test(otp)) {
    return "OTP must contain only numbers";
  }

  return null;
};

/**
 * Validate registration form
 */
export const validateRegistrationForm = (formData) => {
  const errors = {};

  const usernameError = validateUsername(formData.username);
  if (usernameError) errors.username = usernameError;

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;

  const confirmPasswordError = validateConfirmPassword(
    formData.password,
    formData.confirmPassword
  );
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate login form
 */
export const validateLoginForm = (formData) => {
  const errors = {};

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  if (!formData.password) {
    errors.password = "Password is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate reset password form
 */
export const validateResetPasswordForm = (formData) => {
  const errors = {};

  const otpError = validateOTP(formData.otp);
  if (otpError) errors.otp = otpError;

  const passwordError = validatePassword(formData.newPassword);
  if (passwordError) errors.newPassword = passwordError;

  const confirmPasswordError = validateConfirmPassword(
    formData.newPassword,
    formData.confirmNewPassword
  );
  if (confirmPasswordError) errors.confirmNewPassword = confirmPasswordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateEmail,
  validateUsername,
  validatePassword,
  validateConfirmPassword,
  validateOTP,
  validateRegistrationForm,
  validateLoginForm,
  validateResetPasswordForm,
};
