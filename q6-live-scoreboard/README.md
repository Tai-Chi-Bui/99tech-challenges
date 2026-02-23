# Live Scoreboard — System Design

A real-time leaderboard API that tracks player scores and pushes live updates to all connected clients via WebSocket.

## Quick Links

- [System Overview](docs/overview.md)
- [Data Model](docs/data-model.md)
- [API Reference](docs/api-reference.md)
- [Security](docs/security.md)
- [Architecture Decisions](architecture/tech-choices.md)

## Flow Diagrams (Mermaid)

| File | Description |
|---|---|
| [flows/user-signup.mmd](flows/user-signup.mmd) | Account registration |
| [flows/user-signin.mmd](flows/user-signin.mmd) | Authentication and token issuance |
| [flows/token-refresh.mmd](flows/token-refresh.mmd) | Access token refresh via refresh token rotation |
| [flows/complete-action.mmd](flows/complete-action.mmd) | Score update triggered by a user action |
| [flows/broadcast-update.mmd](flows/broadcast-update.mmd) | Redis Pub/Sub fan-out to WebSocket clients |
| [flows/websocket-connection.mmd](flows/websocket-connection.mmd) | WebSocket lifecycle and live push |

Render `.mmd` files at [mermaid.live](https://mermaid.live) or with any Mermaid-compatible viewer.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| HTTP + WebSocket | Fastify v5 + @fastify/websocket | Native async, Pino logging, plugin model |
| ORM | Prisma 6 | Schema-first with typed client |
| Cache + Pub/Sub | Redis | Sorted Sets for leaderboard, Pub/Sub for fan-out |
| Auth | JWT (RS256) | Asymmetric signing, stateless |
| Deployment | Docker containers | WebSocket connections require long-lived processes |

## Setup

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Install dependencies
npm install

# 3. Apply schema
npm run db:push

# 4. Start server
npm run dev
```
