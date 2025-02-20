import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import {
  createRefreshToken,
  getRefreshToken,
} from '../models/refreshToken.model.js';
import { createUser, getUserByEmail } from '../models/user.model.js';
import { formatResponse, generateAccessToken } from '../utils/helpers.js';

const registerUserService = async (email, password) => {
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return formatResponse({
      error: 'Email is already registered',
      status: 400,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await createUser(email, hashedPassword);

  return formatResponse({ data: user, status: 201 });
};

const loginUserService = async (email, password) => {
  const user = await getUserByEmail(email);

  if (!user) {
    return formatResponse({ error: 'User not found', status: 404 });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return formatResponse({ error: 'Invalid password', status: 401 });
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateAccessToken(user.id, '7d');

  await createRefreshToken(user.id, refreshToken);

  return formatResponse({ data: { accessToken, refreshToken }, status: 200 });
};

const refreshTokenService = async (refreshToken) => {
  const token = await getRefreshToken(refreshToken);

  if (!token) {
    return formatResponse({ error: 'Token not found', status: 401 });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const accessToken = generateAccessToken(decoded.id);

    return formatResponse({
      data: { accessToken },
      status: 200,
    });
  } catch (err) {
    return formatResponse({ error: err.message, status: 403 });
  }
};

export { loginUserService, refreshTokenService, registerUserService };
