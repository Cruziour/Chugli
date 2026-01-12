/* eslint-disable no-unused-vars */
// src/features/auth/authSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "@/api/authApi";
import { storage } from "@/utils/helpers";
import { STORAGE_KEYS } from "@/utils/constants";

// ============== Initial State ==============

const initialState = {
  user: storage.get(STORAGE_KEYS.USER) || null,
  accessToken: storage.get(STORAGE_KEYS.ACCESS_TOKEN) || null,
  refreshToken: storage.get(STORAGE_KEYS.REFRESH_TOKEN) || null,
  isAuthenticated: !!storage.get(STORAGE_KEYS.ACCESS_TOKEN),
  isLoading: false,
  isInitialized: false,
  error: null,

  // OTP related
  otpEmail: null,
  otpPurpose: null, // 'verify' | 'reset'
  otpSent: false,

  // Password reset
  resetEmail: null,
};

// ============== Async Thunks ==============

// Register User
export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOTP(email, otp);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "OTP verification failed"
      );
    }
  }
);

// Resend OTP
export const resendOTP = createAsyncThunk(
  "auth/resendOTP",
  async ({ email, purpose }, { rejectWithValue }) => {
    try {
      const response = await authApi.resendOTP(email, purpose);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to resend OTP"
      );
    }
  }
);

// Login User
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;

      // Special case: Email not verified
      if (error.response?.status === 403) {
        return rejectWithValue({
          message: errorData?.message || "Email not verified",
          requiresVerification: true,
          email: credentials.email,
        });
      }

      return rejectWithValue(errorData?.message || "Login failed");
    }
  }
);

// Logout User
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      return null;
    } catch (error) {
      // Even if API fails, we should still logout locally
      return null;
    }
  }
);

// Get Current User
export const getMe = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getMe();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

// Refresh Token
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await authApi.refreshToken(auth.refreshToken);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Token refresh failed"
      );
    }
  }
);

// Update Location
export const updateLocation = createAsyncThunk(
  "auth/updateLocation",
  async ({ longitude, latitude }, { rejectWithValue }) => {
    try {
      const response = await authApi.updateLocation(longitude, latitude);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update location"
      );
    }
  }
);

// Forgot Password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword(email);
      return { ...response.data, email };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send reset email"
      );
    }
  }
);

// Reset Password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { email, otp, newPassword, confirmNewPassword },
    { rejectWithValue }
  ) => {
    try {
      const response = await authApi.resetPassword(
        email,
        otp,
        newPassword,
        confirmNewPassword
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

// Change Password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    { currentPassword, newPassword, confirmNewPassword },
    { rejectWithValue }
  ) => {
    try {
      const response = await authApi.changePassword(
        currentPassword,
        newPassword,
        confirmNewPassword
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to change password"
      );
    }
  }
);

// Delete Account
export const deleteAccount = createAsyncThunk(
  "auth/deleteAccount",
  async (password, { rejectWithValue }) => {
    try {
      const response = await authApi.deleteAccount(password);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete account"
      );
    }
  }
);

