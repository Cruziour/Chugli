import cron from 'node-cron';
import User from '../models/user.model.js';
import Room from '../models/room.model.js';
import envConfig from '../config/env.config.js';

class GhostScheduler {
  constructor() {
    this.jobs = [];
    this.io = null; // Socket.io instance
  }

  /**
   * Set Socket.io instance for room notifications
   */
  setSocketIO(io) {
    this.io = io;
  }

  /**
   * Initialize all scheduled jobs
   */
  init() {
    console.log('👻 Ghost Protocol initializing...');

    this.scheduleUnverifiedUserCleanup();
    this.scheduleInactiveUserCleanup();
    this.scheduleEmptyRoomCleanup();
    this.scheduleHealthCheck();

    console.log('✅ Ghost Protocol active - All schedulers running');
  }

  /**
   * Cleanup unverified users (every 30 minutes)
   * Users who haven't verified email within 2 hours are deleted
   */
  scheduleUnverifiedUserCleanup() {
    const job = cron.schedule('*/30 * * * *', async () => {
      try {
        console.log('🧹 [Ghost] Running unverified user cleanup...');

        const expiryTime = envConfig.cleanup.unverifiedUserTTL; // 2 hours
        const cutoffDate = new Date(Date.now() - expiryTime);

        const result = await User.deleteMany({
          isVerified: false,
          createdAt: { $lt: cutoffDate },
        });

        if (result.deletedCount > 0) {
          console.log(`🗑️ [Ghost] Deleted ${result.deletedCount} unverified users`);
        } else {
          console.log('✨ [Ghost] No unverified users to cleanup');
        }
      } catch (error) {
        console.error('❌ [Ghost] Unverified user cleanup error:', error.message);
      }
    });

    this.jobs.push(job);
    console.log('📅 Scheduled: Unverified user cleanup (every 30 min)');
  }

  /**
   * Cleanup inactive users (daily at midnight)
   * Users inactive for more than 2 days are deleted
   */
  scheduleInactiveUserCleanup() {
    const job = cron.schedule('0 0 * * *', async () => {
      try {
        console.log('🧹 [Ghost] Running inactive user cleanup...');

        const inactiveDays = envConfig.cleanup.inactiveUserDays; // 2 days
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

        // Delete users who crossed the threshold
        const result = await User.deleteMany({
          lastActiveAt: { $lt: cutoffDate },
          isVerified: true,
        });

        if (result.deletedCount > 0) {
          console.log(`🗑️ [Ghost] Deleted ${result.deletedCount} inactive users`);
        } else {
          console.log('✨ [Ghost] No inactive users to cleanup');
        }
      } catch (error) {
        console.error('❌ [Ghost] Inactive user cleanup error:', error.message);
      }
    });

    this.jobs.push(job);
    console.log('📅 Scheduled: Inactive user cleanup (daily at midnight)');
  }

  /**
   * Cleanup empty rooms (every 10 minutes)
   * Rooms empty for more than 30 minutes are deleted
   */
  scheduleEmptyRoomCleanup() {
    const job = cron.schedule('*/10 * * * *', async () => {
      try {
        console.log('🧹 [Ghost] Running empty room cleanup...');

        const emptyDuration = envConfig.cleanup.emptyRoomTTL; // 30 minutes
        const cutoffDate = new Date(Date.now() - emptyDuration);

        // Find empty rooms
        const emptyRooms = await Room.find({
          activeMembers: 0,
          emptyAt: { $lt: cutoffDate },
          isActive: true,
        });

        if (emptyRooms.length === 0) {
          console.log('✨ [Ghost] No empty rooms to cleanup');
          return;
        }

        // Process each room
        for (const room of emptyRooms) {
          // Notify connected clients if socket.io is available
          if (this.io) {
            this.io.to(room._id.toString()).emit('room_deleted', {
              roomId: room._id,
              roomName: room.name,
              message: 'Room has been deleted due to inactivity',
            });

            // Force all sockets to leave
            this.io.in(room._id.toString()).socketsLeave(room._id.toString());
          }

          // Decrement creator's room count
          await User.findByIdAndUpdate(room.creator, {
            $inc: { roomsCreated: -1 },
          });

          // Soft delete the room
          room.isActive = false;
          await room.save();

          console.log(`🗑️ [Ghost] Deleted empty room: ${room.name}`);
        }

        console.log(`🗑️ [Ghost] Cleaned up ${emptyRooms.length} empty rooms`);
      } catch (error) {
        console.error('❌ [Ghost] Empty room cleanup error:', error.message);
      }
    });

    this.jobs.push(job);
    console.log('📅 Scheduled: Empty room cleanup (every 10 min)');
  }

  /**
   * Health check ping (every 30 minutes)
   * Keeps server active on platforms like Render
   */
  scheduleHealthCheck() {
    const job = cron.schedule('*/30 * * * *', async () => {
      try {
        const timestamp = new Date().toISOString();
        console.log(`💓 [Ghost] Health check ping at ${timestamp}`);

        // Self-ping if deployed URL is available
        if (process.env.DEPLOYED_URL) {
          const response = await fetch(`${process.env.DEPLOYED_URL}/health`);
          if (response.ok) {
            console.log('✅ [Ghost] Self-ping successful');
          }
        }
      } catch (error) {
        console.error('❌ [Ghost] Health check error:', error.message);
      }
    });

    this.jobs.push(job);
    console.log('📅 Scheduled: Health check ping (every 30 min)');
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      totalJobs: this.jobs.length,
      socketConnected: !!this.io,
      jobs: [
        { name: 'Unverified User Cleanup', interval: '30 min' },
        { name: 'Inactive User Cleanup', interval: 'Daily midnight' },
        { name: 'Empty Room Cleanup', interval: '10 min' },
        { name: 'Health Check', interval: '30 min' },
      ],
    };
  }

  /**
   * Stop all jobs
   */
  stopAll() {
    this.jobs.forEach((job) => job.stop());
    console.log('🛑 [Ghost] All schedulers stopped');
  }

  /**
   * Manual cleanup trigger (for testing)
   */
  async manualCleanup() {
    console.log('🧹 [Ghost] Manual cleanup triggered...');

    const results = {
      unverifiedUsers: 0,
      inactiveUsers: 0,
      emptyRooms: 0,
    };

    // Unverified users
    const unverifiedCutoff = new Date(Date.now() - envConfig.cleanup.unverifiedUserTTL);
    const unverifiedResult = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: unverifiedCutoff },
    });
    results.unverifiedUsers = unverifiedResult.deletedCount;

    // Empty rooms
    const roomCutoff = new Date(Date.now() - envConfig.cleanup.emptyRoomTTL);
    const emptyRooms = await Room.find({
      activeMembers: 0,
      emptyAt: { $lt: roomCutoff },
      isActive: true,
    });

    for (const room of emptyRooms) {
      room.isActive = false;
      await room.save();
      await User.findByIdAndUpdate(room.creator, {
        $inc: { roomsCreated: -1 },
      });
    }
    results.emptyRooms = emptyRooms.length;

    return results;
  }
}

const ghostScheduler = new GhostScheduler();
export default ghostScheduler;
