// src/features/room/roomSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import roomApi from "@/api/roomApi";
import { ROOM_CONSTRAINTS } from "@/utils/constants";

// ============== Initial State ==============

const initialState = {
  // Discovered rooms
  rooms: [],
  roomsLoading: false,
  roomsError: null,

  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRooms: 0,
    hasMore: false,
  },

  // Search params
  searchParams: {
    longitude: null,
    latitude: null,
    radius: ROOM_CONSTRAINTS.DEFAULT_RADIUS_METERS,
  },

  // My rooms
  myRooms: [],
  myRoomsLoading: false,
  myRoomsError: null,

  // Current room (for joining/viewing)
  currentRoom: null,
  currentRoomLoading: false,
  currentRoomError: null,

  // Room actions
  createLoading: false,
  createError: null,

  deleteLoading: false,
  deleteError: null,

  // Search results
  searchResults: [],
  searchLoading: false,
  searchQuery: "",
};

// ============== Async Thunks ==============

// Discover Nearby Rooms
export const discoverRooms = createAsyncThunk(
  "room/discover",
  async (
    {
      longitude,
      latitude,
      radius,
      page = 1,
      limit = 20,
      excludePrivate = false,
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await roomApi.discoverRooms({
        longitude,
        latitude,
        radius,
        page,
        limit,
        excludePrivate,
      });
      return {
        ...response.data,
        isLoadMore: page > 1,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to discover rooms"
      );
    }
  }
);

// Get My Rooms
export const getMyRooms = createAsyncThunk(
  "room/getMyRooms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await roomApi.getMyRooms();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch your rooms"
      );
    }
  }
);

// Get Room By ID
export const getRoomById = createAsyncThunk(
  "room/getById",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await roomApi.getRoomById(roomId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch room"
      );
    }
  }
);

// Create Room
export const createRoom = createAsyncThunk(
  "room/create",
  async (roomData, { rejectWithValue }) => {
    try {
      const response = await roomApi.createRoom(roomData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create room"
      );
    }
  }
);

// Update Room
export const updateRoom = createAsyncThunk(
  "room/update",
  async ({ roomId, data }, { rejectWithValue }) => {
    try {
      const response = await roomApi.updateRoom(roomId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update room"
      );
    }
  }
);

// Delete Room
export const deleteRoom = createAsyncThunk(
  "room/delete",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await roomApi.deleteRoom(roomId);
      return { ...response.data, roomId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete room"
      );
    }
  }
);

// Verify Room Password
export const verifyRoomPassword = createAsyncThunk(
  "room/verifyPassword",
  async ({ roomId, password }, { rejectWithValue }) => {
    try {
      const response = await roomApi.verifyRoomPassword(roomId, password);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid password"
      );
    }
  }
);

// Search Rooms
export const searchRooms = createAsyncThunk(
  "room/search",
  async ({ query, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await roomApi.searchRooms(query, page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Search failed");
    }
  }
);

// Get Room Stats
export const getRoomStats = createAsyncThunk(
  "room/getStats",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await roomApi.getRoomStats(roomId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stats"
      );
    }
  }
);

