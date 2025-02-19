/* eslint-disable import/extensions */
import {
  loginUserService,
  registerUserService,
} from '../services/user.service.js';
import { sendResponse } from '../utils.js';

const registerUserController = async (req, res) => {
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

const loginUserController = async (req, res) => {
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

export { loginUserController, registerUserController };
