# Security

## Authentication — JWT (RS256)

Access tokens are signed with an **RSA-256 asymmetric key pair**:

- The private key signs tokens on the server; the public key verifies them
- Token TTL: **15 minutes** — short-lived to limit the damage of token leakage
- A separate **refresh token** (opaque, stored in an `HttpOnly` cookie) is used to obtain new access tokens without re-entering credentials
- Refresh tokens are rotated on each use (rotation invalidates the previous token)

Why RS256 over HS256:
- The public key can be distributed to external services (e.g. a separate microservice) without sharing the signing secret
- A compromised public key cannot forge tokens

---

## Rate Limiting

Applied at the route level via `@fastify/rate-limit`:

| Endpoint | Limit | Window |
|---|---|---|
| `POST /api/v1/auth/signup` | 3 req | per 10 min per IP |
| `POST /api/v1/auth/signin` | 5 req | per 1 min per IP |
| `POST /api/v1/actions` | 30 req | per 1 min per authenticated account |
| `GET /api/v1/leaderboard` | 60 req | per 1 min per IP |

Responses exceeding the limit receive `429 Too Many Requests`.

---

## Input Validation

All incoming payloads are validated with **Valibot** schemas before any business logic runs:

- String fields enforce `minLength` and `maxLength` to prevent oversized payloads
- Email fields are validated for RFC-5322 format
- Numeric IDs are coerced and checked to be positive integers
- Unknown/extra fields are stripped (Valibot's `object()` ignores unknown keys by default)

Prisma's parameterised queries prevent SQL injection at the database layer.

---

## Password Storage

Passwords are hashed with **bcrypt** at cost factor **12** before being stored. Plain-text passwords are never written to logs, databases, or any persistent store.

---

## WebSocket Security

- JWT must be provided on the HTTP upgrade request (query param `?token=` or `Authorization` header)
- Unauthenticated upgrade attempts are rejected with close code `4401` before the WebSocket is established
- The server does not accept any incoming messages from clients over the WebSocket — it is a **push-only** channel

---

## CORS

`@fastify/cors` is configured to:
- Allow only trusted origins (configured via environment variable `ALLOWED_ORIGINS`)
- Reject cross-origin requests from unknown origins in production

---

## Secrets Management

| Secret | Storage |
|---|---|
| RSA private key | Environment variable `JWT_PRIVATE_KEY` (PEM, base64-encoded) |
| RSA public key | Environment variable `JWT_PUBLIC_KEY` |
| Database URL | Environment variable `DATABASE_URL` |
| Redis URL | Environment variable `REDIS_URL` |

No secrets are committed to source control. A `.env.example` file documents required variables without values.