// ============== Slice ==============

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    // Clear errors
    clearRoomErrors: (state) => {
      state.roomsError = null;
      state.myRoomsError = null;
      state.currentRoomError = null;
      state.createError = null;
      state.deleteError = null;
    },

    // Set search params
    setSearchParams: (state, action) => {
      state.searchParams = {
        ...state.searchParams,
        ...action.payload,
      };
    },

    // Set radius
    setRadius: (state, action) => {
      state.searchParams.radius = action.payload;
    },

    // Clear current room
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
      state.currentRoomError = null;
    },

    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = "";
    },

    // Update room in list (for real-time updates)
    updateRoomInList: (state, action) => {
      const updatedRoom = action.payload;

      // Update in rooms list
      const roomIndex = state.rooms.findIndex((r) => r._id === updatedRoom._id);
      if (roomIndex !== -1) {
        state.rooms[roomIndex] = { ...state.rooms[roomIndex], ...updatedRoom };
      }

      // Update in myRooms list
      const myRoomIndex = state.myRooms.findIndex(
        (r) => r._id === updatedRoom._id
      );
      if (myRoomIndex !== -1) {
        state.myRooms[myRoomIndex] = {
          ...state.myRooms[myRoomIndex],
          ...updatedRoom,
        };
      }

      // Update current room if matches
      if (state.currentRoom?._id === updatedRoom._id) {
        state.currentRoom = { ...state.currentRoom, ...updatedRoom };
      }
    },

    // Remove room from list (when deleted)
    removeRoomFromList: (state, action) => {
      const roomId = action.payload;

      state.rooms = state.rooms.filter((r) => r._id !== roomId);
      state.myRooms = state.myRooms.filter((r) => r._id !== roomId);

      if (state.currentRoom?._id === roomId) {
        state.currentRoom = null;
      }
    },

    // Update active members count
    updateRoomMembers: (state, action) => {
      const { roomId, activeMembers } = action.payload;

      const updateRoom = (room) => {
        if (room._id === roomId) {
          room.activeMembers = activeMembers;
        }
      };

      state.rooms.forEach(updateRoom);
      state.myRooms.forEach(updateRoom);

      if (state.currentRoom?._id === roomId) {
        state.currentRoom.activeMembers = activeMembers;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ============== Discover Rooms ==============
      .addCase(discoverRooms.pending, (state, action) => {
        state.roomsLoading = true;
        state.roomsError = null;

        // If it's first page, show loader
        if (!action.meta.arg.page || action.meta.arg.page === 1) {
          state.rooms = [];
        }
      })
      .addCase(discoverRooms.fulfilled, (state, action) => {
        state.roomsLoading = false;

        const { data, isLoadMore } = action.payload;

        if (isLoadMore) {
          // Append to existing rooms
          state.rooms = [...state.rooms, ...data.rooms];
        } else {
          // Replace rooms
          state.rooms = data.rooms;
        }

        state.pagination = data.pagination;
        state.searchParams = {
          ...state.searchParams,
          longitude: data.searchParams?.coordinates?.[0],
          latitude: data.searchParams?.coordinates?.[1],
          radius: data.searchParams?.radius,
        };
      })
      .addCase(discoverRooms.rejected, (state, action) => {
        state.roomsLoading = false;
        state.roomsError = action.payload;
      })

      // ============== Get My Rooms ==============
      .addCase(getMyRooms.pending, (state) => {
        state.myRoomsLoading = true;
        state.myRoomsError = null;
      })
      .addCase(getMyRooms.fulfilled, (state, action) => {
        state.myRoomsLoading = false;
        state.myRooms = action.payload.data?.rooms || [];
      })
      .addCase(getMyRooms.rejected, (state, action) => {
        state.myRoomsLoading = false;
        state.myRoomsError = action.payload;
      })

      // ============== Get Room By ID ==============
      .addCase(getRoomById.pending, (state) => {
        state.currentRoomLoading = true;
        state.currentRoomError = null;
      })
      .addCase(getRoomById.fulfilled, (state, action) => {
        state.currentRoomLoading = false;
        state.currentRoom = action.payload.data?.room;
      })
      .addCase(getRoomById.rejected, (state, action) => {
        state.currentRoomLoading = false;
        state.currentRoomError = action.payload;
      })

      // ============== Create Room ==============
      .addCase(createRoom.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.createLoading = false;
        const newRoom = action.payload.data?.room;

        // Add to myRooms
        if (newRoom) {
          state.myRooms.unshift(newRoom);
        }
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })

      // ============== Update Room ==============
      .addCase(updateRoom.pending, (state) => {
        state.currentRoomLoading = true;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.currentRoomLoading = false;
        const updatedRoom = action.payload.data?.room;

        if (updatedRoom) {
          // Update in lists
          const myRoomIndex = state.myRooms.findIndex(
            (r) => r._id === updatedRoom._id
          );
          if (myRoomIndex !== -1) {
            state.myRooms[myRoomIndex] = updatedRoom;
          }

          const roomIndex = state.rooms.findIndex(
            (r) => r._id === updatedRoom._id
          );
          if (roomIndex !== -1) {
            state.rooms[roomIndex] = updatedRoom;
          }

          if (state.currentRoom?._id === updatedRoom._id) {
            state.currentRoom = updatedRoom;
          }
        }
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.currentRoomLoading = false;
        state.currentRoomError = action.payload;
      })

      // ============== Delete Room ==============
      .addCase(deleteRoom.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const { roomId } = action.payload;

        // Remove from all lists
        state.rooms = state.rooms.filter((r) => r._id !== roomId);
        state.myRooms = state.myRooms.filter((r) => r._id !== roomId);

        if (state.currentRoom?._id === roomId) {
          state.currentRoom = null;
        }
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })

      // ============== Verify Room Password ==============
      .addCase(verifyRoomPassword.pending, (state) => {
        state.currentRoomLoading = true;
        state.currentRoomError = null;
      })
      .addCase(verifyRoomPassword.fulfilled, (state) => {
        state.currentRoomLoading = false;
      })
      .addCase(verifyRoomPassword.rejected, (state, action) => {
        state.currentRoomLoading = false;
        state.currentRoomError = action.payload;
      })

      // ============== Search Rooms ==============
      .addCase(searchRooms.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchRooms.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.data?.rooms || [];
        state.searchQuery = action.payload.data?.searchQuery || "";
      })
      .addCase(searchRooms.rejected, (state) => {
        state.searchLoading = false;
        state.searchResults = [];
      });
  },
});

// Export actions
export const {
  clearRoomErrors,
  setSearchParams,
  setRadius,
  clearCurrentRoom,
  clearSearchResults,
  updateRoomInList,
  removeRoomFromList,
  updateRoomMembers,
} = roomSlice.actions;

// Export selectors
export const selectRooms = (state) => state.room.rooms;
export const selectMyRooms = (state) => state.room.myRooms;
export const selectCurrentRoom = (state) => state.room.currentRoom;
export const selectSearchParams = (state) => state.room.searchParams;
export const selectPagination = (state) => state.room.pagination;
export const selectSearchResults = (state) => state.room.searchResults;

// Export reducer
export default roomSlice.reducer;
