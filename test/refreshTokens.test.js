import {
  endSetup,
  insertTestRefreshToken,
  insertTestUser,
  request,
  setup,
} from './utils';

let user;
let refreshToken;

describe('refreshTokens', () => {
  beforeAll(async () => {
    await setup();

    user = await insertTestUser('john@doe.com', 'password');
    refreshToken = await insertTestRefreshToken(user.id);

    await endSetup();
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
