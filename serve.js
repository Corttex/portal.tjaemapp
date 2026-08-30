/**
 * TJAEM Enterprise Server v2.0
 * Architecture: Clean Express Architecture (MVC / Services / Middlewares / JWT Auth / PostgreSQL)
 */
const app = require('./src/app');
const config = require('./src/config/env');
const logger = require('./src/utils/logger');
const { initDatabase } = require('./src/config/database');

const PORT = config.port;

app.listen(PORT, async () => {
  logger.info(`==================================================`);
  logger.info(`🚀 TJAEM Enterprise Host Online em http://localhost:${PORT}`);
  logger.info(`   ├── Dashboard   → http://localhost:${PORT}/`);
  logger.info(`   ├── Master      → http://localhost:${PORT}/master/`);
  logger.info(`   ├── Automation  → http://localhost:${PORT}/automation/`);
  logger.info(`   └── API Auth    → http://localhost:${PORT}/api/v1/auth/login`);
  logger.info(`   └── API Health  → http://localhost:${PORT}/api/v1/health`);
  logger.info(`==================================================`);

  // Inicializa PostgreSQL se as credenciais estiverem ativas
  try {
    await initDatabase();
  } catch (err) {
    logger.warn(`[POSTGRES] Inicialização assíncrona do banco em segundo plano: ${err.message}`);
  }
});
