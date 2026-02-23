# API Reference

Base URL: `http://localhost:3000`

All JSON request bodies must include `Content-Type: application/json`.
Protected routes require `Authorization: Bearer <access_token>`.

---

## Auth

### POST `/api/v1/auth/signup`

Register a new account.

**Request body**
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "s3cr3t!",
  "confirmPassword": "s3cr3t!"
}
```

**Responses**

| Status | Body | Condition |
|---|---|---|
| `201 Created` | `{ "accountId": 1, "username": "alice" }` | Success |
| `409 Conflict` | `{ "message": "Email already registered" }` | Duplicate email |
| `422 Unprocessable Entity` | `{ "issues": [...] }` | Validation failed |

---

### POST `/api/v1/auth/signin`

Authenticate and receive an access token. Also sets a `refreshToken` HttpOnly cookie.

**Request body**
```json
{
  "email": "alice@example.com",
  "password": "s3cr3t!"
}
```

**Responses**

| Status | Body | Condition |
|---|---|---|
| `200 OK` | `{ "accessToken": "...", "expiresIn": 900 }` + `Set-Cookie: refreshToken=…` | Success (access token TTL: 15 min) |
| `401 Unauthorized` | `{ "message": "Invalid credentials" }` | Wrong email or password |

---

### POST `/api/v1/auth/refresh`

Exchange the refresh token cookie for a new access token. The old refresh token is invalidated and a new one is issued (rotation).

**Request body**: none — refresh token is read from the `refreshToken` HttpOnly cookie.

**Responses**

| Status | Body | Condition |
|---|---|---|
| `200 OK` | `{ "accessToken": "...", "expiresIn": 900 }` + `Set-Cookie: refreshToken=…` | Token rotated successfully |
| `401 Unauthorized` | `{ "message": "Invalid or expired refresh token" }` | Cookie missing, invalid, or already rotated |

---

## Scoreboard

### GET `/api/v1/leaderboard`

Fetch the current top-10 accounts by score. Data served from Redis Sorted Set — O(K log N) read.

**Responses**

| Status | Body |
|---|---|
| `200 OK` | `{ "rankings": [{ "rank": 1, "username": "alice", "score": 500 }, ...] }` |

---

## Actions

### POST `/api/v1/actions` *(protected)*

Mark an action as completed for the authenticated account. Atomically updates `action_log` and `score_ledger`, then publishes a Redis notification.

**Headers**
```
Authorization: Bearer <access_token>
```

**Request body**
```json
{
  "actionId": 3
}
```

**Responses**

| Status | Body | Condition |
|---|---|---|
| `200 OK` | `{ "success": true, "newScore": 350 }` | Action recorded |
| `400 Bad Request` | `{ "message": "Unknown action" }` | `actionId` not found or retired |
| `401 Unauthorized` | — | Missing or expired token |
| `422 Unprocessable Entity` | `{ "issues": [...] }` | Validation failed |

---

## WebSocket

### `ws://localhost:3000/api/v1/ws`

Upgrade connection for live scoreboard updates.

**Authentication**: Pass the JWT as a query parameter or in the `Authorization` header on the HTTP upgrade request.

```
ws://localhost:3000/api/v1/ws?token=<access_token>
```

**Server → Client message (pushed on every score change)**
```json
{
  "type": "scoreboard.updated",
  "rankings": [
    { "rank": 1, "username": "alice", "score": 500 },
    { "rank": 2, "username": "bob",   "score": 420 }
  ]
}
```

**Close codes**

| Code | Meaning |
|---|---|
| `4401` | Unauthorised — invalid or missing token |
| `1000` | Normal closure |
