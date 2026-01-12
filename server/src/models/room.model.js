// // src/models/room.model.js

// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';
// import { ROOM_CONSTRAINTS } from '../utils/constants.js';

// const roomSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, 'Room name is required'],
//       unique: true,
//       trim: true,
//       minlength: [
//         ROOM_CONSTRAINTS.MIN_ROOM_NAME_LENGTH,
//         `Room name must be at least ${ROOM_CONSTRAINTS.MIN_ROOM_NAME_LENGTH} characters`,
//       ],
//       maxlength: [
//         ROOM_CONSTRAINTS.MAX_ROOM_NAME_LENGTH,
//         `Room name cannot exceed ${ROOM_CONSTRAINTS.MAX_ROOM_NAME_LENGTH} characters`,
//       ],
//     },

//     description: {
//       type: String,
//       trim: true,
//       maxlength: [200, 'Description cannot exceed 200 characters'],
//       default: '',
//     },

//     // Room creator
//     creator: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: [true, 'Room creator is required'],
//     },

//     // Geospatial location for hyper-local discovery
//     location: {
//       type: {
//         type: String,
//         enum: ['Point'],
//         default: 'Point',
//       },
//       coordinates: {
//         type: [Number], // [longitude, latitude]
//         required: [true, 'Room location is required'],
//         validate: {
//           validator: function (coords) {
//             if (!coords || coords.length !== 2) return false;
//             const [lng, lat] = coords;
//             return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
//           },
//           message: 'Invalid coordinates',
//         },
//       },
//     },

//     // Privacy settings
//     isPrivate: {
//       type: Boolean,
//       default: false,
//     },

//     // Password for private rooms (hashed)
//     password: {
//       type: String,
//       select: false, // Don't include in queries by default
//     },

//     // Active members count (for real-time tracking)
//     activeMembers: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     // Track when room became empty (for auto-cleanup)
//     emptyAt: {
//       type: Date,
//       default: null,
//     },

//     // Room status
//     isActive: {
//       type: Boolean,
//       default: true,
//     },

//     // Room tags for categorization
//     tags: {
//       type: [String],
//       default: [],
//       validate: {
//         validator: function (tags) {
//           return tags.length <= 5;
//         },
//         message: 'Maximum 5 tags allowed',
//       },
//     },

//     // Last activity in room
//     lastActivityAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // ============== Indexes ==============

// // Geospatial index for location-based queries
// roomSchema.index({ location: '2dsphere' });

// // Index for finding active rooms
// roomSchema.index({ isActive: 1, activeMembers: 1 });

// // Index for creator's rooms
// roomSchema.index({ creator: 1, isActive: 1 });

// // Index for empty room cleanup
// roomSchema.index({ emptyAt: 1, activeMembers: 1 });

// // Compound index for discovery
// roomSchema.index({ isActive: 1, location: '2dsphere' });

// // ============== Virtuals ==============

// // Check if room is empty
// roomSchema.virtual('isEmpty').get(function () {
//   return this.activeMembers === 0;
// });

// // Check if room has password
// roomSchema.virtual('hasPassword').get(function () {
//   return this.isPrivate;
// });

// // ============== Pre-save Middleware ==============

// // Hash password before saving
// roomSchema.pre('save', async function (next) {
//   // Only hash if password is modified and exists
//   if (!this.isModified('password') || !this.password) {
//     return next();
//   }

//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Set emptyAt when room becomes empty
// roomSchema.pre('save', function (next) {
//   if (this.isModified('activeMembers')) {
//     if (this.activeMembers === 0 && !this.emptyAt) {
//       this.emptyAt = new Date();
//     } else if (this.activeMembers > 0) {
//       this.emptyAt = null;
//     }
//   }
//   next();
// });

// // ============== Instance Methods ==============

// // Compare room password
// roomSchema.methods.comparePassword = async function (candidatePassword) {
//   if (!this.password) return true; // No password set
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Increment active members
// roomSchema.methods.memberJoined = async function () {
//   this.activeMembers += 1;
//   this.emptyAt = null;
//   this.lastActivityAt = new Date();
//   return await this.save({ validateBeforeSave: false });
// };

// // Decrement active members
// roomSchema.methods.memberLeft = async function () {
//   this.activeMembers = Math.max(0, this.activeMembers - 1);
//   if (this.activeMembers === 0) {
//     this.emptyAt = new Date();
//   }
//   this.lastActivityAt = new Date();
//   return await this.save({ validateBeforeSave: false });
// };

