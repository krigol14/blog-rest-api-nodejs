import pool from '../utils/db.js';

const getRefreshToken = async (token) => {
  const result = await pool.query(
    'SELECT * FROM refresh_tokens WHERE token = $1',
    [token],
  );
  return result.rows[0];
};

const createRefreshToken = async (userId, token) => {
  const result = await pool.query(
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
    [userId, token],
  );
  return result.rows[0];
};

export { createRefreshToken, getRefreshToken };
