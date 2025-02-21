# Overview
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

The API follows the **three-layer architecture**.

### 1. **Directories**

These directories contain the core components of the application:

- **`controllers/`**  
  Handle HTTP requests, validate input, and forward data to services.
  
- **`services/`**  
  Contain business logic and interact with the database.
  
- **`models/`**  
  Functions used to interact with the database.
  
- **`middlewares/`**  
  - **`authenticate.js`**: Middleware for verifying JWT authentication.
  
- **`utils/`**  
  Utility functions to reduce code duplication.
  - **`db.js`**: Manages database connections.
  - **`logger.js`**: Configures logging with **morgan**.
  - **`helpers.js`**: Contains utility functions for reusable code.
  
- **`tests/`**  
  Integration tests using Jest.
  - **`auth.test.js`**, **`posts.test.js`**, **`comments.test.js`**: Integration tests for various parts of the application.
  - **`utils.js`**: Helpers for test setup, database connections, and request utilities.

### 2. **Entry Point of the Server**

- **`index.js`**  
  - Initializes the **Express server** and defines **routes**.
  - Routes delegate requests to **controllers**.
  - Controllers validate input and call **services**.
  - Services execute **business logic** and interact with **models**.
  - Controllers return responses to **clients**.

### 3. **Configuration Files**

- **`.prettierrc`**: Prettier configuration file for code formatting.
- **`eslint.config.mjs`**: ESLint configuration file for linting JavaScript files.
- **`nodemon.json`**: Configuration for Nodemon's behavior to restart the server on code changes.
- **`Procfile`**: Specifies how Heroku runs the server.
- **`jest.config.json`**: Jest configuration file for running integration tests.

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
- To obtain it, either **request the file directly** or **request access to become a collaborator** on the Heroku app hosting the server and databases, where all configuration variables are securely stored.  
- You can contact me at [kristiangolemidev@gmail.com](mailto:kristiangolemidev@gmail.com) for access.  
- The `.env` file is already in `.gitignore` but make sure to **not commit the `.env` file to version control** to prevent exposing sensitive data.  

# API Routes Documentation

## Response Format
All responses contain the fields:
- `data` - Contains the response data (can be `null`).
- `error` - Contains an error message if an error occurs (can be `null`).

## Authentication Middleware
The authentication middleware is used before all routes that require the user to be authenticated. If the user is authenticated, the middleware calls `next()`, allowing the route handler to execute. Otherwise, returns a `401 Unauthorized` response.

### Responses:
- `401 Unauthorized` - No authentication headers provided.
- `401 Unauthorized` - No token provided.
- `401 Unauthorized` - Invalid JWT token.

## Authentication Routes

### `POST /auth/register`
Registers a new user.

#### Request Body:
- `email` (string) - Required
- `password` (string) - Required

#### Responses:
- `400 Bad Request` - Email and password are required.
- `400 Bad Request` - Email is already registered.
- `201 Created` - Returns the created user in the `data` field.

### `POST /auth/login`
Authenticates a user.

#### Request Body:
- `email` (string) - Required
- `password` (string) - Required

#### Responses:
- `404 Not Found` - User not found.
- `401 Unauthorized` - Invalid password.
- `200 OK` - Returns access token and refresh token in the `data` field.

### `POST /auth/refresh-token`
Generates a new access token using a refresh token.

#### Request Body:
- `refreshToken` (string) - Required

#### Responses:
- `400 Bad Request` - Refresh token is required.
- `401 Unauthorized` - Token not found.
- `403 Forbidden` - Invalid token.
- `200 OK` - Returns new access token in the `data` field.

## Post Routes

### `GET /posts`
Fetch all posts.

#### Responses:
- `200 OK` - Returns posts in the `data` field.

### `GET /posts/users/:userId`
Fetch all posts of a user with pagination.

#### Query Parameters:
- `limit` (number) - Optional
- `page` (number) - Optional

#### Path Parameters:
- `userId` (string) - Required

#### Responses:
- `400 Bad Request` - User ID is required.
- `200 OK` - Returns posts in the `data` field.

### `GET /posts/me`
Fetch posts of the authenticated user.

#### Authentication Required.

#### Responses:
- `200 OK` - Returns user posts in the `data` field.

### `POST /posts`
Create a new post.

#### Authentication Required.

#### Request Body:
- `content` (string) - Required

#### Responses:
- `400 Bad Request` - Content is required.
- `201 Created` - Returns created post in the `data` field.

### `PUT /posts/:postId`
Update a post.

#### Authentication Required.

#### Path Parameters:
- `postId` (string) - Required

#### Request Body:
- `content` (string) - Required

#### Responses:
- `400 Bad Request` - Post ID and content are required.
- `404 Not Found` - Post not found.
- `403 Forbidden` - Unauthorized (user does not own the post).
- `200 OK` - Returns updated post in the `data` field.

### `DELETE /posts/:postId`
Delete a post.

#### Authentication Required.

#### Path Parameters:
- `postId` (string) - Required

#### Responses:
- `400 Bad Request` - Post ID is required.
- `404 Not Found` - Post not found.
- `403 Forbidden` - Unauthorized (user does not own the post).
- `200 OK` - Returns message `Post deleted` in the `data` field.

## Comment Routes

### `GET /posts/:postId/comments`
Fetch all comments for a specific post.

#### Responses:
- `200 OK` - Returns comments in the `data` field.
- `400 Bad Request` - Post ID is required.
- `404 Not Found` - Post not found.

### `POST /posts/:postId/comments`
Add a comment to a post.

#### Authentication Required.

#### Request Body:
- `content` (string) - Required.

#### Responses:
- `400 Bad Request` - Content is required.
- `400 Bad Request` - Post ID is required.
- `404 Not Found` - Post not found.
- `201 Created` - Returns comment in `data`.

### `PUT /comments/:commentId`
Update a comment.

#### Authentication Required.

#### Request Body:
- `content` (string) - Required.

#### Responses:
- `400 Bad Request` - Content is required.
- `400 Bad Request` - Comment ID is required.
- `404 Not Found` - Comment not found.
- `403 Forbidden` - Unauthorized (User does not own the comment).
- `200 OK` - Returns updated comment in `data`.

### `DELETE /comments/:commentId`
Delete a comment.

#### Authentication Required.

#### Responses:
- `400 Bad Request` - Comment ID is required.
- `404 Not Found` - Comment not found.
- `403 Forbidden` - Unauthorized (User does not own the comment).
- `200 OK` - Success message in `data` (`Comment deleted`).
