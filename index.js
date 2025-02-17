import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import signale from 'signale';

import pool from './db';

const app = express();

app.use(express.json());

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    return res.status(400).json({ message: 'Email is already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
      [email, hashedPassword]
    );
    return res.status(201).json({
      message: 'User created successfully',
      userId: result.rows[0].id,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: 'Error registering user' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [
    email,
  ]);

  if (result.rows.length === 0) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const user = result.rows[0];

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
    [user.id, refreshToken]
  );

  return res.json({
    accessToken,
    message: 'Login successful',
    refreshToken,
  });
});

app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }

  const result = await pool.query(
    'SELECT * FROM refresh_tokens WHERE token = $1',
    [refreshToken]
  );

  if (result.rows.length === 0) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }

  const storedToken = result.rows[0];

  if (new Date(storedToken.expires_at) < new Date()) {
    return res.status(403).json({ message: 'Refresh token expired' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
});

app.get('/users/:userId/posts', async (req, res) => {
  const { userId } = req.params;
  const { limit = 10, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      'SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );

    return res.status(200).json({ posts: result.rows });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: 'Error retrieving posts' });
  }
});

app.get('/posts', async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      'SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return res.status(200).json({ posts: result.rows });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: 'Error retrieving posts' });
  }
});

app.get('/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  const { limit = 10, page = 1 } = req.query;

  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      'SELECT comments.*, users.email FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [postId, limit, offset]
    );

    return res.status(200).json({ comments: result.rows });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: 'Error retrieving comments' });
  }
});

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(403)
      .json({ message: 'No authentication headers provided' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.post('/posts', async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO posts (content, user_id) VALUES ($1, $2) RETURNING id',
      [content, userId]
    );
    res.status(201).json({
      message: 'Post created successfully',
      postId: result.rows[0].id,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: err.message, message: 'Error creating post' });
  }
});

app.put('/posts/:id', async (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;
  const userId = req.user.id;

  const postResult = await pool.query('SELECT * FROM posts WHERE id = $1', [
    postId,
  ]);

  if (postResult.rows.length === 0) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const post = postResult.rows[0];

  if (post.user_id !== userId) {
    return res
      .status(403)
      .json({ message: 'You can only edit your own posts' });
  }

  try {
    await pool.query('UPDATE posts SET content = $1 WHERE id = $2', [
      content,
      postId,
    ]);
    return res.status(200).json({ message: 'Post updated successfully' });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message, message: 'Error updating post' });
  }
});

app.delete('/posts/:id', async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  const postResult = await pool.query('SELECT * FROM posts WHERE id = $1', [
    postId,
  ]);

  if (postResult.rows.length === 0) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const post = postResult.rows[0];

  if (post.user_id !== userId) {
    return res
      .status(403)
      .json({ message: 'You can only delete your own posts' });
  }

  try {
    await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message, message: 'Error deleting post' });
  }
});

app.get('/my-posts', async (req, res) => {
  const userId = req.user.id;
  const { limit = 10, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      'SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );

    return res.status(200).json({ posts: result.rows });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: 'Error retrieving posts' });
  }
});

app.post('/:postId/comments', async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ message: 'Comment content is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO comments (user_id, post_id, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, postId, content]
    );

    return res
      .status(201)
      .json({ comment: result.rows[0], message: 'Comment added' });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: 'Error adding comment' });
  }
});

app.put('/comments/:commentId', async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ message: 'Comment content is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE comments SET content = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [content, commentId, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(403)
        .json({ message: 'You can only edit your own comments' });
    }

    return res
      .status(200)
      .json({ comment: result.rows[0], message: 'Comment updated' });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: 'Error updating comment' });
  }
});

app.delete('/comments/:commentId', async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *',
      [commentId, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own comments' });
    }

    return res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: 'Error deleting comment' });
  }
});

app.listen(3000, () => {
  signale.info('Server is running on http://localhost:3000');
});
