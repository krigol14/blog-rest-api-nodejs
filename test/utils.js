import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

import { createPool } from '../db';
import { generateAccessToken } from '../utils';

dotenv.config();

const pool = createPool();

// Sets up the test database by truncating all tables and restarting identity sequences
const setup = async () => {
  const client = await pool.connect(); // Connect to the database
  try {
    await client.query('BEGIN');
    await client.query(
      'TRUNCATE TABLE comments, posts, refresh_tokens, users RESTART IDENTITY CASCADE',
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const endSetup = async () => {
  await pool.end();
};

const request = async (method, endpoint, options = {}) => {
  const { body, query, token } = options;

  // Build query string if query parameters exist
  const queryString = query ? `?${new URLSearchParams(query).toString()}` : '';

  // Construct full URL
  const url = `http://localhost:3000/${endpoint}${queryString}`;

  // Set up headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // Fetch options
  const fetchOptions = {
    headers,
    method,
    ...(body && { body: JSON.stringify(body) }),
  };

  const response = await fetch(url, fetchOptions);

  return response;
};

const insertTestUser = async (email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10); // Encrypt the password
  const result = await pool.query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
    [email, hashedPassword],
  );
  return result.rows[0];
};

const insertTestPost = async (userId, content) => {
  const result = await pool.query(
    'INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *',
    [userId, content],
  );
  return result.rows[0];
};

const insertTestComment = async (userId, postId, content) => {
  const result = await pool.query(
    'INSERT INTO comments (user_id, post_id, content) VALUES ($1, $2, $3) RETURNING *',
    [userId, postId, content],
  );
  return result.rows[0];
};

const insertTestRefreshToken = async (
  userId,
  expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
) => {
  const generatedRefreshToken = generateAccessToken(userId, '7d');
  const result = await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
    [userId, generatedRefreshToken, expiresAt],
  );
  return result.rows[0];
};

export {
  endSetup,
  insertTestComment,
  insertTestPost,
  insertTestRefreshToken,
  insertTestUser,
  request,
  setup,
};
