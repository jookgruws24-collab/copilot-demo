-- Employee Achievement and Rewards System - Initial Schema
-- SQLite Database Migration 001
-- Date: 2025-11-10

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================================================
-- Table 1: employees
-- ============================================================================
CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  contact TEXT NOT NULL,
  address TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  diamond_balance INTEGER NOT NULL DEFAULT 0,
  invitation_code_used TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  CHECK (role IN ('user', 'admin', 'hr')),
  CHECK (diamond_balance >= 0)
);

CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_invitation_code ON employees(invitation_code_used);

-- ============================================================================
-- Table 2: invitation_codes
-- ============================================================================
CREATE TABLE invitation_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  label TEXT,
  created_by INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (created_by) REFERENCES employees(id),
  CHECK (is_active IN (0, 1))
);

CREATE INDEX idx_invitation_codes_code ON invitation_codes(code);
CREATE INDEX idx_invitation_codes_active ON invitation_codes(is_active);
CREATE INDEX idx_invitation_codes_created_by ON invitation_codes(created_by);

-- ============================================================================
-- Table 3: sessions
-- ============================================================================
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_employee ON sessions(employee_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ============================================================================
-- Table 4: achievements
-- ============================================================================
CREATE TABLE achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  conditions TEXT NOT NULL,
  diamond_reward INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  created_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (created_by) REFERENCES employees(id),
  CHECK (diamond_reward > 0),
  CHECK (end_date > start_date)
);

CREATE INDEX idx_achievements_dates ON achievements(start_date, end_date);
CREATE INDEX idx_achievements_created_by ON achievements(created_by);

-- ============================================================================
-- Table 5: achievement_progress
-- ============================================================================
CREATE TABLE achievement_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  achievement_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'on_doing',
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  claimed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  CHECK (status IN ('upcoming', 'on_doing', 'completed', 'claimed')),
  CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  UNIQUE(employee_id, achievement_id)
);

CREATE INDEX idx_progress_employee ON achievement_progress(employee_id);
CREATE INDEX idx_progress_achievement ON achievement_progress(achievement_id);
CREATE INDEX idx_progress_status ON achievement_progress(employee_id, status);

-- ============================================================================
-- Table 6: products
-- ============================================================================
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  diamond_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  CHECK (diamond_price > 0),
  CHECK (quantity >= 0)
);

CREATE INDEX idx_products_price ON products(diamond_price);

-- ============================================================================
-- Table 7: purchases
-- ============================================================================
CREATE TABLE purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  diamond_cost INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  approved_by INTEGER,
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (approved_by) REFERENCES employees(id),
  CHECK (status IN ('pending', 'accepted', 'rejected')),
  CHECK (diamond_cost > 0)
);

CREATE INDEX idx_purchases_employee ON purchases(employee_id);
CREATE INDEX idx_purchases_status ON purchases(status, created_at DESC);
CREATE INDEX idx_purchases_approved_by ON purchases(approved_by);

-- ============================================================================
-- Table 8: history
-- ============================================================================
CREATE TABLE history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  employee_name TEXT NOT NULL,
  type TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  diamonds INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  CHECK (type IN ('claim', 'purchase')),
  CHECK (action IN ('created', 'approved', 'rejected', 'claimed'))
);

CREATE INDEX idx_history_employee ON history(employee_id, created_at DESC);
CREATE INDEX idx_history_type ON history(type, created_at DESC);
CREATE INDEX idx_history_created_at ON history(created_at DESC);
CREATE INDEX idx_history_search ON history(employee_name, details);

-- ============================================================================
-- Schema Version Tracking
-- ============================================================================
CREATE TABLE schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO schema_version (version) VALUES (1);

-- ============================================================================
-- Migration Complete
-- ============================================================================
