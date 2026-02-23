# System Overview

## Objectives

1. Display a real-time top-10 leaderboard ranked by total score
2. Push live score updates to all connected clients the moment a score changes
3. Allow authenticated users to complete tracked actions that increase their score
4. Prevent unauthorised score manipulation through JWT authentication and rate limiting

## High-Level Architecture

```
┌──────────────┐    HTTP/WS     ┌─────────────────────────┐
│   Browser    │◄──────────────►│   API Server (Fastify)  │
└──────────────┘                │                         │
                                │  ┌─────────────────┐   │
                                │  │  Auth Guard     │   │
                                │  └────────┬────────┘   │
                                │           │            │
                                │  ┌────────▼────────┐   │
                                │  │  Route Handlers │   │
                                │  └──┬──────────┬───┘   │
                                └─────┼──────────┼───────┘
                                      │          │
                              ┌───────▼──┐  ┌────▼──────┐
                              │PostgreSQL│  │   Redis   │
                              │  (RDS)   │  │(Cache+PS) │
                              └──────────┘  └───────────┘
```

## Components

### API Server
A single long-running Node.js process built with **Fastify v5**. Handles:
- REST endpoints for auth and score actions
- WebSocket connections for live scoreboard delivery
- Redis subscription to `scoreboard:refresh` channel

### PostgreSQL
Source of truth for:
- Account records (credentials, profile)
- Action definitions (slug, point value)
- Action log (history of completed actions per account)
- Score ledger (denormalised running total per account)

### Redis
Serves two roles:
1. **Leaderboard cache** — Redis Sorted Set (`ZADD` / `ZREVRANGE`) for O(log N) score writes and O(K log N) top-K reads
2. **Pub/Sub broker** — `PUBLISH scoreboard:refresh` triggers all server instances to push the updated top-10 to their local WebSocket clients

## Score Update Lifecycle

```
User completes action
        │
        ▼
┌───────────────────┐
│ Write to Postgres │ ← atomic transaction: add action_log row + update score_ledger
└────────┬──────────┘
         │
         ▼
┌─────────────────────┐
│ ZADD leaderboard    │ ← upsert account score in Redis Sorted Set
└────────┬────────────┘
         │
         ▼
┌──────────────────────────┐
│ PUBLISH scoreboard:      │ ← fire-and-forget notification
│   refresh {accountId}   │
└────────┬─────────────────┘
         │  (all server instances subscribe)
         ▼
┌────────────────────────────┐
│ ZREVRANGE leaderboard 0 9  │ ← fetch current top-10
└────────┬───────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Broadcast to WS connections  │ ← push to every open socket on this instance
└──────────────────────────────┘
```
