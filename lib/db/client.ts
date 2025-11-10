import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'lib', 'db', 'copilot-demo.db');

// Ensure db directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
const db = new Database(DB_PATH, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Connection pool simulation (better-sqlite3 is synchronous)
export function getDatabase(): Database.Database {
  return db;
}

// Helper to run queries with error handling
export function query<T>(sql: string, params?: unknown[]): T[] {
  try {
    const stmt = db.prepare(sql);
    return params ? stmt.all(...params) as T[] : stmt.all() as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper to run a single query and get one result
export function queryOne<T>(sql: string, params?: unknown[]): T | undefined {
  try {
    const stmt = db.prepare(sql);
    return params ? stmt.get(...params) as T : stmt.get() as T;
  } catch (error) {
    console.error('Database queryOne error:', error);
    throw error;
  }
}

// Helper to execute a statement (INSERT, UPDATE, DELETE)
export function execute(sql: string, params?: unknown[]): Database.RunResult {
  try {
    const stmt = db.prepare(sql);
    return params ? stmt.run(...params) : stmt.run();
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

// Transaction helper
export function transaction<T>(callback: () => T): T {
  const txn = db.transaction(callback);
  return txn();
}

// Close database connection (for cleanup)
export function closeDatabase(): void {
  db.close();
}

export default db;