// ============== Slice ==============

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set OTP email
    setOtpEmail: (state, action) => {
      state.otpEmail = action.payload.email;
      state.otpPurpose = action.payload.purpose || "verify";
    },

    // Clear OTP state
    clearOtpState: (state) => {
      state.otpEmail = null;
      state.otpPurpose = null;
      state.otpSent = false;
    },

    // Set initialized
    setInitialized: (state) => {
      state.isInitialized = true;
    },

    // Update tokens (used by axios interceptor)
    updateTokens: (state, action) => {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;

      storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    },

    // Clear auth (force logout)
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.otpEmail = null;
      state.otpPurpose = null;
      state.otpSent = false;
      state.resetEmail = null;

      storage.remove(STORAGE_KEYS.USER);
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    },

    // Update user data
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      storage.set(STORAGE_KEYS.USER, state.user);
    },
  },
  extraReducers: (builder) => {
    builder
      // ============== Register ==============
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpEmail = action.payload.data?.user?.email;
        state.otpPurpose = "verify";
        state.otpSent = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ============== Verify OTP ==============
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data?.user;
        state.accessToken = action.payload.data?.accessToken;
        state.refreshToken = action.payload.data?.refreshToken;
        state.isAuthenticated = true;
        state.otpEmail = null;
        state.otpPurpose = null;
        state.otpSent = false;

        // Save to storage
        storage.set(STORAGE_KEYS.USER, action.payload.data?.user);
        storage.set(
          STORAGE_KEYS.ACCESS_TOKEN,
          action.payload.data?.accessToken
        );
        storage.set(
          STORAGE_KEYS.REFRESH_TOKEN,
          action.payload.data?.refreshToken
        );
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ============== Resend OTP ==============
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.otpSent = true;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ============== Login ==============
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data?.user;
        state.accessToken = action.payload.data?.accessToken;
        state.refreshToken = action.payload.data?.refreshToken;
        state.isAuthenticated = true;

        // Save to storage
        storage.set(STORAGE_KEYS.USER, action.payload.data?.user);
        storage.set(
          STORAGE_KEYS.ACCESS_TOKEN,
          action.payload.data?.accessToken
        );
        storage.set(
          STORAGE_KEYS.REFRESH_TOKEN,
          action.payload.data?.refreshToken
        );
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;

        // Handle verification required case
        if (action.payload?.requiresVerification) {
          state.otpEmail = action.payload.email;
          state.otpPurpose = "verify";
          state.otpSent = true;
        }

        state.error = action.payload?.message || action.payload;
      })

      // ============== Logout ==============
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.otpEmail = null;
        state.otpPurpose = null;
        state.otpSent = false;

        // Clear storage
        storage.remove(STORAGE_KEYS.USER);
        storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      })
      .addCase(logout.rejected, (state) => {
        // Even on error, logout locally
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;

        storage.remove(STORAGE_KEYS.USER);
        storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      })

      // ============== Get Me ==============
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data?.user;
        state.isInitialized = true;

        storage.set(STORAGE_KEYS.USER, action.payload.data?.user);
      })
      .addCase(getMe.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        // Don't clear auth on getMe failure - token might still be valid
      })

      // ============== Refresh Token ==============
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.data?.accessToken;
        state.refreshToken = action.payload.data?.refreshToken;

        storage.set(
          STORAGE_KEYS.ACCESS_TOKEN,
          action.payload.data?.accessToken
        );
        storage.set(
          STORAGE_KEYS.REFRESH_TOKEN,
          action.payload.data?.refreshToken
        );
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        // Token refresh failed - logout
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;

        storage.remove(STORAGE_KEYS.USER);
        storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      })

      // ============== Update Location ==============
      .addCase(updateLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data?.user;
        storage.set(STORAGE_KEYS.USER, action.payload.data?.user);
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ============== Forgot Password ==============
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resetEmail = action.payload.email;
        state.otpEmail = action.payload.email;
        state.otpPurpose = "reset";
        state.otpSent = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ============== Reset Password ==============
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.resetEmail = null;
        state.otpEmail = null;
        state.otpPurpose = null;
        state.otpSent = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ============== Change Password ==============
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.data?.accessToken;
        state.refreshToken = action.payload.data?.refreshToken;

        storage.set(
          STORAGE_KEYS.ACCESS_TOKEN,
          action.payload.data?.accessToken
        );
        storage.set(
          STORAGE_KEYS.REFRESH_TOKEN,
          action.payload.data?.refreshToken
        );
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ============== Delete Account ==============
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;

        storage.remove(STORAGE_KEYS.USER);
        storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  clearError,
  setOtpEmail,
  clearOtpState,
  setInitialized,
  updateTokens,
  clearAuth,
  updateUser,
} = authSlice.actions;

// Export selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

// Export reducer
export default authSlice.reducer;
