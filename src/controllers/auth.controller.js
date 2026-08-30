const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');
const { setSessionCookie, destroySession } = require('../middlewares/session.middleware');

// ── Credenciais do Webmaster Admin (hash em prod — bcrypt) ────────────────────
// CPF: 01250190177 | Senha: 807522
// Em produção substituir por consulta ao banco com bcrypt.compare()
const ADMIN_CREDENTIALS = {
  cpf: '01250190177',
  passwordHash: '807522', // ATENÇÃO: em prod usar bcrypt hash
  id: 'usr_admin_001',
  nome: 'Administrador TJAEM',
  role: 'WEBMASTER ADMIN',
  isAdmin: true,
};

// Simples delay para evitar timing attacks
const secureDelay = () => new Promise(r => setTimeout(r, 400 + Math.random() * 300));

// ── LOGIN ─────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  // Aceita CPF (interface principal) ou email (compatibilidade legado)
  const { cpf, email, password } = req.body;
  const identifier = (cpf || email || '').replace(/\D/g, '').trim();

  if (!identifier || !password) {
    await secureDelay();
    return res.status(400).json({ success: false, message: 'Credenciais incompletas.' });
  }

  // Delay constante para evitar timing oracle (mesmo em erro)
  await secureDelay();

  // Valida credenciais — em produção: bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash)
  const cpfMatch      = identifier === ADMIN_CREDENTIALS.cpf;
  const passwordMatch = String(password) === ADMIN_CREDENTIALS.passwordHash;

  if (!cpfMatch || !passwordMatch) {
    logger.warn(`[AUTH] Login inválido: identifier=${identifier} | IP: ${req.ip}`);
    // Mensagem genérica — não revela qual campo falhou
    return res.status(401).json({ success: false, message: 'CPF ou senha incorretos.' });
  }

  // Payload JWT — NÃO inclui senha nem dados sensíveis
  const payload = {
    id:      ADMIN_CREDENTIALS.id,
    cpf:     ADMIN_CREDENTIALS.cpf,
    nome:    ADMIN_CREDENTIALS.nome,
    role:    ADMIN_CREDENTIALS.role,
    isAdmin: ADMIN_CREDENTIALS.isAdmin,
  };

  // Emite cookie HttpOnly — JS do cliente NUNCA acessa
  setSessionCookie(res, payload);

  logger.info(`[AUTH] Login bem-sucedido: ${ADMIN_CREDENTIALS.nome} | IP: ${req.ip}`);

  // Retorna apenas dados públicos — token fica no cookie, invisível ao JS
  return res.json({
    success: true,
    user: {
      nome:    ADMIN_CREDENTIALS.nome,
      role:    ADMIN_CREDENTIALS.role,
      isAdmin: ADMIN_CREDENTIALS.isAdmin,
    }
  });
};

// ── LOGOUT ────────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  destroySession(res);
  logger.info(`[AUTH] Logout | IP: ${req.ip}`);
  return res.json({ success: true, message: 'Sessão encerrada.' });
};

// ── REFRESH (mantido para compatibilidade futura) ─────────────────────────────
const refresh = async (req, res) => {
  // Com cookies HttpOnly, o refresh é automático no session.middleware
  // Este endpoint pode ser usado para verificar se sessão ainda é válida
  return res.json({ success: true, message: 'Use GET /me para verificar sessão.' });
};

// ── ME (verifica sessão atual) ────────────────────────────────────────────────
const getMe = async (req, res) => {
  // req.user foi populado pelo protectViewRoutes ou requireAuth
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Não autenticado.' });
  }
  return res.json({
    success: true,
    user: {
      nome:    req.user.nome,
      role:    req.user.role,
      isAdmin: req.user.isAdmin,
    }
  });
};

module.exports = { login, logout, refresh, getMe };
