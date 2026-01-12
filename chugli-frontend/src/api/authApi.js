import { get, post, patch, del } from "./axios";

const authApi = {
  /**
   * Register new user
   */
  register: (userData) => {
    return post("/auth/register", {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
      longitude: userData.longitude,
      latitude: userData.latitude,
    });
  },

  /**
   * Verify OTP
   */
  verifyOTP: (email, otp) => {
    return post("/auth/verify-otp", { email, otp });
  },

  /**
   * Resend OTP
   */
  resendOTP: (email, purpose = "verify") => {
    return post("/auth/resend-otp", { email, purpose });
  },

  /**
   * Login user
   */
  login: (credentials) => {
    return post("/auth/login", {
      email: credentials.email,
      password: credentials.password,
    });
  },

  /**
   * Logout user
   */
  logout: () => {
    return post("/auth/logout");
  },

  /**
   * Get current user
   */
  getMe: () => {
    return get("/auth/me");
  },

  /**
   * Refresh access token
   */
  refreshToken: (refreshToken) => {
    return post("/auth/refresh-token", { refreshToken });
  },

  /**
   * Update user location
   */
  updateLocation: (longitude, latitude) => {
    return patch("/auth/location", { longitude, latitude });
  },

  /**
   * Forgot password - send OTP
   */
  forgotPassword: (email) => {
    return post("/auth/forgot-password", { email });
  },

  /**
   * Reset password with OTP
   */
  resetPassword: (email, otp, newPassword, confirmNewPassword) => {
    return post("/auth/reset-password", {
      email,
      otp,
      newPassword,
      confirmNewPassword,
    });
  },

  /**
   * Change password (when logged in)
   */
  changePassword: (currentPassword, newPassword, confirmNewPassword) => {
    return post("/auth/change-password", {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
  },

  /**
   * Delete account
   */
  deleteAccount: (password) => {
    return del("/auth/account", { data: { password } });
  },
};

export default authApi;
