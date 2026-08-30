const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const connectionString = process.env.DATABASE_URL || 
  `postgres://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'tjaem_db'}`;

const poolConfig = {
  connectionString,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

const pool = new Pool(poolConfig);

let isPgConnected = false;

pool.on('connect', () => {
  if (!isPgConnected) {
    isPgConnected = true;
    logger.info('[PG] Conexão com PostgreSQL estabelecida com sucesso.');
  }
});

pool.on('error', (err) => {
  logger.error(`[PG] Erro inesperado na pool do PostgreSQL: ${err.message}`);
  isPgConnected = false;
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info(`[PG QUERY] Executado em ${duration}ms | Linhas: ${res.rowCount}`);
    return res;
  } catch (err) {
    logger.error(`[PG QUERY ERROR] ${err.message} | Query: ${text}`);
    throw err;
  }
};

const initDatabase = async () => {
  try {
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(sql);
      logger.info('[PG INIT] Tabelas e Índices verificados/criados com sucesso no PostgreSQL.');
      isPgConnected = true;
      return true;
    }
  } catch (err) {
    logger.warn(`[PG INIT WARN] Não foi possível inicializar schema no PostgreSQL: ${err.message}. Operando em modo de resiliência.`);
    isPgConnected = false;
    return false;
  }
};

module.exports = {
  pool,
  query,
  initDatabase,
  isPgConnected: () => isPgConnected
};
