import jwt from 'jsonwebtoken';
import envConfig from '../config/env.config.js';
import ApiError from '../utils/ApiError.js';

class TokenService {
  constructor() {
    this.accessSecret = envConfig.jwt.accessSecret;
    this.refreshSecret = envConfig.jwt.refreshSecret;
    this.accessExpiry = envConfig.jwt.accessExpiry;
    this.refreshExpiry = envConfig.jwt.refreshExpiry;
  }

  /**
   * Generate Access Token
   * Short-lived token for API authentication
   */
  generateAccessToken(payload) {
    return jwt.sign(
      {
        _id: payload._id,
        email: payload.email,
        username: payload.username,
        type: 'access',
      },
      this.accessSecret,
      { expiresIn: this.accessExpiry }
    );
  }

  /**
   * Generate Refresh Token
   * Long-lived token for silent refresh
   */
  generateRefreshToken(payload) {
    return jwt.sign(
      {
        _id: payload._id,
        type: 'refresh',
      },
      this.refreshSecret,
      { expiresIn: this.refreshExpiry }
    );
  }

  /**
   * Generate both tokens
   */
  generateTokenPair(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiry: this.getExpiryTime(this.accessExpiry),
      refreshTokenExpiry: this.getExpiryTime(this.refreshExpiry),
    };
  }

  /**
   * Verify Access Token
   */
  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, this.accessSecret);

      if (decoded.type !== 'access') {
        throw ApiError.unauthorized('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Access token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw ApiError.unauthorized('Invalid access token');
      }
      throw error;
    }
  }

  /**
   * Verify Refresh Token
   */
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.refreshSecret);

      if (decoded.type !== 'refresh') {
        throw ApiError.unauthorized('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Refresh token expired. Please login again.');
      }
      if (error.name === 'JsonWebTokenError') {
        throw ApiError.unauthorized('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token) {
    return jwt.decode(token);
  }

  /**
   * Get token expiry time in milliseconds
   */
  getExpiryTime(expiry) {
    const units = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 2 * 60 * 60 * 1000; // Default 2 hours
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  }

  /**
   * Check if token is about to expire (within 5 minutes)
   */
  isTokenExpiringSoon(token, thresholdMinutes = 5) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;

      const expiryTime = decoded.exp * 1000;
      const threshold = thresholdMinutes * 60 * 1000;

      return expiryTime - Date.now() < threshold;
    } catch {
      return true;
    }
  }
}

const tokenService = new TokenService();
export default tokenService;
