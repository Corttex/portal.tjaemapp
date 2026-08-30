require('dotenv').config();
const { initDatabase, pool } = require('../config/database');
const logger = require('../utils/logger');

async function run() {
  console.log('--- Inicializando Banco de Dados PostgreSQL TJAEM ---');
  try {
    const success = await initDatabase();
    if (success) {
      console.log('✅ Schema PostgreSQL aplicado com sucesso!');
    } else {
      console.log('⚠️ Falha ao aplicar schema. Verifique se o PostgreSQL está rodando.');
    }
  } catch (error) {
    console.error('❌ Erro na inicialização do PostgreSQL:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

run();
