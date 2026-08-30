const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');

const SESSION_COOKIE = 'tjaem_sid';

/**
 * Bloqueia acesso direto a arquivos HTML brutos e
 * qualquer arquivo que não deveria ser servido via HTTP direto.
 */
const blockRawHtmlAccess = (req, res, next) => {
  // Bloqueia .html direto (exceto nunca servimos — express.static tem index:false)
  if (req.path.match(/\.html?$/i)) {
    logger.warn(`[SECURITY] Acesso direto bloqueado: ${req.path} | IP: ${req.ip}`);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Acesso negado.'
    });
  }
  // Bloqueia arquivos de configuração / sensíveis
  if (req.path.match(/\.(env|json|config|yml|yaml|lock|log|bak|sql|map|ts)$/i)) {
    logger.warn(`[SECURITY] Arquivo sensível bloqueado: ${req.path} | IP: ${req.ip}`);
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

/**
 * Verifica se há sessão JWT válida.
 * Retorna { valid: bool, user: object|null }
 */
const verifySession = (req) => {
  const token = req.cookies?.[SESSION_COOKIE]
    || req.headers['authorization']?.replace('Bearer ', '');

  if (!token) return { valid: false, user: null };

  try {
    const user = jwt.verify(token, config.jwtSecret);
    return { valid: true, user };
  } catch {
    return { valid: false, user: null };
  }
};

/**
 * Protege rotas de VIEW (páginas HTML) contra acesso sem autenticação.
 * Rotas públicas (/, /credencial/:id, /associados, /recadastramento) passam direto.
 * Rotas admin (/master, /automation) exigem isAdmin.
 */
const protectViewRoutes = (req, res, next) => {
  const path = req.path || req.url;

  // Rotas sempre públicas — não exigem autenticação
  const PUBLIC_PATTERNS = [
    /^\/$/, // login / home
    /^\/credencial\//,
    /^\/associados/,
    /^\/recadastramento/,
    /^\/api\//,
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|webp)$/
  ];
  if (PUBLIC_PATTERNS.some(p => p.test(path))) return next();

  // Para rotas protegidas, valida sessão
  const { valid, user } = verifySession(req);

  if (!valid) {
    logger.warn(`[AUTH] Acesso negado (sem sessão): ${path} | IP: ${req.ip}`);
    return res.redirect(`/?redirect=${encodeURIComponent(path)}&session=expired`);
  }

  // Rotas de administração exigem isAdmin
  const ADMIN_PATTERNS = [/^\/master/, /^\/automation/];
  if (ADMIN_PATTERNS.some(p => p.test(path)) && !user.isAdmin) {
    logger.warn(`[AUTH] Acesso admin negado: ${user.cpf} tentou ${path}`);
    return res.redirect('/');
  }

  req.user = user;
  next();
};

module.exports = { blockRawHtmlAccess, protectViewRoutes, verifySession };
