import pkg from 'pg';

const { Pool } = pkg;

export const createPool = () =>
  new Pool({
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD || '',
    port: 5432,
    ssl: { rejectUnauthorized: false },
    user: process.env.DB_USER,
  });

const pool = createPool();

export default pool;
