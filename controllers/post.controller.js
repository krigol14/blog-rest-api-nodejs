import {
  createPostService,
  deletePostService,
  getPostsService,
  getUserPostsService,
  updatePostService,
} from '../services/post.service';
import { getPagination, sendResponse } from '../utils';

const getPostsByUserController = async (req, res) => {
  const { userId } = req.params;
  const { limit, offset } = getPagination(req.query);

  if (!userId) {
    sendResponse(res, { error: 'User ID is required', status: 400 });
  }

  const result = await getUserPostsService(userId, limit, offset);

  sendResponse(res, result);
};

const getAllPostsController = async (req, res) => {
  const { limit, offset } = getPagination(req.query);

  const result = await getPostsService(limit, offset);

  sendResponse(res, result);
};

const getMyPostsController = async (req, res) => {
  const { limit, offset } = getPagination(req.query);
  const userId = req.user.id;

  if (!userId) {
    sendResponse(res, { error: 'User ID is required', status: 400 });
  }

  const result = await getUserPostsService(userId, limit, offset);

  sendResponse(res, result);
};

const updatePostController = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!postId) {
    sendResponse(res, { error: 'Post ID is required', status: 400 });
  }

  if (!content) {
    sendResponse(res, { error: 'Content is required', status: 400 });
  }

  const result = await updatePostService(postId, userId, content);

  sendResponse(res, result);
};

const deletePostController = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  if (!postId) {
    sendResponse(res, { error: 'Post ID is required', status: 400 });
  }

  const result = await deletePostService(postId, userId);

  sendResponse(res, result);
};

const createPostController = async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;

  if (!content) {
    sendResponse(res, { error: 'Content is required', status: 400 });
  }

  const result = await createPostService(userId, content);

  sendResponse(res, result);
};

export {
  createPostController,
  deletePostController,
  getAllPostsController,
  getMyPostsController,
  getPostsByUserController,
  updatePostController,
};
