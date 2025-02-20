import {
  createComment,
  deleteComment,
  getCommentById,
  getCommentsPaginatedByPostId,
  updateComment,
} from '../models/comment.model.js';
import { formatResponse } from '../utils/helpers.js';

const getPostCommentsService = async (postId, limit, offset) => {
  const comments = await getCommentsPaginatedByPostId(postId, limit, offset);
  return formatResponse({ data: comments, status: 200 });
};

const createCommentService = async (postId, userId, content) => {
  const comment = await createComment(postId, userId, content);
  return formatResponse({ data: comment, status: 201 });
};

const updateCommentService = async (commentId, userId, content) => {
  const comment = await getCommentById(commentId);

  if (!comment) {
    return formatResponse({ error: 'Comment not found', status: 404 });
  }

  if (comment.user_id !== userId) {
    return formatResponse({ error: 'Unauthorized', status: 403 });
  }

  const updatedComment = await updateComment(commentId, userId, content);

  return formatResponse({ data: updatedComment, status: 200 });
};

const deleteCommentService = async (commentId, userId) => {
  const comment = await getCommentById(commentId);

  if (!comment) {
    return formatResponse({ error: 'Comment not found', status: 404 });
  }

  if (comment.user_id !== userId) {
    return formatResponse({ error: 'Unauthorized', status: 403 });
  }

  await deleteComment(commentId, userId);

  return formatResponse({ data: { message: 'Comment deleted' }, status: 200 });
};

export {
  createCommentService,
  deleteCommentService,
  getPostCommentsService,
  updateCommentService,
};
