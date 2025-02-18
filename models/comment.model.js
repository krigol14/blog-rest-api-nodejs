import pool from '../db';

const getCommentById = async (commentId) => {
  const result = await pool.query('SELECT * FROM comments WHERE id = $1', [
    commentId,
  ]);
  return result.rows[0];
};

const getCommentsPaginatedByPostId = async (postId, limit, offset) => {
  const result = await pool.query(
    'SELECT * FROM comments WHERE post_id = $1 LIMIT $2 OFFSET $3',
    [postId, limit, offset]
  );
  return result.rows;
};

const createComment = async (postId, userId, content) => {
  const result = await pool.query(
    'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
    [postId, userId, content]
  );
  return result.rows[0];
};

const updateComment = async (commentId, userId, content) => {
  const result = await pool.query(
    'UPDATE comments SET content = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
    [content, commentId, userId]
  );
  return result.rowCount > 0 ? result.rows[0] : null;
};

const deleteComment = async (commentId, userId) => {
  const result = await pool.query(
    'DELETE FROM comments WHERE id = $1 AND user_id = $2',
    [commentId, userId]
  );
  return result.rowCount > 0;
};

export {
  createComment,
  deleteComment,
  getCommentById,
  getCommentsPaginatedByPostId,
  updateComment,
};