// // Update activity timestamp
// roomSchema.methods.updateActivity = async function () {
//   this.lastActivityAt = new Date();
//   return await this.save({ validateBeforeSave: false });
// };

// // Get public room info (exclude sensitive data)
// roomSchema.methods.toPublicRoom = function () {
//   return {
//     _id: this._id,
//     name: this.name,
//     description: this.description,
//     creator: this.creator,
//     location: this.location,
//     isPrivate: this.isPrivate,
//     hasPassword: this.isPrivate,
//     activeMembers: this.activeMembers,
//     tags: this.tags,
//     isActive: this.isActive,
//     lastActivityAt: this.lastActivityAt,
//     createdAt: this.createdAt,
//   };
// };

// // ============== Static Methods ==============

// // Find room by name
// roomSchema.statics.findByName = function (name) {
//   return this.findOne({ name: name.toLowerCase(), isActive: true });
// };

// // Find room with password
// roomSchema.statics.findByIdWithPassword = function (roomId) {
//   return this.findById(roomId).select('+password');
// };

// // Find rooms by creator
// roomSchema.statics.findByCreator = function (creatorId) {
//   return this.find({ creator: creatorId, isActive: true });
// };

// // Count rooms by creator
// roomSchema.statics.countByCreator = function (creatorId) {
//   return this.countDocuments({ creator: creatorId, isActive: true });
// };

// // Find nearby rooms using aggregation pipeline
// roomSchema.statics.findNearby = function (coordinates, radiusMeters, options = {}) {
//   const { skip = 0, limit = 20, excludePrivate = false } = options;

//   const matchStage = {
//     isActive: true,
//   };

//   if (excludePrivate) {
//     matchStage.isPrivate = false;
//   }

//   return this.aggregate([
//     {
//       $geoNear: {
//         near: {
//           type: 'Point',
//           coordinates: coordinates,
//         },
//         distanceField: 'distance',
//         maxDistance: radiusMeters,
//         spherical: true,
//         query: matchStage,
//       },
//     },
//     {
//       $lookup: {
//         from: 'users',
//         localField: 'creator',
//         foreignField: '_id',
//         as: 'creatorInfo',
//         pipeline: [
//           {
//             $project: {
//               _id: 1,
//               username: 1,
//             },
//           },
//         ],
//       },
//     },
//     {
//       $unwind: {
//         path: '$creatorInfo',
//         preserveNullAndEmptyArrays: true,
//       },
//     },
//     {
//       $project: {
//         _id: 1,
//         name: 1,
//         description: 1,
//         creator: '$creatorInfo',
//         isPrivate: 1,
//         hasPassword: '$isPrivate',
//         activeMembers: 1,
//         tags: 1,
//         distance: { $round: ['$distance', 0] }, // Distance in meters
//         lastActivityAt: 1,
//         createdAt: 1,
//       },
//     },
//     {
//       $sort: { distance: 1, activeMembers: -1 },
//     },
//     {
//       $skip: skip,
//     },
//     {
//       $limit: limit,
//     },
//   ]);
// };

// // Find empty rooms older than specified time
// roomSchema.statics.findEmptyRoomsForCleanup = function (emptyDuration) {
//   const cutoffDate = new Date(Date.now() - emptyDuration);

//   return this.find({
//     activeMembers: 0,
//     emptyAt: { $lt: cutoffDate },
//     isActive: true,
//   });
// };

// const Room = mongoose.model('Room', roomSchema);

// export default Room;

// src/models/room.model.js (COMPLETE FIXED VERSION)

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROOM_CONSTRAINTS } from '../utils/constants.js';

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      unique: true,
      trim: true,
      minlength: [ROOM_CONSTRAINTS.MIN_ROOM_NAME_LENGTH, `Room name must be at least ${ROOM_CONSTRAINTS.MIN_ROOM_NAME_LENGTH} characters`],
      maxlength: [ROOM_CONSTRAINTS.MAX_ROOM_NAME_LENGTH, `Room name cannot exceed ${ROOM_CONSTRAINTS.MAX_ROOM_NAME_LENGTH} characters`],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Room creator is required'],
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: [true, 'Room location is required'],
        validate: {
          validator: function (coords) {
            if (!coords || coords.length !== 2) return false;
            const [lng, lat] = coords;
            return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
          },
          message: 'Invalid coordinates',
        },
      },
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },

    password: {
      type: String,
      select: false,
    },

    activeMembers: {
      type: Number,
      default: 0,
      min: 0,
    },

    emptyAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          return tags.length <= 5;
        },
        message: 'Maximum 5 tags allowed',
      },
    },

    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============== INDEXES (FIXED - Only ONE 2dsphere) ==============

