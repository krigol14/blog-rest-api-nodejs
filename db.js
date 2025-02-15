import pkg from 'pg';
import signale from 'signale';

const { Pool } = pkg;

const pool = new Pool({
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
});

(async () => {
  try {
    const client = await pool.connect();
    signale.info('Connected to PostgreSQL');
    client.release();
  } catch (err) {
    signale.error('Database connection error:', err.stack);
  }
})();

export default pool;
