-- ══════════════════════════════════════════════════════
--  DYnoGix — MySQL Database Schema
--  Version: 1.0.0
-- ══════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS dynogix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dynogix;

-- ─── Users ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin','manager','user') NOT NULL DEFAULT 'user',
  status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
  avatar_url  VARCHAR(500),
  timezone    VARCHAR(50) DEFAULT 'UTC',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role  (role)
) ENGINE=InnoDB;

-- ─── Roles & Permissions ──────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name        VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  color       VARCHAR(7) DEFAULT '#7F5AF0',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS permissions (
  id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  role_id     VARCHAR(36) NOT NULL,
  permission  VARCHAR(100) NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE KEY uq_role_perm (role_id, permission)
) ENGINE=InnoDB;

-- ─── Workflow Engine ──────────────────────────────────
CREATE TABLE IF NOT EXISTS workflow_configs (
  id              VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  type            VARCHAR(50) NOT NULL UNIQUE,
  states          JSON NOT NULL,
  transitions     JSON NOT NULL,
  initial_state   VARCHAR(50) NOT NULL,
  terminal_states JSON NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── Issues ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS issues (
  id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  ref_id      VARCHAR(20) NOT NULL UNIQUE,  -- ISS-001 style
  title       VARCHAR(500) NOT NULL,
  description TEXT,
  status      VARCHAR(50) NOT NULL DEFAULT 'open',
  priority    ENUM('critical','high','medium','low') NOT NULL DEFAULT 'medium',
  assignee_id VARCHAR(36),
  tags        JSON,
  created_by  VARCHAR(36) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by)  REFERENCES users(id),
  INDEX idx_status   (status),
  INDEX idx_priority (priority),
  INDEX idx_assignee (assignee_id)
) ENGINE=InnoDB;

-- ─── Issue Comments ───────────────────────────────────
CREATE TABLE IF NOT EXISTS issue_comments (
  id         VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issue_id   VARCHAR(36) NOT NULL,
  author_id  VARCHAR(36) NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id)  REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ─── Assets ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets (
  id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  ref_id      VARCHAR(20) NOT NULL UNIQUE,  -- AST-001 style
  name        VARCHAR(255) NOT NULL,
  type        ENUM('laptop','server','monitor','phone','storage','other') NOT NULL,
  status      VARCHAR(50) NOT NULL DEFAULT 'available',
  assignee_id VARCHAR(36),
  serial      VARCHAR(100),
  value       DECIMAL(10,2) DEFAULT 0,
  location    VARCHAR(255),
  acquired_at DATE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_type   (type)
) ENGINE=InnoDB;

-- ─── Audit Logs ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  actor       VARCHAR(100) NOT NULL,
  actor_id    VARCHAR(36),
  action      ENUM('CREATE','UPDATE','DELETE','TRANSITION','ASSIGN','LOGIN','LOGOUT','ROLE_CHANGE') NOT NULL,
  module      VARCHAR(50) NOT NULL,
  entity_id   VARCHAR(100),
  detail      TEXT,
  ip_address  VARCHAR(45),
  before_data JSON,
  after_data  JSON,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_action    (action),
  INDEX idx_module    (module),
  INDEX idx_actor_id  (actor_id),
  INDEX idx_entity    (entity_id),
  INDEX idx_created   (created_at)
) ENGINE=InnoDB;

-- ─── Workflow History ─────────────────────────────────
CREATE TABLE IF NOT EXISTS workflow_history (
  id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  module      VARCHAR(50) NOT NULL,
  entity_id   VARCHAR(36) NOT NULL,
  from_state  VARCHAR(50) NOT NULL,
  to_state    VARCHAR(50) NOT NULL,
  actor_id    VARCHAR(36),
  note        TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_entity (module, entity_id),
  INDEX idx_states (from_state, to_state)
) ENGINE=InnoDB;

-- ─── Notifications ────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id     VARCHAR(36) NOT NULL,
  type        VARCHAR(50) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  message     TEXT,
  is_read     BOOLEAN DEFAULT FALSE,
  entity_ref  VARCHAR(100),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user   (user_id),
  INDEX idx_unread (user_id, is_read)
) ENGINE=InnoDB;

-- ─── Seed Default Roles ───────────────────────────────
INSERT IGNORE INTO roles (id, name, description, color) VALUES
  ('role-admin',   'Admin',   'Full system access, unrestricted', '#FBBF24'),
  ('role-manager', 'Manager', 'Team-level access, can manage users', '#7F5AF0'),
  ('role-user',    'User',    'Personal access, limited visibility', '#2CB67D');

INSERT IGNORE INTO permissions (role_id, permission) VALUES
  ('role-admin','issues.view'),('role-admin','issues.create'),('role-admin','issues.update'),
  ('role-admin','issues.delete'),('role-admin','issues.assign'),('role-admin','assets.view'),
  ('role-admin','assets.manage'),('role-admin','audit.view'),('role-admin','roles.manage'),
  ('role-admin','users.manage'),('role-admin','analytics.view'),('role-admin','workflows.configure'),
  ('role-manager','issues.view'),('role-manager','issues.create'),('role-manager','issues.update'),
  ('role-manager','issues.assign'),('role-manager','assets.view'),('role-manager','assets.manage'),
  ('role-manager','audit.view'),('role-manager','analytics.view'),
  ('role-user','issues.view'),('role-user','issues.create'),('role-user','issues.update'),
  ('role-user','assets.view'),('role-user','analytics.view');

-- ─── Seed Workflow Configs ────────────────────────────
INSERT IGNORE INTO workflow_configs (type, states, transitions, initial_state, terminal_states) VALUES
  ('issue',
   '["open","in_progress","resolved","closed"]',
   '{"open":["in_progress"],"in_progress":["resolved","open"],"resolved":["closed","in_progress"],"closed":[]}',
   'open', '["closed"]'),
  ('asset',
   '["available","assigned","in_use","maintenance","retired"]',
   '{"available":["assigned"],"assigned":["in_use","available"],"in_use":["available","maintenance"],"maintenance":["available","retired"],"retired":[]}',
   'available', '["retired"]');

-- ─── Seed Demo Users ──────────────────────────────────
-- Passwords are all: password123 (bcrypt hashed)
INSERT IGNORE INTO users (id, name, email, password, role) VALUES
  ('usr-admin-001', 'Admin User',  'admin@dynogix.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
  ('usr-mgr-001',   'Sarah Chen',  'sarah@dynogix.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'manager'),
  ('usr-user-001',  'James Park',  'james@dynogix.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user'),
  ('usr-user-002',  'Maya Patel',  'maya@dynogix.com',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'manager'),
  ('usr-user-003',  'Alex Turner', 'alex@dynogix.com',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user');
