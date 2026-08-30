const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const { securityHeaders, blockRawHtmlAccess, blockScanners } = require('./middlewares/security.middleware');
const { protectViewRoutes } = require('./middlewares/viewAuth.middleware');
const viewController = require('./controllers/view.controller');
const apiRoutes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// ── CORS — apenas origens conhecidas ─────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'https://portal.tjaembrasil.com.br',
  'https://tjaembrasil.com.br',
];
app.use(cors({
  origin: (origin, cb) => {
    // Permite requisições sem origin (Postman, curl legítimo) apenas em dev
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return cb(null, true);
    }
    cb(new Error('CORS: Origem não permitida'));
  },
  credentials: true, // Necessário para cookies
  optionsSuccessStatus: 200
}));

// ── Parsers ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser()); // Necessário para ler cookies HttpOnly

// ── Segurança — aplicada em TODAS as requisições ──────────────────────────────
app.use(blockScanners);           // Bloqueia user-agents maliciosos
app.use(securityHeaders);         // Headers de segurança + Rate Limiting
app.use(blockRawHtmlAccess);      // Bloqueia .html, .env, .json direto

// ── Logger de requisições ─────────────────────────────────────────────────────
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} | IP: ${req.ip}`);
  next();
});

// ── API Routes (não protegidas por session — têm JWT próprio) ─────────────────
app.use('/api/v1', apiRoutes);

// ── Proteção de Views — verifica sessão antes de servir páginas ───────────────
app.use(protectViewRoutes);

// ── Rotas Públicas (não exigem sessão) ────────────────────────────────────────
app.get('/', viewController.renderDashboard);
app.get('/recadastramento', viewController.renderRecadastramento);
app.get('/credencial/:id', viewController.renderCredencial);
app.get('/associados', viewController.renderAssociadosList);

// ── Rotas Protegidas (exigem sessão + isAdmin) ────────────────────────────────
app.use('/master', viewController.renderMasterAdmin);
app.use('/automation', viewController.renderAutomationStudio);

// ── Assets estáticos — somente JS, CSS, fontes e imagens ─────────────────────
// index: false → nunca serve diretório; extensions: [] → só arquivos com extensão explícita
app.use(express.static(config.rootBuildPath, {
  index: false,
  extensions: [],
  // Não incluir cache de longa duração para assets de segurança
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

// ── Fallback / 404 ────────────────────────────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint não encontrado.' });
  }
  res.redirect('/');
});

// ── Handler global de erros ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`[ERROR] ${err.message} | ${req.method} ${req.url}`);
  if (req.path.startsWith('/api')) {
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
  res.redirect('/');
});

module.exports = app;
