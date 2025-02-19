/* eslint-disable import/extensions */
import refreshTokenService from '../services/refreshToken.service.js';
import { sendResponse } from '../utils.js';

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

export default refreshTokenController;
