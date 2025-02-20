/* eslint-disable import/extensions */
import express from 'express';
import signale from 'signale';

import {
  loginController,
  refreshTokenController,
  registerController,
} from './controllers/auth.controller.js';
import {
  createCommentController,
  deleteCommentController,
  getPostCommentsController,
  updateCommentController,
} from './controllers/comment.controller.js';
import {
  createPostController,
  deletePostController,
  getAllPostsController,
  getMyPostsController,
  getUserPostsController,
  updatePostController,
} from './controllers/post.controller.js';
import authenticate from './middlewares/authenticate.js';
import { debugLogger, prodLogger } from './utils/logger.js';

const app = express();

app.use(express.json());

// Choose the logger based on the DEBUG environment variable
if (process.env.DEBUG === 'true') {
  app.use(debugLogger);
} else {
  app.use(prodLogger);
}

// AUTH ROUTES
app.post('/auth/register', registerController); // Register a new user
app.post('/auth/login', loginController); // Login a user
app.post('/auth/refresh-token', refreshTokenController); // Refresh token

// POST ROUTES
app.get('/posts', getAllPostsController); // Fetch all posts
app.get('/posts/users/:userId', getUserPostsController); // Fetch posts of a specific user
app.get('/posts/me', authenticate, getMyPostsController); // Fetch own posts
app.post('/posts', authenticate, createPostController); // Create a new post
app.put('/posts/:postId', authenticate, updatePostController); // Update a post
app.delete('/posts/:postId', authenticate, deletePostController); // Delete a post

// COMMENT ROUTES
app.get('/posts/:postId/comments', getPostCommentsController); // Fetch comments of a post
app.post('/posts/:postId/comments', authenticate, createCommentController); // Add a comment to a post
app.put('/comments/:commentId', authenticate, updateCommentController); // Update a comment
app.delete('/comments/:commentId', authenticate, deleteCommentController); // Delete a comment

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  signale.info(`Server running on http://localhost:${PORT}`);
});
