import { getCommentsPaginatedByPostId } from '../models/comment.model';
import {
  createCommentService,
  deleteCommentService,
  updateCommentService,
} from '../services/comment.service';
import { getPagination, sendResponse } from '../utils';

const getPostCommentsController = async (req, res) => {
  const { postId } = req.params;
  const { limit, offset } = getPagination(req.query);

  if (!postId) {
    sendResponse(res, { error: 'Post ID is required', status: 400 });
  }

  const result = await getCommentsPaginatedByPostId(postId, limit, offset);

  sendResponse(res, result);
};

const createCommentController = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!postId) {
    sendResponse(res, { error: 'Post ID is required', status: 400 });
  }

  if (!content) {
    sendResponse(res, { error: 'Content is required', status: 400 });
  }

  const result = await createCommentService(postId, userId, content);

  sendResponse(res, result);
};

const updateCommentController = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!commentId) {
    sendResponse(res, { error: 'Comment ID is required', status: 400 });
  }

  if (!content) {
    sendResponse(res, { error: 'Content is required', status: 400 });
  }

  const result = await updateCommentService(commentId, userId, content);

  sendResponse(res, result);
};

const deleteCommentController = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  if (!commentId) {
    sendResponse(res, { error: 'Comment ID is required', status: 400 });
  }

  const result = await deleteCommentService(commentId, userId);

  sendResponse(res, result);
};

export {
  createCommentController,
  deleteCommentController,
  getPostCommentsController,
  updateCommentController,
};
