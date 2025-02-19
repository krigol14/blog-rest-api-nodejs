import {
  endSetup,
  insertTestPost,
  insertTestUser,
  request,
  setup,
} from './utils';

let user1;
let user2;
let post1;
let post2;
let user1AccessToken;

describe('posts', () => {
  beforeAll(async () => {
    await setup();

    user1 = await insertTestUser('john@doe.com', 'password');
    user2 = await insertTestUser('mark@doe.com', 'password');
    post1 = await insertTestPost(user1.id, 'Post 1');
    post2 = await insertTestPost(user2.id, 'Post 2');

    await endSetup();
  });

  test('a user can fetch all posts', async () => {
    const response = await request('GET', 'posts');

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.data).toEqual([
      {
        content: 'Post 2',
        created_at: post2.created_at.toISOString(),
        id: post2.id,
        user_id: user2.id,
      },
      {
        content: 'Post 1',
        created_at: post1.created_at.toISOString(),
        id: post1.id,
        user_id: user1.id,
      },
    ]);
  });

  test('a user can fetch posts of a specific user', async () => {
    const response = await request('GET', 'posts/users/1');

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.data).toEqual([
      {
        content: 'Post 1',
        created_at: post1.created_at.toISOString(),
        id: post1.id,
        user_id: user1.id,
      },
    ]);
  });

  test('an error is thrown if a user tries to fetch his posts without being authenticated', async () => {
    const response = await request('GET', 'posts/me');

    expect(response.status).toBe(401);

    const result = await response.json();

    expect(result.error).toEqual('No authentication headers provided');
  });

  test('a user can fetch his posts', async () => {
    // Login so that an access token is generated
    const response1 = await request('POST', 'auth/login', {
      body: {
        email: 'john@doe.com',
        password: 'password',
      },
    });

    expect(response1.status).toBe(200);

    const result1 = await response1.json();

    expect(result1.data).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });

    user1AccessToken = result1.data.accessToken;

    // Fetch own posts
    const response2 = await request('GET', 'posts/me', {
      token: result1.data.accessToken,
    });

    expect(response2.status).toBe(200);

    const result2 = await response2.json();

    expect(result2.data).toEqual([
      {
        content: 'Post 1',
        created_at: post1.created_at.toISOString(),
        id: post1.id,
        user_id: user1.id,
      },
    ]);
  });

  test('an error is thrown if a user tries to add a post without providing content', async () => {
    const response = await request('POST', 'posts', {
      token: user1AccessToken,
    });

    expect(response.status).toBe(400);

    const result = await response.json();

    expect(result.error).toEqual('Content is required');
  });

  test('an error is thrown if a user tries to update a post which belongs to another user', async () => {
    const response = await request('PUT', `posts/${post2.id}`, {
      body: { content: 'Updated post' },
      token: user1AccessToken,
    });

    expect(response.status).toBe(403);

    const result = await response.json();

    expect(result.error).toEqual('Unauthorized');
  });

  test('an error is thrown if a user tries to delete a post which belongs to another user', async () => {
    const response = await request('DELETE', `posts/${post2.id}`, {
      token: user1AccessToken,
    });

    expect(response.status).toBe(403);

    const result = await response.json();

    expect(result.error).toEqual('Unauthorized');
  });

  test('a user can create a post', async () => {
    const response = await request('POST', `posts`, {
      body: { content: 'New post' },
      token: user1AccessToken,
    });

    expect(response.status).toBe(201);

    const result = await response.json();

    expect(result.data).toEqual({
      content: 'New post',
      created_at: expect.any(String),
      id: expect.any(Number),
      user_id: user1.id,
    });
  });

  test('a user can update a post which belongs to him', async () => {
    const response = await request('PUT', `posts/${post1.id}`, {
      body: { content: 'Updated post' },
      token: user1AccessToken,
    });

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.data).toEqual({
      content: 'Updated post',
      created_at: post1.created_at.toISOString(),
      id: post1.id,
      user_id: user1.id,
    });
  });

  test('a user can delete a post which belongs to him', async () => {
    const response = await request('DELETE', `posts/${post1.id}`, {
      token: user1AccessToken,
    });

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.data).toEqual({
      message: 'Post deleted',
    });
  });
});
