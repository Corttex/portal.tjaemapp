const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Acesso não autorizado. Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn(`Falha na validação do JWT: ${error.message}`);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, code: 'TOKEN_EXPIRED', message: 'Token expirado. Utilize o refresh token.' });
    }
    return res.status(403).json({ success: false, message: 'Token inválido ou alterado.' });
  }
};

module.exports = { authenticateJWT };
