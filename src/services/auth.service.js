const jwt = require('jsonwebtoken');
const config = require('../config/env');

// In-memory refresh token store (In production, stored in Redis/PostgreSQL)
const refreshTokensStore = new Set();

class AuthService {
  static generateTokens(payload) {
    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn // Short lived (15m)
    });

    const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: config.jwtRefreshExpiresIn // Longer (7d)
    });

    refreshTokensStore.add(refreshToken);

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwtExpiresIn
    };
  }

  static refreshAccessToken(refreshToken) {
    if (!refreshToken || !refreshTokensStore.has(refreshToken)) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
      
      // Token Rotation: Invalidate old refresh token, issue a new pair
      refreshTokensStore.delete(refreshToken);

      const payload = { id: decoded.id, email: decoded.email, role: decoded.role };
      return this.generateTokens(payload);
    } catch (err) {
      refreshTokensStore.delete(refreshToken);
      throw new Error('EXPIRED_REFRESH_TOKEN');
    }
  }

  static revokeRefreshToken(refreshToken) {
    refreshTokensStore.delete(refreshToken);
  }
}

module.exports = AuthService;
