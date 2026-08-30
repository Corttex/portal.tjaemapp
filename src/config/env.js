require('dotenv').config();
const path = require('path');

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'tjaem-super-secret-key-change-in-prod-2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'tjaem-refresh-secret-key-2026',
  jwtExpiresIn: '15m', // Short expiration as in Photo 4
  jwtRefreshExpiresIn: '7d',
  rootBuildPath: path.join(__dirname, '../../app_build')
};