// Primary geospatial index - ONLY ONE
roomSchema.index(
  { location: '2dsphere' },
  { name: 'location_geo_index' }
);

// Other non-geo indexes
roomSchema.index({ isActive: 1 });
roomSchema.index({ creator: 1 });
roomSchema.index({ activeMembers: -1 });
roomSchema.index({ emptyAt: 1 });
roomSchema.index({ createdAt: -1 });

// ============== Virtuals ==============

roomSchema.virtual('isEmpty').get(function () {
  return this.activeMembers === 0;
});

roomSchema.virtual('hasPassword').get(function () {
  return this.isPrivate;
});

// ============== Pre-save Middleware ==============

roomSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

roomSchema.pre('save', function (next) {
  if (this.isModified('activeMembers')) {
    if (this.activeMembers === 0 && !this.emptyAt) {
      this.emptyAt = new Date();
    } else if (this.activeMembers > 0) {
      this.emptyAt = null;
    }
  }
  next();
});

// ============== Instance Methods ==============

roomSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return true;
  return await bcrypt.compare(candidatePassword, this.password);
};

roomSchema.methods.memberJoined = async function () {
  this.activeMembers += 1;
  this.emptyAt = null;
  this.lastActivityAt = new Date();
  return await this.save({ validateBeforeSave: false });
};

roomSchema.methods.memberLeft = async function () {
  this.activeMembers = Math.max(0, this.activeMembers - 1);
  if (this.activeMembers === 0) {
    this.emptyAt = new Date();
  }
  this.lastActivityAt = new Date();
  return await this.save({ validateBeforeSave: false });
};

roomSchema.methods.updateActivity = async function () {
  this.lastActivityAt = new Date();
  return await this.save({ validateBeforeSave: false });
};

roomSchema.methods.toPublicRoom = function () {
  return {
    _id: this._id,
    name: this.name,
    description: this.description,
    creator: this.creator,
    location: this.location,
    isPrivate: this.isPrivate,
    hasPassword: this.isPrivate,
    activeMembers: this.activeMembers,
    tags: this.tags,
    isActive: this.isActive,
    lastActivityAt: this.lastActivityAt,
    createdAt: this.createdAt,
  };
};

// ============== Static Methods ==============

roomSchema.statics.findByName = function (name) {
  return this.findOne({ name: name.toLowerCase(), isActive: true });
};

roomSchema.statics.findByIdWithPassword = function (roomId) {
  return this.findById(roomId).select('+password');
};

roomSchema.statics.findByCreator = function (creatorId) {
  return this.find({ creator: creatorId, isActive: true });
};

roomSchema.statics.countByCreator = function (creatorId) {
  return this.countDocuments({ creator: creatorId, isActive: true });
};

// ============== FIXED: findNearby with key specification ==============

roomSchema.statics.findNearby = function (coordinates, radiusMeters, options = {}) {
  const { skip = 0, limit = 20, excludePrivate = false } = options;

  const matchStage = {
    isActive: true,
  };

  if (excludePrivate) {
    matchStage.isPrivate = false;
  }

  return this.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: coordinates,
        },
        distanceField: 'distance',
        maxDistance: radiusMeters,
        spherical: true,
        query: matchStage,
        key: 'location', // ✅ FIXED: Specify the field with 2dsphere index
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'creator',
        foreignField: '_id',
        as: 'creatorInfo',
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$creatorInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        creator: '$creatorInfo',
        isPrivate: 1,
        hasPassword: '$isPrivate',
        activeMembers: 1,
        tags: 1,
        distance: { $round: ['$distance', 0] },
        lastActivityAt: 1,
        createdAt: 1,
      },
    },
    {
      $sort: { distance: 1, activeMembers: -1 },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);
};

roomSchema.statics.findEmptyRoomsForCleanup = function (emptyDuration) {
  const cutoffDate = new Date(Date.now() - emptyDuration);

  return this.find({
    activeMembers: 0,
    emptyAt: { $lt: cutoffDate },
    isActive: true,
  });
};

const Room = mongoose.model('Room', roomSchema);

export default Room;