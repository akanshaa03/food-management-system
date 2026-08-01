const { Pool } = require('pg');
const config = require('./env');
const logger = require('../utils/logger');

/**
 * PostgreSQL Database Pool Connection Manager
 */
const poolConfig = config.databaseUrl
  ? { connectionString: config.databaseUrl, max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000 }
  : {
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      user: config.db.user,
      password: config.db.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  logger.info('Connected to PostgreSQL Database Pool');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
