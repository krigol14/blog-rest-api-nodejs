import jwt from 'jsonwebtoken';

import { sendResponse } from '../utils';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return sendResponse(res, {
      error: 'No authentication headers provided',
      status: 401,
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return sendResponse(res, {
      error: 'No token provided',
      status: 401,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return sendResponse(res, {
      error: 'Invalid or expired token',
      status: 401,
    });
  }
};

export default authenticate;
