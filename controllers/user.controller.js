import {
  loginUserService,
  registerUserService,
} from '../services/user.service';
import { sendResponse } from '../utils';

const registerUserController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    sendResponse(res, {
      error: 'Email and password are required',
      status: 400,
    });
  }

  const result = await registerUserService(email, password);

  sendResponse(res, result);
};

const loginUserController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    sendResponse(res, {
      error: 'Email and password are required',
      status: 400,
    });
  }

  const result = await loginUserService(email, password);

  sendResponse(res, result);
};

export { loginUserController, registerUserController };
