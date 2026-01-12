import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envConfig = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  // MongoDB
  mongoUri: process.env.MONGODB_URI,

  // JWT
  jwt: {
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || '2h',
    refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || '1d',
  },

  // OTP
  otpSecret: process.env.OTP_SECRET,

  // EMAIL relay service
  emailApiKey: process.env.EMAIL_SERVICE_API_KEY,
  emailApiUrl: process.env.EMAIL_SERVICE_API_URL,

  // Email
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM,
  },

  // Client
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // Cleanup Timings
  cleanup: {
    unverifiedUserTTL: parseInt(process.env.UNVERIFIED_USER_TTL, 10) || 7200000, // 2 hours
    inactiveUserDays: parseInt(process.env.INACTIVE_USER_DAYS, 10) || 2,
    emptyRoomTTL: parseInt(process.env.EMPTY_ROOM_TTL, 10) || 1800000, // 30 mins
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL, 10) || 1800000,
  },
};

// Validate required env variables
const requiredEnvVars = [
  'MONGODB_URI',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'OTP_SECRET',
  'SMTP_USER',
  'SMTP_PASS',
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
}

export default envConfig;
