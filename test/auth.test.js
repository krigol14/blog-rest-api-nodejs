import {
  endSetup,
  insertTestRefreshToken,
  insertTestUser,
  request,
  setup,
} from './utils';

let user;
let refreshToken;

describe('auth', () => {
  beforeAll(async () => {
    await setup();

    user = await insertTestUser('john@doe.com', 'password');
    refreshToken = await insertTestRefreshToken(user.id);

    await endSetup();
  });

  test('an error is thrown if email is not provided', async () => {
    const response = await request('POST', 'auth/login', {
      body: { password: 'password' },
    });

    expect(response.status).toBe(400);

    const result = await response.json();

    expect(result.error).toEqual('Email and password are required');
  });

  test('an error is thrown if password is not provided', async () => {
    const response = await request('POST', 'auth/login', {
      body: { email: 'test@email.com' },
    });

    expect(response.status).toBe(400);

    const result = await response.json();

    expect(result.error).toEqual('Email and password are required');
  });

  test('an error is thrown if the user does not exist', async () => {
    const response = await request('POST', 'auth/login', {
      body: {
        email: 'test@email.com',
        password: 'password',
      },
    });

    expect(response.status).toBe(404);

    const result = await response.json();

    expect(result.error).toEqual('User not found');
  });

  test('an error is thrown if the password is not correct', async () => {
    const response = await request('POST', 'auth/login', {
      body: {
        email: 'john@doe.com',
        password: 'wrongpassword',
      },
    });

    expect(response.status).toBe(401);

    const result = await response.json();

    expect(result.error).toEqual('Invalid password');
  });

  test('a user can login', async () => {
    const response = await request('POST', 'auth/login', {
      body: {
        email: 'john@doe.com',
        password: 'password',
      },
    });

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.data).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  /**
   * HERE
   */
  test('an error is thrown if email is not provided', async () => {
    const response = await request('POST', 'auth/register', {
      body: { password: 'password' },
    });

    expect(response.status).toBe(400);

    const result = await response.json();

    expect(result.error).toEqual('Email and password are required');
  });

  test('an error is thrown if password is not provided', async () => {
    const response = await request('POST', 'auth/register', {
      body: { email: 'test@email.com' },
    });

    expect(response.status).toBe(400);

    const result = await response.json();

    expect(result.error).toEqual('Email and password are required');
  });

  test('an error is thrown if a user with the same email already exists', async () => {
    const response = await request('POST', 'auth/register', {
      body: {
        email: 'john@doe.com',
        password: 'password',
      },
    });

    expect(response.status).toBe(400);

    const result = await response.json();

    expect(result.error).toEqual('Email is already registered');
  });

  test('a user can register', async () => {
    const response = await request('POST', 'auth/register', {
      body: {
        email: 'test@email.com',
        password: 'password',
      },
    });

    expect(response.status).toBe(201);

    const result = await response.json();

    expect(result.data).toEqual({
      created_at: expect.any(String),
      email: 'test@email.com',
      id: expect.any(Number),
      password: expect.any(String),
    });
  });

  test('an error is thrown if a refresh token is not provided', async () => {
    const response = await request('POST', 'auth/refresh-token');

    expect(response.status).toBe(400);

    const result = await response.json();

    expect(result.error).toEqual('Refresh token is required');
  });

  test('an error is thrown if the refresh token provided is not found', async () => {
    const response = await request('POST', 'auth/refresh-token', {
      body: { refreshToken: 'invalid' },
    });

    expect(response.status).toBe(401);

    const result = await response.json();

    expect(result.error).toEqual('Token not found');
  });

  test('a user can get a new access token by providing his refresh token', async () => {
    const response = await request('POST', 'auth/refresh-token', {
      body: { refreshToken: refreshToken.token },
    });

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.data).toEqual({
      accessToken: expect.any(String),
    });
  });
});
