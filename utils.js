import jwt from 'jsonwebtoken';

// Extracts the limit and page from the query string parameters and calculates the offset based on these values
const getPagination = (query) => {
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const offset = (page - 1) * limit;
  return { limit, offset, page };
};

// Used by controllers and middlewares to send responses to the client
const sendResponse = (res, { data = null, error = null, status = 200 }) => {
  if (error) {
    return res.status(status || 500).json({ error, status });
  }
  return res.status(status).json({ data });
};

// Formats the response object to be returned by services and sent to controllers
const formatResponse = ({ data = null, error = null, status = 200 }) => ({
  data,
  error,
  status,
});

// Generates an access token using the user ID
const generateAccessToken = (userId, expiresIn = '1h') =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });

export { formatResponse, generateAccessToken, getPagination, sendResponse };
