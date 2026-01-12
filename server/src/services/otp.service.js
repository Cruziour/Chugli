import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import envConfig from '../config/env.config.js';
import { OTP_CONFIG } from '../utils/constants.js';

/**
 * Zero-Storage OTP Service
 * Uses HMAC to generate and verify OTPs without storing them in database
 *
 * How it works:
 * 1. Generate OTP using HMAC(secret, email + timestamp + purpose)
 * 2. Send OTP to user's email
 * 3. When user submits OTP, regenerate hash and compare
 * 4. Time window ensures OTP expires after configured time
 */

class OTPService {
  constructor() {
    this.secret = envConfig.otpSecret;
    this.expiryMinutes = OTP_CONFIG.EXPIRY_MINUTES;
    this.otpLength = OTP_CONFIG.LENGTH;
  }

  /**
   * Generate time-based window for OTP validity
   * Rounds down to nearest expiry interval
   */
  getTimeWindow() {
    const now = Date.now();
    const windowMs = this.expiryMinutes * 60 * 1000;
    return Math.floor(now / windowMs);
  }

  /**
   * Generate HMAC-based OTP
   * @param {string} email - User's email
   * @param {string} purpose - Purpose of OTP (verify, reset, etc.)
   * @param {number} timeWindow - Optional time window override
   */
  generateOTP(email, purpose = 'verify', timeWindow = null) {
    const window = timeWindow || this.getTimeWindow();
    const data = `${email.toLowerCase()}:${purpose}:${window}`;

    // Create HMAC
    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(data);
    const hash = hmac.digest('hex');

    // Extract numeric OTP from hash
    const numericHash = hash.replace(/[^0-9]/g, '');
    const otp = numericHash.substring(0, this.otpLength).padStart(this.otpLength, '0');

    return otp;
  }

  /**
   * Verify OTP
   * Checks current and previous time window to handle edge cases
   * @param {string} email - User's email
   * @param {string} otp - OTP to verify
   * @param {string} purpose - Purpose of OTP
   */
  verifyOTP(email, otp, purpose = 'verify') {
    const currentWindow = this.getTimeWindow();

    // Check current time window
    const currentOTP = this.generateOTP(email, purpose, currentWindow);
    if (this.secureCompare(otp, currentOTP)) {
      return { valid: true, message: 'OTP verified successfully' };
    }

    // Check previous time window (grace period)
    const previousOTP = this.generateOTP(email, purpose, currentWindow - 1);
    if (this.secureCompare(otp, previousOTP)) {
      return { valid: true, message: 'OTP verified successfully' };
    }

    return { valid: false, message: 'Invalid or expired OTP' };
  }

  /**
   * Secure string comparison to prevent timing attacks
   */
  secureCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Generate hashed OTP for additional security
   * Can be used for storing OTP hash temporarily if needed
   */
  hashOTP(otp) {
    return CryptoJS.SHA256(otp + this.secret).toString();
  }

  /**
   * Get OTP expiry time in human-readable format
   */
  getExpiryTime() {
    return `${this.expiryMinutes} minutes`;
  }

  /**
   * Get remaining validity time for current OTP
   */
  getRemainingTime() {
    const windowMs = this.expiryMinutes * 60 * 1000;
    const currentWindowStart = this.getTimeWindow() * windowMs;
    const windowEnd = currentWindowStart + windowMs;
    const remaining = windowEnd - Date.now();

    return Math.max(0, Math.floor(remaining / 1000)); // seconds
  }
}

// Export singleton instance
const otpService = new OTPService();
export default otpService;
