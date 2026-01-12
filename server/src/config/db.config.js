import mongoose from 'mongoose';
import envConfig from './env.config.js';

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(envConfig.mongoUri, {
      dbName: 'chugli',
    });

    console.log(`\n✅ MongoDB Connected Successfully!`);
    console.log(`📍 Host: ${connectionInstance.connection.host}`);
    console.log(`📂 Database: ${connectionInstance.connection.name}`);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected successfully!');
    });

    return connectionInstance;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
