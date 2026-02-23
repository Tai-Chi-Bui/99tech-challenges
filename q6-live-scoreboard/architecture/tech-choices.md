# Architecture Decision Records

## ADR-001: Containerised Service over Serverless Functions

**Decision**: Run a long-lived Node.js container, not serverless functions.

**Context**: The system must hold open WebSocket connections to push live updates. Serverless functions (AWS Lambda, Cloudflare Workers) are invocation-scoped — they terminate after returning a response and cannot maintain persistent socket state between invocations.

**Consequence**: Each container instance manages an in-memory map of active WebSocket connections. Horizontal scaling is handled by Redis Pub/Sub fan-out: when any instance publishes a `scoreboard:refresh` event, all instances receive it and push to their own local connections.

---

## ADR-002: Redis Sorted Sets for the Leaderboard

**Decision**: Use a Redis Sorted Set (`ZADD` / `ZREVRANGE`) as the leaderboard cache.

**Context**: The top-10 query must be fast and served on every WebSocket push event. A full `SELECT … ORDER BY … LIMIT 10` against PostgreSQL on every score update would be expensive under load.

**Rationale**: Redis Sorted Sets are the canonical data structure for leaderboards:
- `ZADD leaderboard {score} {member}` — O(log N) write
- `ZREVRANGE leaderboard 0 9 WITHSCORES` — O(K log N) read (K = 10, effectively constant)
- In-memory — sub-millisecond latency

This replaces a dedicated caching layer (e.g. DynamoDB) with a single Redis instance that serves both the cache and the Pub/Sub roles.

---

## ADR-003: Redis Pub/Sub for Fan-Out

**Decision**: Use Redis `PUBLISH` / `SUBSCRIBE` for broadcasting score update notifications.

**Context**: After a score is written, all WebSocket clients must receive the updated leaderboard within milliseconds.

**Rationale**: Pub/Sub is fire-and-forget fan-out. When a score changes:
1. The handler publishes `scoreboard:refresh` to Redis
2. Every server instance subscribed to that channel wakes up immediately
3. Each instance fetches the top-10 from Redis and pushes to its own WebSocket clients

This achieves millisecond-level delivery without a queue (SQS, Kafka) or polling. Queue semantics — ordering guarantees, at-least-once delivery, dead-letter handling — are not needed for a broadcast notification where a missed delivery simply means the client waits for the next one.

---

## ADR-004: Fastify v5 over Express

**Decision**: Use Fastify v5 as the HTTP and WebSocket framework.

**Context**: The API needs HTTP routing, WebSocket support, request logging, and error handling.

**Rationale**: Fastify provides all of these natively:
- Built-in **Pino** logger — no morgan or custom logger setup
- Native **async error propagation** — no `express-async-errors` patch needed
- `@fastify/websocket` plugin for WebSocket support alongside REST routes
- Plugin encapsulation model — each feature is a self-contained plugin
- ~15% higher throughput than Express for JSON APIs (Fastify benchmark)

---

## ADR-005: JWT with RS256 Asymmetric Signing

**Decision**: Sign JWTs with RSA-256 (asymmetric) instead of HMAC-256 (symmetric).

**Context**: The system may later split into multiple services (e.g. a separate notification service).

**Rationale**: With RS256, the public key can be shared with any consumer service for token verification without exposing the signing secret. HS256 would require sharing the secret with every verifying service, increasing the blast radius of a key leak. Token TTL is 15 minutes; a refresh token pattern handles session continuity.

---

## ADR-006: Prisma 6 as the ORM

**Decision**: Use Prisma 6 with a `schema.prisma` schema file.

**Context**: The data model is defined once and the ORM must provide a fully typed client.

**Rationale**: Prisma's schema DSL is the single source of truth — migrations and the TypeScript client are both generated from it. The generated client is fully typed: `db.member.findUnique(...)` returns `Member | null`, not `unknown`. Prisma 6 is the TypeScript-native release (no Rust engine binary), which simplifies Docker image builds.
