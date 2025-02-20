import chalk from 'chalk';
import morgan from 'morgan';

// Custom tokens
morgan.token('req-time', () => new Date().toISOString()); // Timestamp
morgan.token('method', (req) => chalk.blue(req.method)); // HTTP method
morgan.token('url', (req) => chalk.magenta(req.originalUrl)); // Full URL
morgan.token('path', (req) => chalk.cyan(req.path)); // Request path
morgan.token('params', (req) => chalk.green(JSON.stringify(req.params))); // Route params
morgan.token('query', (req) => chalk.green(JSON.stringify(req.query))); // Query params

// Masking sensitive headers
morgan.token('headers', (req) => {
  const headers = { ...req.headers };

  if (headers.authorization && headers.authorization.startsWith('Bearer ')) {
    headers.authorization = 'Bearer ***HIDDEN***';
  }

  return chalk.yellow(JSON.stringify(headers));
});

// Masking sensitive body data
morgan.token('body', (req) => {
  if (!Object.keys(req.body).length) return '{}';

  const safeBody = {
    ...req.body,
    ...(req.body.password && { password: '***HIDDEN***' }),
  };

  return chalk.yellow(JSON.stringify(safeBody));
});

// Custom status coloring
const statusColor = (status) => {
  switch (true) {
    case status >= 500:
      return chalk.red(status);
    case status >= 400:
      return chalk.yellow(status);
    case status >= 300:
      return chalk.cyan(status);
    case status >= 200:
      return chalk.green(status);
    default:
      return status;
  }
};

morgan.token('colored-status', (_, res) => statusColor(res.statusCode));

// Production Log Format
const prodLogger = morgan(
  '[REQ] :req-time | :method :url | :colored-status | :response-time ms'
);

// Debug Log Format
const debugLogger = morgan(
  '[REQ] :req-time | :method :url | Path: :path | Params: :params | Query: :query | Headers: :headers | Body: :body | :colored-status | Response Time: :response-time ms'
);

export { debugLogger, prodLogger };
