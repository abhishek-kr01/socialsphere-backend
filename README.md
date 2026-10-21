# SocialSphere Backend

SocialSphere is a REST API backend for a social media application built with Node.js, Express, MongoDB, and Mongoose. It supports user signup and signin, post management, image uploads to Amazon S3, comments and replies, and likes on posts and comments.

## Features

- **User authentication:** Signup, signin, password hashing with bcrypt, and JWT generation.
- **Posts:** Create posts with an image and caption, retrieve posts with pagination, update posts, and delete posts.
- **Image uploads:** Upload JPEG and PNG images to Amazon S3 using Multer and `multer-s3`.
- **Comments and replies:** Add comments to posts, reply to existing comments, and retrieve a comment with its replies.
- **Likes:** Like and unlike posts or comments. Duplicate likes are prevented by a compound unique index.
- **Validation:** Request validation for signup, signin, and post captions using Zod.
- **Rate limiting:** Limits each IP address to 10 requests per minute.
- **API versioning:** Versioned routes use the `/api/v1` prefix.

## Tech Stack

- Node.js (ES modules)
- Express 5
- MongoDB and Mongoose
- JSON Web Tokens (`jsonwebtoken`)
- bcrypt
- Zod
- Multer and `multer-s3`
- Amazon S3 (AWS SDK for JavaScript v2)
- `express-rate-limit`

## Project Structure

```text
socialsphere-backend/
├── src/
│   ├── config/          # MongoDB, AWS S3, Multer and environment configuration
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Authentication middleware
│   ├── repositories/    # Database operations
│   ├── routers/         # API and versioned routes
│   ├── schema/          # Mongoose models
│   ├── services/        # Application business logic
│   ├── utils/           # JWT helpers
│   ├── validators/      # Zod schemas and validation middleware
│   └── index.js         # Express application entry point
├── .gitignore
├── package.json
└── package-lock.json
```

## Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB database (local or MongoDB Atlas)
- An AWS S3 bucket and AWS credentials for post image uploads

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/abhishek-kr01/socialsphere-backend.git
cd socialsphere-backend
npm install
```

Create a `.env` file in the project root with the required environment variables.

```env
DB_URL=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
JWT_SECRET=replace_with_a_long_random_secret
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
```

Keep `.env` out of version control. Use credentials with only the AWS permissions needed by the application, and never expose AWS secrets in frontend code.

### Run Locally

```bash
npm start
```

The server currently listens on port `3000`.

## Base URL

Local API base URL:

```text
http://localhost:3000/api/v1
```

The project is deployed as a Render web service. Set the environment variables listed above in the Render service's **Environment** settings as well; local `.env` values are not automatically copied to Render.

## Authentication

Signin returns a JWT. Protected endpoints expect the token in the `x-access-token` request header (not as a Bearer token in the `Authorization` header).

```http
x-access-token: <your_jwt_token>
```

JWT tokens expire after 1 day. Comment endpoints, like endpoints, and `/ping` use the authentication middleware.

## API Endpoints

All versioned endpoints use the `/api/v1` prefix.

### Users

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| `POST` | `/users/signup` | Create a user account | No |
| `POST` | `/users/signin` | Sign in and receive a JWT | No |
| `GET` | `/users/profile` | Profile route placeholder; currently returns `501 Not Implemented` | No |

#### Signup

`POST /api/v1/users/signup`

```json
{
  "username": "abhishek01",
  "email": "abhishek@example.com",
  "password": "your_password"
}
```

The username must be at least 5 characters, the password at least 6 characters, and the email must be valid. Passwords are hashed with bcrypt before they are saved.

#### Signin

`POST /api/v1/users/signin`

```json
{
  "email": "abhishek@example.com",
  "password": "your_password"
}
```

A successful response includes the JWT in `data`.

### Posts

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| `POST` | `/posts` | Create a post with an image and caption | Not enforced by the current route |
| `GET` | `/posts` | Retrieve posts with pagination | No |
| `PUT` | `/posts/:id` | Update a post, optionally replacing its image | Not enforced by the current route |
| `DELETE` | `/posts/:id` | Delete a post | Not enforced by the current route |

#### Create a post

`POST /api/v1/posts`

Use `multipart/form-data` in Postman:

| Key | Type | Value |
|---|---|---|
| `caption` | Text | `My first SocialSphere post` |
| `image` | File | Select a JPEG or PNG image |

The image is uploaded to S3. The resulting S3 URL is stored with the post.

#### Get posts with pagination

`GET /api/v1/posts?limit=10&offset=0`

- `limit`: maximum number of posts to return; defaults to `10`.
- `offset`: number of posts to skip; defaults to `0`.

Posts are sorted by creation time, newest first. The response includes `posts`, `totalDocuments`, and `totalPages`.

#### Update a post

`PUT /api/v1/posts/:id`

Send post fields in the request body. To replace the image, use `multipart/form-data` with the `image` field as a file. The route uses the post ID as the URL parameter.

#### Delete a post

`DELETE /api/v1/posts/:id`

Replace `:id` with the MongoDB post ID.

### Comments and Replies

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| `POST` | `/comments` | Add a comment to a post or reply to a comment | Yes |
| `GET` | `/comments/:id` | Retrieve a comment with its replies | Yes |

#### Create a comment on a post

`POST /api/v1/comments`

Headers:

```http
x-access-token: <your_jwt_token>
Content-Type: application/json
```

Body:

```json
{
  "content": "Nice post!",
  "onModel": "Post",
  "commentableId": "<post_id>"
}
```

#### Reply to a comment

Use the same endpoint, but set `onModel` to `Comment` and `commentableId` to the parent comment's ID:

```json
{
  "content": "Thanks for sharing!",
  "onModel": "Comment",
  "commentableId": "<parent_comment_id>"
}
```

The authenticated user's ID is associated with the comment. Replies are stored as references on the parent comment.

#### Get a comment

`GET /api/v1/comments/:id`

Requires the `x-access-token` header. The response includes the comment and its populated replies.

### Likes

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| `POST` | `/likes/:onModel/:likeableId` | Like a post or comment | Yes |
| `DELETE` | `/likes/:onModel/:likeableId` | Unlike a post or comment | Yes |

Use lowercase `post` or `comment` for `:onModel`.

#### Like a post

```http
POST /api/v1/likes/post/<post_id>
x-access-token: <your_jwt_token>
```

#### Unlike a post

```http
DELETE /api/v1/likes/post/<post_id>
x-access-token: <your_jwt_token>
```

#### Like or unlike a comment

Replace `post` with `comment` and `<post_id>` with the comment ID:

```http
POST /api/v1/likes/comment/<comment_id>
x-access-token: <your_jwt_token>
```

```http
DELETE /api/v1/likes/comment/<comment_id>
x-access-token: <your_jwt_token>
```

Like records are stored in the `likes` collection and referenced from the target post or comment. The compound unique index prevents the same user from creating duplicate likes for the same target. The response includes the target's current `likeCount`.

### Health Check

```http
GET /ping
x-access-token: <your_jwt_token>
```

Returns a `pong` message and the server's detected IP address. This route currently requires authentication.

## Data Models

- **User:** Username, email, password hash, and timestamps.
- **Post:** Caption, S3 image URL, comments, likes, and timestamps.
- **Comment:** Content, author ID, parent model and ID, replies, and likes.
- **Like:** User ID, target model (`Post` or `Comment`), target ID, and timestamps.

## Rate Limiting

The API applies a rate limit of **10 requests per IP address per 60-second window** across the application.

## Deployment on Render

The service can be run on Render as a Node.js web service.

- **Build command:** `npm install`
- **Start command:** `npm start`
- Add `DB_URL`, `JWT_SECRET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, and `AWS_BUCKET_NAME` in the Render environment settings.

The application code currently listens on port `3000`; the deployed service's port configuration must be consistent with the port used by the server.

