/* eslint-disable import/extensions */
import pool from '../db.js';

const getPostsPaginated = async (limit, offset, userId = null) => {
  const query = userId
    ? 'SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3'
    : 'SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2';

  const params = userId ? [userId, limit, offset] : [limit, offset];

  const result = await pool.query(query, params);
  return result.rows;
};

const getPostById = async (postId) => {
  const result = await pool.query('SELECT * FROM posts WHERE id = $1', [
    postId,
  ]);
  return result.rows[0];
};

const createPost = async (userId, content) => {
  const result = await pool.query(
    'INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *',
    [userId, content]
  );
  return result.rows[0];
};

const updatePost = async (postId, content) => {
  const result = await pool.query(
    'UPDATE posts SET content = $1 WHERE id = $2 RETURNING *',
    [content, postId]
  );
  return result.rowCount > 0 ? result.rows[0] : null;
};

const deletePost = async (postId) => {
  const result = await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
  return result.rowCount > 0;
};

export { createPost, deletePost, getPostById, getPostsPaginated, updatePost };
