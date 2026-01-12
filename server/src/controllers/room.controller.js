// src/controllers/room.controller.js

import Room from '../models/room.model.js';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ROOM_CONSTRAINTS } from '../utils/constants.js';

/**
 * @desc    Create a new room
 * @route   POST /api/v1/rooms
 * @access  Private
 */
export const createRoom = asyncHandler(async (req, res) => {
  const { name, description, isPrivate, password, tags, longitude, latitude } = req.body;
  const userId = req.user._id;

  // Check if user has reached room limit
  const userRoomCount = await Room.countByCreator(userId);

  if (userRoomCount >= ROOM_CONSTRAINTS.MAX_ROOMS_PER_USER) {
    throw ApiError.badRequest(
      `You can only create maximum ${ROOM_CONSTRAINTS.MAX_ROOMS_PER_USER} rooms`
    );
  }

  // Check if room name already exists
  const existingRoom = await Room.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    isActive: true,
  });

  if (existingRoom) {
    throw ApiError.conflict('Room with this name already exists');
  }

  // Determine location (from request or user's location)
  let coordinates;
  if (longitude && latitude) {
    coordinates = [longitude, latitude];
  } else if (
    req.user.location?.coordinates &&
    !(req.user.location.coordinates[0] === 0 && req.user.location.coordinates[1] === 0)
  ) {
    coordinates = req.user.location.coordinates;
  } else {
    throw ApiError.badRequest('Location is required to create a room');
  }

  // Create room
  const room = await Room.create({
    name: name.trim(),
    description: description?.trim() || '',
    creator: userId,
    location: {
      type: 'Point',
      coordinates,
    },
    isPrivate,
    password: isPrivate ? password : undefined,
    tags: tags || [],
  });

  // Update user's room count
  await User.findByIdAndUpdate(userId, {
    $inc: { roomsCreated: 1 },
  });

  // Populate creator info
  await room.populate('creator', 'username');

  res.status(201).json(
    new ApiResponse(
      201,
      {
        room: room.toPublicRoom(),
      },
      'Room created successfully'
    )
  );
});

/**
 * @desc    Get room by ID
 * @route   GET /api/v1/rooms/:roomId
 * @access  Private
 */
export const getRoomById = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId).populate('creator', 'username');

  if (!room) {
    throw ApiError.notFound('Room not found');
  }

  if (!room.isActive) {
    throw ApiError.notFound('Room has been deleted');
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        room: room.toPublicRoom(),
      },
      'Room fetched successfully'
    )
  );
});

/**
 * @desc    Discover nearby rooms (Aggregation Pipeline)
 * @route   GET /api/v1/rooms/discover
 * @access  Private
 */
export const discoverRooms = asyncHandler(async (req, res) => {
  const {
    longitude,
    latitude,
    radius = ROOM_CONSTRAINTS.DEFAULT_RADIUS_METERS,
    page = 1,
    limit = 20,
    excludePrivate = false,
  } = req.query;

  const coordinates = [parseFloat(longitude), parseFloat(latitude)];
  const radiusMeters = parseInt(radius);
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Use MongoDB Aggregation Pipeline for geo-based discovery
  const rooms = await Room.findNearby(coordinates, radiusMeters, {
    skip,
    limit: parseInt(limit),
    excludePrivate: excludePrivate === 'true',
  });

  // Get total count for pagination
  const totalCount = await Room.countDocuments({
    isActive: true,
    location: {
      $geoWithin: {
        $centerSphere: [coordinates, radiusMeters / 6378100], // Convert to radians
      },
    },
    ...(excludePrivate === 'true' && { isPrivate: false }),
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        rooms,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalRooms: totalCount,
          hasMore: skip + rooms.length < totalCount,
        },
        searchParams: {
          coordinates,
          radius: radiusMeters,
        },
      },
      'Rooms discovered successfully'
    )
  );
});

/**
 * @desc    Get my created rooms
 * @route   GET /api/v1/rooms/my-rooms
 * @access  Private
 */
export const getMyRooms = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const rooms = await Room.find({
    creator: userId,
    isActive: true,
  })
    .populate('creator', 'username')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        rooms: rooms.map((room) => room.toPublicRoom()),
        count: rooms.length,
        maxAllowed: ROOM_CONSTRAINTS.MAX_ROOMS_PER_USER,
      },
      'My rooms fetched successfully'
    )
  );
});

