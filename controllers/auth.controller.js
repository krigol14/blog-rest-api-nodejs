import { sendResponse } from '../utils/helpers.js';
import {
  registerUserService,
  loginUserService,
  refreshTokenService,
} from '../services/auth.service.js';

const registerController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(res, {
      error: 'Email and password are required',
      status: 400,
    });
  }

  const result = await registerUserService(email, password);

  return sendResponse(res, result);
};

const loginController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(res, {
      error: 'Email and password are required',
      status: 400,
    });
  }

  const result = await loginUserService(email, password);

  return sendResponse(res, result);
};

const refreshTokenController = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendResponse(res, {
      error: 'Refresh token is required',
      status: 400,
    });
  }

  const result = await refreshTokenService(refreshToken);

  return sendResponse(res, result);
};

export { loginController, refreshTokenController, registerController };
