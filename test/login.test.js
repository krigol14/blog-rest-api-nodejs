import { endSetup, insertTestUser, request, setup } from './utils';

describe('login', () => {
  beforeAll(async () => {
    await setup();

    await insertTestUser('john@doe.com', 'password');

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
});
