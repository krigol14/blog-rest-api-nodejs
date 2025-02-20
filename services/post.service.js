import {
  createPost,
  deletePost,
  getPostById,
  getPostsPaginated,
  updatePost,
} from '../models/post.model.js';
import { formatResponse } from '../utils/helpers.js';

const getPostsService = async (limit, offset) => {
  const posts = await getPostsPaginated(limit, offset);
  return formatResponse({ data: posts, status: 200 });
};

const getUserPostsControllerService = async (userId, limit, offset) => {
  const userPosts = await getPostsPaginated(limit, offset, userId);
  return formatResponse({ data: userPosts, status: 200 });
};

const createPostService = async (userId, content) => {
  const post = await createPost(userId, content);
  return formatResponse({ data: post, status: 201 });
};

const updatePostService = async (postId, userId, content) => {
  const post = await getPostById(postId);

  if (!post) {
    return formatResponse({ error: 'Post not found', status: 404 });
  }

  if (post.user_id !== userId) {
    return formatResponse({ error: 'Unauthorized', status: 403 });
  }

  const updatedPost = await updatePost(postId, content);

  if (!updatedPost) {
    return formatResponse({ error: 'Post not found', status: 404 });
  }

  return formatResponse({ data: updatedPost, status: 200 });
};

const deletePostService = async (postId, userId) => {
  const post = await getPostById(postId);

  if (!post) {
    return formatResponse({ error: 'Post not found', status: 404 });
  }

  if (post.user_id !== userId) {
    return formatResponse({ error: 'Unauthorized', status: 403 });
  }

  await deletePost(postId);

  return formatResponse({ data: { message: 'Post deleted' }, status: 200 });
};

export {
  createPostService,
  deletePostService,
  getPostsService,
  getUserPostsControllerService,
  updatePostService,
};
