# Quintessential NodeJS Challenge

## Overview
This is a RESTful API built using Express.js, structured with the three-layer architecture pattern. The API supports user authentication, post and comments CRUD operations. It also includes integration tests and is deployed on Heroku.

## Entities 

### Users
| Field        | Type      | Attributes |
|--------------|-----------|------------|
| `id`         | serial    | PK         |  
| `email`      | string    | unique     |
| `password`   | string    | hashed     |
| `created_at` | timestamp | -          |

### Posts
| Field        | Type      | Attributes           |
|--------------|-----------|----------------------|
| `id`         | serial    | PK                   |
| `content`    | string    | -                    |
| `user_id`    | serial    | FK referencing Users |
| `created_at` | timestamp | -                    |

### Comments
| Field        | Type      | Attributes           |
|--------------|-----------|----------------------|
| `id`         | serial    | PK                   |
| `content`    | string    | -                    |
| `user_id`    | serial    | FK referencing Users |
| `post_id`    | serial    | FK referencing Posts |
| `created_at` | timestamp | -                    |

### Refresh Tokens
| Field        | Type      | Attributes           |
|--------------|-----------|----------------------|
| `id`         | serial    | PK                   |
| `token`      | string    | unique               |
| `user_id`    | serial    | FK refercing Users   |
| `expires_at` | timestamp | -                    |

## Authentication
The API uses JWT tokens for authentication.
- Users can **register** and **log in**, receiving an **access token**.
- If the access token expires, users can request a new one by providing a **refresh token**.
- **Access tokens** expire in **1 day**, while **refresh tokens** expire in **7 days**.
- If the refresh token has also expired, users must log in again.

## Project Structure
The API follows the **three-layer architecture**:

### Directories
- `controllers/` - Handle HTTP requests, validate input, and forward data to services.
- `services/` - Contain business logic and interact with the database.
- `models/` - Functions used to interact with the database.
- `middlewares/`
  - `authenticate.js` - Middleware for verifying JWT authentication.
- `utils/`
  - `db.js` - Manages database connections.
  - `logger.js` - Configures logging with **morgan**.
  - `helpers.js` - Utility functions to reduce code duplication.
- `tests/`
  - `auth.test.js`, `posts.test.js`, `comments.test.js` - Integration tests using Jest.
  - `utils.js` - Helpers for test setup, database connections, and request utilities.

### `index.js`
- Initializes the **Express server** and defines **routes**.
- Routes delegate requests to **controllers**.
- Controllers validate input and call **services**.
- Services execute **business logic** and interact with **models**.
- Controllers return responses to **clients**.

## Testing
- The API uses **Jest** for testing.
- Tests are **integration tests**, requiring two terminals:
  - One running the Express server.
  - Another running Jest (`npm run jest`).
- Tests run **in-band** to avoid conflicts with the shared database instance.
- Running tests:
  - **All tests:** `npm run jest`
  - **Specific test:** `npm run jest ./src/test/auth.test.js`

## Deployment
The API and two PostgreSQL databases (**development** and **testing**) are deployed on **Heroku**.
- **API Base URL:** [https://quintessential-4b0e7e25ff8e.herokuapp.com](https://quintessential-4b0e7e25ff8e.herokuapp.com)
- The **test database** is hosted on Heroku to simplify CI/CD integration with GitHub Actions.

## Environment Variables  
- A `.env` file is required for running the server locally.  
- This file contains sensitive information such as database credentials and the JWT secret.  
- To obtain it, request it from `@krigol14` or become a collaborator on the Heroku deployment, where all environment variables are securely stored.  
- The `.env` file is already in `.gitignore` but make sure to **not commit the `.env` file to version control** to prevent exposing sensitive data.  

## Additional Configurations
- **ESLint & Prettier** - Enforce code quality and formatting.
- **Nodemon** - Restarts the server on code changes.
- **Procfile** - Specifies how Heroku runs the server.
- **Jest Config** - Custom test setup for integration testing.

---
