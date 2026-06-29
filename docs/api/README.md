# API Documentation

The Electronic Store API follows RESTful conventions with a standard response envelope.

## Base URL

```
https://api.electronicstore.com/api/v1
```

## Authentication

The API uses JWT RS256 tokens delivered via HttpOnly cookies.

- `POST /auth/login` — Obtain access and refresh tokens
- `POST /auth/refresh` — Rotate refresh token
- `POST /auth/logout` — Revoke tokens

## Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "meta": {
    "page": 1,
    "limit": 24,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Error Format

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```
