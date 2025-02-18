import jwt from 'jsonwebtoken';

import { getRefreshToken } from '../models/refreshToken.model';
import { formatResponse, generateAccessToken } from '../utils';

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

export default refreshTokenService;
