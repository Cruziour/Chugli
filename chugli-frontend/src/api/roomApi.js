// src/api/roomApi.js

import { get, post, patch, del } from "./axios";

const roomApi = {
  /**
   * Create a new room
   */
  createRoom: (roomData) => {
    return post("/rooms", {
      name: roomData.name,
      description: roomData.description,
      isPrivate: roomData.isPrivate,
      password: roomData.password,
      tags: roomData.tags,
      longitude: roomData.longitude,
      latitude: roomData.latitude,
    });
  },

  /**
   * Discover nearby rooms
   */
  discoverRooms: ({
    longitude,
    latitude,
    radius,
    page = 1,
    limit = 20,
    excludePrivate = false,
  }) => {
    const params = new URLSearchParams({
      longitude: longitude.toString(),
      latitude: latitude.toString(),
      radius: radius.toString(),
      page: page.toString(),
      limit: limit.toString(),
      excludePrivate: excludePrivate.toString(),
    });

    return get(`/rooms/discover?${params.toString()}`);
  },

  /**
   * Search rooms by name
   */
  searchRooms: (query, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    return get(`/rooms/search?${params.toString()}`);
  },

  /**
   * Get my created rooms
   */
  getMyRooms: () => {
    return get("/rooms/my-rooms");
  },

  /**
   * Get room by ID
   */
  getRoomById: (roomId) => {
    return get(`/rooms/${roomId}`);
  },

  /**
   * Update room
   */
  updateRoom: (roomId, data) => {
    return patch(`/rooms/${roomId}`, data);
  },

  /**
   * Delete room
   */
  deleteRoom: (roomId) => {
    return del(`/rooms/${roomId}`);
  },

  /**
   * Verify room password
   */
  verifyRoomPassword: (roomId, password) => {
    return post(`/rooms/${roomId}/verify-password`, { password });
  },

  /**
   * Get room stats
   */
  getRoomStats: (roomId) => {
    return get(`/rooms/${roomId}/stats`);
  },
};

export default roomApi;
