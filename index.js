/* eslint-disable import/extensions */
import express from 'express';
import signale from 'signale';

import {
  loginUserController,
  refreshTokenController,
  registerUserController,
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
  getPostsByUserController,
  updatePostController,
} from './controllers/post.controller.js';
import authenticate from './middlewares/authenticate.js';

const app = express();

app.use(express.json());

// AUTH ROUTES
app.post('/auth/register', registerUserController); // Register a new user
app.post('/auth/login', loginUserController); // Login a user
app.post('/auth/refresh-token', refreshTokenController); // Refresh token

// POST ROUTES
app.get('/posts', getAllPostsController); // Fetch all posts
app.get('/posts/users/:userId', getPostsByUserController); // Fetch posts of a specific user
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
