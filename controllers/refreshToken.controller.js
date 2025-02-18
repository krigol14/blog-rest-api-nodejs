import refreshTokenService from '../services/refreshToken.service';
import { sendResponse } from '../utils';

const refreshTokenController = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    sendResponse(res, { error: 'Refresh token is required', status: 400 });
  }

  const result = await refreshTokenService(refreshToken);

  sendResponse(res, result);
};

export default refreshTokenController;