/**
 * @desc    Update room
 * @route   PATCH /api/v1/rooms/:roomId
 * @access  Private (Creator only)
 */
export const updateRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { description, tags } = req.body;
  const userId = req.user._id;

  const room = await Room.findById(roomId);

  if (!room) {
    throw ApiError.notFound('Room not found');
  }

  if (!room.isActive) {
    throw ApiError.notFound('Room has been deleted');
  }

  // Check if user is the creator
  if (room.creator.toString() !== userId.toString()) {
    throw ApiError.forbidden('Only room creator can update the room');
  }

  // Update fields
  if (description !== undefined) {
    room.description = description.trim();
  }
  if (tags !== undefined) {
    room.tags = tags;
  }

  room.lastActivityAt = new Date();
  await room.save();

  await room.populate('creator', 'username');

  res.status(200).json(
    new ApiResponse(
      200,
      {
        room: room.toPublicRoom(),
      },
      'Room updated successfully'
    )
  );
});

/**
 * @desc    Delete room
 * @route   DELETE /api/v1/rooms/:roomId
 * @access  Private (Creator only)
 */
export const deleteRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user._id;

  const room = await Room.findById(roomId);

  if (!room) {
    throw ApiError.notFound('Room not found');
  }

  // Check if user is the creator
  if (room.creator.toString() !== userId.toString()) {
    throw ApiError.forbidden('Only room creator can delete the room');
  }

  // Soft delete - mark as inactive
  room.isActive = false;
  await room.save();

  // Decrement user's room count
  await User.findByIdAndUpdate(userId, {
    $inc: { roomsCreated: -1 },
  });

  // Return the room ID for socket notification
  res.status(200).json(
    new ApiResponse(
      200,
      {
        roomId: room._id,
        roomName: room.name,
      },
      'Room deleted successfully'
    )
  );
});

/**
 * @desc    Verify room password (for joining private rooms)
 * @route   POST /api/v1/rooms/:roomId/verify-password
 * @access  Private
 */
export const verifyRoomPassword = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { password } = req.body;

  const room = await Room.findByIdWithPassword(roomId);

  if (!room) {
    throw ApiError.notFound('Room not found');
  }

  if (!room.isActive) {
    throw ApiError.notFound('Room has been deleted');
  }

  if (!room.isPrivate) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          verified: true,
          message: 'Room is public',
        },
        'No password required'
      )
    );
  }

  // Verify password
  const isValid = await room.comparePassword(password);

  if (!isValid) {
    throw ApiError.unauthorized('Invalid room password');
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        verified: true,
        roomId: room._id,
      },
      'Password verified successfully'
    )
  );
});

/**
 * @desc    Get room stats
 * @route   GET /api/v1/rooms/:roomId/stats
 * @access  Private
 */
export const getRoomStats = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId).populate('creator', 'username');

  if (!room) {
    throw ApiError.notFound('Room not found');
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          roomId: room._id,
          name: room.name,
          creator: room.creator,
          activeMembers: room.activeMembers,
          isPrivate: room.isPrivate,
          createdAt: room.createdAt,
          lastActivityAt: room.lastActivityAt,
          uptime: Date.now() - new Date(room.createdAt).getTime(),
        },
      },
      'Room stats fetched successfully'
    )
  );
});

/**
 * @desc    Search rooms by name
 * @route   GET /api/v1/rooms/search
 * @access  Private
 */
export const searchRooms = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;

  if (!q || q.trim().length < 2) {
    throw ApiError.badRequest('Search query must be at least 2 characters');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const rooms = await Room.find({
    name: { $regex: q.trim(), $options: 'i' },
    isActive: true,
  })
    .populate('creator', 'username')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ activeMembers: -1, createdAt: -1 });

  const totalCount = await Room.countDocuments({
    name: { $regex: q.trim(), $options: 'i' },
    isActive: true,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        rooms: rooms.map((room) => room.toPublicRoom()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalRooms: totalCount,
          hasMore: skip + rooms.length < totalCount,
        },
        searchQuery: q.trim(),
      },
      'Search completed'
    )
  );
});

export default {
  createRoom,
  getRoomById,
  discoverRooms,
  getMyRooms,
  updateRoom,
  deleteRoom,
  verifyRoomPassword,
  getRoomStats,
  searchRooms,
};
