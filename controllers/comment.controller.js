/* eslint-disable import/extensions */
import {
  createCommentService,
  deleteCommentService,
  getPostCommentsService,
  updateCommentService,
} from '../services/comment.service.js';
import { getPagination, sendResponse } from '../utils.js';

const getPostCommentsController = async (req, res) => {
  const { postId } = req.params;
  const { limit, offset } = getPagination(req.query);

  if (!postId) {
    return sendResponse(res, { error: 'Post ID is required', status: 400 });
  }

  const result = await getPostCommentsService(postId, limit, offset);

  return sendResponse(res, result);
};

const createCommentController = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!postId) {
    return sendResponse(res, { error: 'Post ID is required', status: 400 });
  }

  if (!content) {
    return sendResponse(res, { error: 'Content is required', status: 400 });
  }

  const result = await createCommentService(postId, userId, content);

  return sendResponse(res, result);
};

const updateCommentController = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!commentId) {
    return sendResponse(res, { error: 'Comment ID is required', status: 400 });
  }

  if (!content) {
    return sendResponse(res, { error: 'Content is required', status: 400 });
  }

  const result = await updateCommentService(commentId, userId, content);

  return sendResponse(res, result);
};

const deleteCommentController = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  if (!commentId) {
    return sendResponse(res, { error: 'Comment ID is required', status: 400 });
  }

  const result = await deleteCommentService(commentId, userId);

  return sendResponse(res, result);
};

export {
  createCommentController,
  deleteCommentController,
  getPostCommentsController,
  updateCommentController,
};
