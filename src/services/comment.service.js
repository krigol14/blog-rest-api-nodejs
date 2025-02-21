import {
  createComment,
  deleteComment,
  getCommentById,
  getCommentsPaginatedByPostId,
  updateComment,
} from '../models/comment.model.js';
import { getPostById } from '../models/post.model.js';
import { formatResponse } from '../utils/helpers.js';

const doesPostExist = async (postId) => {
  const post = await getPostById(postId);

  if (!post) {
    throw new Error('Post not found');
  }

  return true;
};

const getPostCommentsService = async (postId, limit, offset) => {
  try {
    await doesPostExist(postId);
  } catch (error) {
    return formatResponse({ error: error.message, status: 404 });
  }

  const comments = await getCommentsPaginatedByPostId(postId, limit, offset);

  return formatResponse({ data: comments, status: 200 });
};

const createCommentService = async (postId, userId, content) => {
  try {
    await doesPostExist(postId);
  } catch (error) {
    return formatResponse({ error: error.message, status: 404 });
  }

  const comment = await createComment(postId, userId, content);

  return formatResponse({ data: comment, status: 201 });
};

// The existence of the associated post is implicitly ensured by the "ON DELETE CASCADE" foreign key constraint on the comments table
// This means we don't need to manually verify if the post exists, as comments can only exist if their corresponding post is present
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
