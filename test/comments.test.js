import { generateAccessToken } from '../utils';
import {
  endSetup,
  insertTestComment,
  insertTestPost,
  insertTestUser,
  request,
  setup,
} from './utils';

let user1;
let user2;
let post1;
let post2;
let comment1;
let comment2;
let user1AccessToken;

describe('comments', () => {
  beforeAll(async () => {
    await setup();

    user1 = await insertTestUser('john@doe.com', 'password');
    user2 = await insertTestUser('mark@doe.com', 'password');
    post1 = await insertTestPost(user1.id, 'Post 1');
    post2 = await insertTestPost(user2.id, 'Post 2');
    comment1 = await insertTestComment(user1.id, post1.id, 'Comment 1');
    comment2 = await insertTestComment(user2.id, post1.id, 'Comment 2');
    await insertTestComment(user1.id, post2.id, 'Comment 3');
    user1AccessToken = generateAccessToken(user1.id);

    await endSetup();
  });

  test('a user can fetch all comments of a post', async () => {
    const response = await request('GET', 'posts/1/comments');

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.data).toEqual([
      {
        content: 'Comment 1',
        created_at: comment1.created_at.toISOString(),
        id: comment1.id,
        post_id: post1.id,
        user_id: user1.id,
      },
      {
        content: 'Comment 2',
        created_at: comment2.created_at.toISOString(),
        id: comment2.id,
        post_id: post1.id,
        user_id: user2.id,
      },
    ]);
  });

  test('an error is thrown if a user tries to add a comment without providing content', async () => {
    const response = await request('POST', 'posts/1/comments', {
      token: user1AccessToken,
    });

    expect(response.status).toBe(400);

    const result = await response.json();

    expect(result.error).toEqual('Content is required');
  });

  test('an error is thrown if a user tries to update a comment which belongs to another user', async () => {
    const response = await request('PUT', `comments/${comment2.id}`, {
      body: { content: 'Updated post' },
      token: user1AccessToken,
    });

    expect(response.status).toBe(403);

    const result = await response.json();

    expect(result.error).toEqual('Unauthorized');
  });

  test('an error is thrown if a user tries to delete a comment which belongs to another user', async () => {
    const response = await request('DELETE', `comments/${comment2.id}`, {
      token: user1AccessToken,
    });

    expect(response.status).toBe(403);

    const result = await response.json();

    expect(result.error).toEqual('Unauthorized');
  });

  test('a user can add a comment to a post', async () => {
    const response = await request('POST', 'posts/1/comments', {
      body: { content: 'New comment' },
      token: user1AccessToken,
    });

    expect(response.status).toBe(201);

    const result = await response.json();

    expect(result.data).toEqual({
      content: 'New comment',
      created_at: expect.any(String),
      id: expect.any(Number),
      post_id: 1,
      user_id: user1.id,
    });
  });

  test('a user can update a comment which belongs to him', async () => {
    const response = await request('PUT', `comments/${comment1.id}`, {
      body: { content: 'Updated comment' },
      token: user1AccessToken,
    });

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.data).toEqual({
      content: 'Updated comment',
      created_at: expect.any(String),
      id: comment1.id,
      post_id: post1.id,
      user_id: user1.id,
    });
  });

  test('a user can delete a comment which belongs to him', async () => {
    const response = await request('DELETE', `comments/${comment1.id}`, {
      token: user1AccessToken,
    });

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.data).toEqual({
      message: 'Comment deleted',
    });
  });
});
