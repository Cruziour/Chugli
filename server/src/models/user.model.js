// src/models/user.model.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [
        /^[a-z0-9_]+$/,
        'Username can only contain lowercase letters, numbers, and underscores',
      ],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },

    // Email verification status
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Geospatial location for hyper-local features
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
        validate: {
          validator: function (coords) {
            if (!coords || coords.length !== 2) return false;
            const [lng, lat] = coords;
            return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
          },
          message: 'Invalid coordinates. Longitude: -180 to 180, Latitude: -90 to 90',
        },
      },
    },

    // Track last activity for auto-cleanup
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    // Refresh token for silent refresh
    refreshToken: {
      type: String,
      select: false,
    },

    // Track rooms created by user
    roomsCreated: {
      type: Number,
      default: 0,
      max: [2, 'Maximum 2 rooms allowed per user'],
    },

    // Currently joined room
    currentRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ============== Indexes ==============

// Geospatial index for location-based queries
userSchema.index({ location: '2dsphere' });

// Index for auto-cleanup queries
userSchema.index({ isVerified: 1, createdAt: 1 });
userSchema.index({ lastActiveAt: 1 });

// Compound index for faster lookups
userSchema.index({ email: 1, isVerified: 1 });

// ============== Pre-save Middleware ==============

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ============== Instance Methods ==============

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active timestamp
userSchema.methods.updateActivity = async function () {
  this.lastActiveAt = new Date();
  return await this.save({ validateBeforeSave: false });
};

// Check if user can create more rooms
userSchema.methods.canCreateRoom = function () {
  return this.roomsCreated < 2;
};

// Get public profile (exclude sensitive data)
userSchema.methods.toPublicProfile = function () {
  return {
    _id: this._id,
    username: this.username,
    isVerified: this.isVerified,
    location: this.location,
    lastActiveAt: this.lastActiveAt,
    createdAt: this.createdAt,
  };
};

// ============== Static Methods ==============

// Find user by email with password
userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email }).select('+password');
};

// Find user by refresh token
userSchema.statics.findByRefreshToken = function (refreshToken) {
  return this.findOne({ refreshToken }).select('+refreshToken');
};

// Find unverified users older than specified time
userSchema.statics.findUnverifiedExpired = function (expiryTime) {
  const cutoffDate = new Date(Date.now() - expiryTime);
  return this.find({
    isVerified: false,
    createdAt: { $lt: cutoffDate },
  });
};

// Find inactive users
userSchema.statics.findInactiveUsers = function (inactiveDays) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

  return this.find({
    lastActiveAt: { $lt: cutoffDate },
  });
};

// Find users near a location
userSchema.statics.findNearby = function (coordinates, maxDistanceMeters) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates,
        },
        $maxDistance: maxDistanceMeters,
      },
    },
    isVerified: true,
  });
};

const User = mongoose.model('User', userSchema);

export default User;
