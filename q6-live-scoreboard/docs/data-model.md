# Data Model

## PostgreSQL Tables

### `accounts`

Stores user credentials and profile information.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `SERIAL` | PRIMARY KEY | Auto-incrementing surrogate key |
| `username` | `VARCHAR(100)` | UNIQUE, NOT NULL | Public display name |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Login identifier |
| `password_hash` | `TEXT` | NOT NULL | bcrypt hash (cost factor 12) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | — | Updated via trigger |
| `deleted_at` | `TIMESTAMPTZ` | — | Soft delete; NULL means active |

```sql
CREATE TABLE accounts (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ,
  deleted_at    TIMESTAMPTZ
);
```

---

### `actions`

Catalogue of trackable activities. Each action has a point value.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `SERIAL` | PRIMARY KEY | |
| `slug` | `VARCHAR(100)` | UNIQUE, NOT NULL | Machine-readable identifier (e.g. `daily-login`) |
| `label` | `VARCHAR(255)` | NOT NULL | Human-readable name |
| `point_value` | `INTEGER` | NOT NULL, CHECK > 0 | Points awarded per completion |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | |
| `retired_at` | `TIMESTAMPTZ` | — | When the action was deactivated |

```sql
CREATE TABLE actions (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  label       VARCHAR(255) NOT NULL,
  point_value INTEGER NOT NULL CHECK (point_value > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  retired_at  TIMESTAMPTZ
);
```

---

### `action_log`

Immutable record of every action completed by every account.

> **Design note:** No uniqueness constraint on `(account_id, action_id)` — accounts may complete the same action multiple times (e.g. daily login, repeated purchases).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `SERIAL` | PRIMARY KEY | |
| `account_id` | `INTEGER` | FK → accounts(id), NOT NULL | |
| `action_id` | `INTEGER` | FK → actions(id), NOT NULL | |
| `points_earned` | `INTEGER` | NOT NULL | Snapshot of `point_value` at the time of completion |
| `completed_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | |

```sql
CREATE TABLE action_log (
  id            SERIAL PRIMARY KEY,
  account_id    INTEGER NOT NULL REFERENCES accounts(id),
  action_id     INTEGER NOT NULL REFERENCES actions(id),
  points_earned INTEGER NOT NULL,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON action_log (account_id);
```

---

### `score_ledger`

Denormalised running score per account. Updated atomically with each `action_log` insert.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `account_id` | `INTEGER` | PK, FK → accounts(id) | One row per account — account_id is both the PK and the FK |
| `total_points` | `INTEGER` | NOT NULL, DEFAULT 0 | Cumulative score |
| `last_activity_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Timestamp of most recent score change |

```sql
CREATE TABLE score_ledger (
  account_id       INTEGER PRIMARY KEY REFERENCES accounts(id),
  total_points     INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### `refresh_tokens`

Stores hashed refresh tokens for session continuity. Each row represents one active or revoked token.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `SERIAL` | PRIMARY KEY | |
| `account_id` | `INTEGER` | FK → accounts(id), NOT NULL | Owner of the token |
| `token_hash` | `TEXT` | NOT NULL, UNIQUE | `sha256` of the opaque token sent to the client |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL | Absolute expiry; typically 30 days from issuance |
| `revoked_at` | `TIMESTAMPTZ` | — | Set on use (rotation) or explicit sign-out; NULL means valid |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | |

```sql
CREATE TABLE refresh_tokens (
  id          SERIAL PRIMARY KEY,
  account_id  INTEGER NOT NULL REFERENCES accounts(id),
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON refresh_tokens (account_id);
```

---

## Redis Structures

### Sorted Set — `leaderboard`

| Command | Purpose |
|---|---|
| `ZADD leaderboard {score} {accountId}` | Upsert an account's score |
| `ZREVRANGE leaderboard 0 9 WITHSCORES` | Fetch top-10 in descending order |
| `ZSCORE leaderboard {accountId}` | Read a single account's score |

### Pub/Sub Channel — `scoreboard:refresh`

Published with a JSON payload `{ "accountId": number }` after every score update. All server instances subscribe and trigger a top-10 broadcast to their local WebSocket clients.
