import {
  createPostService,
  deletePostService,
  getPostsService,
  getUserPostsControllerService,
  updatePostService,
} from '../services/post.service.js';
import { getPagination, sendResponse } from '../utils/helpers.js';

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

  const result = await getUserPostsControllerService(
    req.user.id,
    limit,
    offset,
  );

  return sendResponse(res, result);
};

const createPostController = async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return sendResponse(res, { error: 'Content is required', status: 400 });
  }

  const result = await createPostService(req.user.id, content);

  return sendResponse(res, result);
};

const updatePostController = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!postId) {
    return sendResponse(res, { error: 'Post ID is required', status: 400 });
  }

  if (!content) {
    return sendResponse(res, { error: 'Content is required', status: 400 });
  }

  const result = await updatePostService(postId, req.user.id, content);

  return sendResponse(res, result);
};

const deletePostController = async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    return sendResponse(res, { error: 'Post ID is required', status: 400 });
  }

  const result = await deletePostService(postId, req.user.id);

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
