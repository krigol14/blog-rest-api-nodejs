import { endSetup, insertTestUser, request, setup } from './utils';

describe('register', () => {
  beforeAll(async () => {
    await setup();

    await insertTestUser('john@doe.com', 'password');

    await endSetup();
  });

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
});
