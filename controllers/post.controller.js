import {
  createPostService,
  deletePostService,
  getPostsService,
  getUserPostsControllerService,
  updatePostService,
} from '../services/post.service.js';
import { getPagination, sendResponse } from '../utils.js';

const getUserPostsController = async (req, res) => {
  const { userId } = req.params;
  const { limit, offset } = getPagination(req.query);

  if (!userId) {
    return sendResponse(res, { error: 'User ID is required', status: 400 });
  }

  const result = await getUserPostsControllerService(userId, limit, offset);

  return sendResponse(res, result);
};

const getAllPostsController = async (req, res) => {
  const { limit, offset } = getPagination(req.query);

  const result = await getPostsService(limit, offset);

  return sendResponse(res, result);
};

const getMyPostsController = async (req, res) => {
  const { limit, offset } = getPagination(req.query);
  const userId = req.user.id;

  if (!userId) {
    return sendResponse(res, { error: 'User ID is required', status: 400 });
  }

  const result = await getUserPostsControllerService(userId, limit, offset);

  return sendResponse(res, result);
};

const updatePostController = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!postId) {
    return sendResponse(res, { error: 'Post ID is required', status: 400 });
  }

  if (!content) {
    return sendResponse(res, { error: 'Content is required', status: 400 });
  }

  const result = await updatePostService(postId, userId, content);

  return sendResponse(res, result);
};

const deletePostController = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  if (!postId) {
    return sendResponse(res, { error: 'Post ID is required', status: 400 });
  }

  const result = await deletePostService(postId, userId);

  return sendResponse(res, result);
};

const createPostController = async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;

  if (!content) {
    return sendResponse(res, { error: 'Content is required', status: 400 });
  }

  const result = await createPostService(userId, content);

  return sendResponse(res, result);
};

export {
  createPostController,
  deletePostController,
  getAllPostsController,
  getMyPostsController,
  getUserPostsController,
  updatePostController,
};
