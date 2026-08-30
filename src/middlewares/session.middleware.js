const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * TJAEM — Middleware de Autenticação de Sessão
 *
 * Valida o token JWT salvo no cookie de sessão.
 * Rotas protegidas retornam 401/302 se não autenticado.
 */

const SESSION_COOKIE = 'tjaem_sid';

// ── Extrair token de múltiplas origens ────────────────────────────────────────
function extractToken(req) {
  // 1. Cookie de sessão (principal)
  if (req.cookies && req.cookies[SESSION_COOKIE]) {
    return req.cookies[SESSION_COOKIE];
  }
  // 2. Header Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  // 3. Corpo da requisição (para APIs)
  if (req.body && req.body.token) {
    return req.body.token;
  }
  return null;
}

// ── Middleware principal — exige autenticação ─────────────────────────────────
const requireAuth = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    logger.warn(`[AUTH] Acesso não autenticado bloqueado: ${req.method} ${req.originalUrl} | IP: ${req.ip}`);
    // Se a rota é de view (página HTML), redireciona para login
    if (!req.path.startsWith('/api')) {
      return res.redirect(`/?redirect=${encodeURIComponent(req.originalUrl)}`);
    }
    return res.status(401).json({ success: false, error: 'Autenticação necessária' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;

    // Renovar token automaticamente se estiver próximo do vencimento (< 3 min)
    const timeLeft = decoded.exp - Math.floor(Date.now() / 1000);
    if (timeLeft < 180) {
      const newToken = jwt.sign(
        { id: decoded.id, cpf: decoded.cpf, nome: decoded.nome, role: decoded.role, isAdmin: decoded.isAdmin },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );
      res.cookie(SESSION_COOKIE, newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
      });
    }

    next();
  } catch (err) {
    logger.warn(`[AUTH] Token inválido/expirado: ${err.message} | IP: ${req.ip}`);
    // Limpa cookie corrompido
    res.clearCookie(SESSION_COOKIE);
    if (!req.path.startsWith('/api')) {
      return res.redirect('/?session=expired');
    }
    return res.status(401).json({ success: false, error: 'Sessão expirada. Faça login novamente.' });
  }
};

// ── Middleware — exige papel de ADMIN ─────────────────────────────────────────
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    logger.warn(`[AUTH] Acesso admin negado para: ${req.user?.cpf || 'anon'} | Rota: ${req.originalUrl}`);
    if (!req.path.startsWith('/api')) {
      return res.redirect('/');
    }
    return res.status(403).json({ success: false, error: 'Permissão insuficiente' });
  }
  next();
};

// ── Emitir cookie de sessão (chamado no login bem-sucedido) ───────────────────
const setSessionCookie = (res, payload) => {
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,           // JS do cliente NUNCA acessa
    secure: process.env.NODE_ENV === 'production', // HTTPS only em prod
    sameSite: 'strict',       // Bloqueia CSRF
    maxAge: 15 * 60 * 1000   // 15 minutos (igual ao jwtExpiresIn)
  });
  return token;
};

// ── Destruir sessão (logout) ──────────────────────────────────────────────────
const destroySession = (res) => {
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: 'strict' });
};

module.exports = { requireAuth, requireAdmin, setSessionCookie, destroySession, SESSION_COOKIE };
