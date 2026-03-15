-- ══════════════════════════════════════════════════════════════════
-- MULTI-TENANT TIPAGENT SCHEMA
-- ══════════════════════════════════════════════════════════════════

-- Platform users (anyone who signs up via GitHub OAuth)
CREATE TABLE IF NOT EXISTS users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id       TEXT    NOT NULL UNIQUE,
  github_username TEXT    NOT NULL,
  github_token    TEXT,                          -- GitHub access token for API calls
  display_name    TEXT,
  avatar_url      TEXT,
  wallet_addr     TEXT,                          -- user's wallet to receive tips
  chain           TEXT    NOT NULL DEFAULT 'base',
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

-- Projects registered by users (GitHub repos they want to enable tipping)
CREATE TABLE IF NOT EXISTS projects (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id        INTEGER NOT NULL REFERENCES users(id),
  github_repo     TEXT    NOT NULL UNIQUE,       -- e.g. "owner/repo"
  webhook_secret  TEXT    NOT NULL,              -- unique per project
  webhook_id      INTEGER,                       -- GitHub webhook ID (auto-registered)
  wallet_address  TEXT    NOT NULL,              -- HD-derived wallet for this project
  is_active       INTEGER NOT NULL DEFAULT 1,
  -- Tip rules (configurable per project)
  tip_min_usdt    TEXT    NOT NULL DEFAULT '0.5',
  tip_max_usdt    TEXT    NOT NULL DEFAULT '50',
  daily_cap       TEXT    NOT NULL DEFAULT '100',
  cooldown_hours  TEXT    NOT NULL DEFAULT '1',
  -- Task descriptions for AI evaluation
  tasks           TEXT,                          -- Owner's description of work to be done
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

-- Project treasury: each project has its own USDT balance
CREATE TABLE IF NOT EXISTS project_treasuries (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id      INTEGER NOT NULL UNIQUE REFERENCES projects(id),
  balance_usdt    TEXT    NOT NULL DEFAULT '0',  -- available for tips
  aave_usdt       TEXT    NOT NULL DEFAULT '0',  -- deposited in Aave
  total_deposited TEXT    NOT NULL DEFAULT '0',  -- lifetime deposits
  total_tipped    TEXT    NOT NULL DEFAULT '0',  -- lifetime tips sent
  updated_at      INTEGER NOT NULL
);

-- Deposit history: when project owners fund their treasury
CREATE TABLE IF NOT EXISTS deposits (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id      INTEGER NOT NULL REFERENCES projects(id),
  amount_usdt     TEXT    NOT NULL,
  tx_hash         TEXT    NOT NULL,
  from_addr       TEXT    NOT NULL,
  status          TEXT    NOT NULL DEFAULT 'pending', -- pending/confirmed/failed
  created_at      INTEGER NOT NULL,
  confirmed_at    INTEGER
);

-- Tip history (now linked to project)
CREATE TABLE IF NOT EXISTS tip_history (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id      INTEGER NOT NULL REFERENCES projects(id),
  event_id        TEXT    NOT NULL UNIQUE,
  source          TEXT    NOT NULL,
  event_type      TEXT    NOT NULL,
  recipient_id    TEXT    NOT NULL,              -- GitHub username
  recipient_addr  TEXT    NOT NULL,
  amount_usdt     TEXT    NOT NULL,
  reasoning       TEXT,
  tx_hash         TEXT,
  chain           TEXT    NOT NULL DEFAULT 'base',
  status          TEXT    NOT NULL DEFAULT 'pending',
  created_at      INTEGER NOT NULL,
  confirmed_at    INTEGER,
  error_msg       TEXT
);

-- Rate limits: cooldown + daily cap (per project + user)
CREATE TABLE IF NOT EXISTS rate_limits (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  key        TEXT    NOT NULL UNIQUE,
  value      TEXT    NOT NULL,
  expires_at INTEGER NOT NULL
);

-- Event audit log (now linked to project)
CREATE TABLE IF NOT EXISTS event_audit (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id    INTEGER REFERENCES projects(id),
  event_id      TEXT    NOT NULL,
  source        TEXT    NOT NULL,
  event_type    TEXT    NOT NULL,
  result        TEXT    NOT NULL,
  reject_reason TEXT,
  raw_payload   TEXT    NOT NULL,
  created_at    INTEGER NOT NULL
);

-- Treasury snapshots (per project)
CREATE TABLE IF NOT EXISTS treasury_snapshots (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id  INTEGER NOT NULL REFERENCES projects(id),
  liquid_usdt TEXT    NOT NULL,
  aave_usdt   TEXT    NOT NULL,
  total_usdt  TEXT    NOT NULL,
  aave_apy    TEXT,
  snapshot_at INTEGER NOT NULL
);

-- Sessions for auth
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT    PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  expires_at  INTEGER NOT NULL,
  created_at  INTEGER NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_github ON users(github_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_repo ON projects(github_repo);
CREATE INDEX IF NOT EXISTS idx_tip_project ON tip_history(project_id);
CREATE INDEX IF NOT EXISTS idx_tip_recipient ON tip_history(recipient_id);
CREATE INDEX IF NOT EXISTS idx_tip_created ON tip_history(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_key ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_expires ON rate_limits(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_project ON deposits(project_id);
