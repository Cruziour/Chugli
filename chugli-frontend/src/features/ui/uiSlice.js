// src/features/ui/uiSlice.js

import { createSlice } from "@reduxjs/toolkit";

// ============== Initial State ==============

const initialState = {
  // Modals
  isCreateRoomModalOpen: false,
  isJoinRoomModalOpen: false,
  isDeleteRoomModalOpen: false,
  isPasswordModalOpen: false,

  // Modal data
  selectedRoom: null, // For join/delete modals

  // Global loading
  isGlobalLoading: false,
  globalLoadingMessage: "",

  // Sidebar (for desktop)
  isSidebarOpen: true,

  // Mobile menu
  isMobileMenuOpen: false,

  // Location permission
  locationPermission: "unknown", // 'unknown' | 'granted' | 'denied' | 'prompt'

  // Theme
  theme: "dark", // Only dark theme for now

  // Toast queue (handled by react-hot-toast but tracked here)
  toasts: [],
};

// ============== Slice ==============

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // ============== Create Room Modal ==============
    openCreateRoomModal: (state) => {
      state.isCreateRoomModalOpen = true;
    },
    closeCreateRoomModal: (state) => {
      state.isCreateRoomModalOpen = false;
    },

    // ============== Join Room Modal ==============
    openJoinRoomModal: (state, action) => {
      state.isJoinRoomModalOpen = true;
      state.selectedRoom = action.payload;
    },
    closeJoinRoomModal: (state) => {
      state.isJoinRoomModalOpen = false;
      state.selectedRoom = null;
    },

    // ============== Delete Room Modal ==============
    openDeleteRoomModal: (state, action) => {
      state.isDeleteRoomModalOpen = true;
      state.selectedRoom = action.payload;
    },
    closeDeleteRoomModal: (state) => {
      state.isDeleteRoomModalOpen = false;
      state.selectedRoom = null;
    },

    // ============== Password Modal ==============
    openPasswordModal: (state, action) => {
      state.isPasswordModalOpen = true;
      state.selectedRoom = action.payload;
    },
    closePasswordModal: (state) => {
      state.isPasswordModalOpen = false;
      state.selectedRoom = null;
    },

    // ============== Close All Modals ==============
    closeAllModals: (state) => {
      state.isCreateRoomModalOpen = false;
      state.isJoinRoomModalOpen = false;
      state.isDeleteRoomModalOpen = false;
      state.isPasswordModalOpen = false;
      state.selectedRoom = null;
    },

    // ============== Global Loading ==============
    setGlobalLoading: (state, action) => {
      if (typeof action.payload === "boolean") {
        state.isGlobalLoading = action.payload;
        state.globalLoadingMessage = "";
      } else {
        state.isGlobalLoading = action.payload.isLoading;
        state.globalLoadingMessage = action.payload.message || "";
      }
    },

    // ============== Sidebar ==============
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },

    // ============== Mobile Menu ==============
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setMobileMenuOpen: (state, action) => {
      state.isMobileMenuOpen = action.payload;
    },

    // ============== Location Permission ==============
    setLocationPermission: (state, action) => {
      state.locationPermission = action.payload;
    },

    // ============== Theme ==============
    setTheme: (state, action) => {
      state.theme = action.payload;
    },

    // ============== Selected Room ==============
    setSelectedRoom: (state, action) => {
      state.selectedRoom = action.payload;
    },
    clearSelectedRoom: (state) => {
      state.selectedRoom = null;
    },
  },
});

// Export actions
export const {
  openCreateRoomModal,
  closeCreateRoomModal,
  openJoinRoomModal,
  closeJoinRoomModal,
  openDeleteRoomModal,
  closeDeleteRoomModal,
  openPasswordModal,
  closePasswordModal,
  closeAllModals,
  setGlobalLoading,
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  setLocationPermission,
  setTheme,
  setSelectedRoom,
  clearSelectedRoom,
} = uiSlice.actions;

// Export selectors
export const selectUI = (state) => state.ui;
export const selectIsCreateRoomModalOpen = (state) =>
  state.ui.isCreateRoomModalOpen;
export const selectIsJoinRoomModalOpen = (state) =>
  state.ui.isJoinRoomModalOpen;
export const selectSelectedRoom = (state) => state.ui.selectedRoom;
export const selectLocationPermission = (state) => state.ui.locationPermission;
export const selectIsSidebarOpen = (state) => state.ui.isSidebarOpen;

// Export reducer
export default uiSlice.reducer;
