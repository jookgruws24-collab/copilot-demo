import crypto from 'crypto';
import { execute, queryOne } from '../db/client';
import type { Session, SessionCreate, Employee } from '@/types/database';

const SESSION_DURATION_HOURS = 24 * 7; // 7 days

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new session for an employee
 */
export function createSession(employeeId: number): Session {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS);

  const sessionData: SessionCreate = {
    employee_id: employeeId,
    token,
    expires_at: expiresAt.toISOString(),
  };

  // Clean up any existing sessions for this employee (optional)
  execute('DELETE FROM sessions WHERE employee_id = ?', [employeeId]);

  const result = execute(
    'INSERT INTO sessions (employee_id, token, expires_at) VALUES (?, ?, ?)',
    [sessionData.employee_id, sessionData.token, sessionData.expires_at]
  );

  return {
    id: result.lastInsertRowid as number,
    ...sessionData,
    created_at: new Date().toISOString(),
  };
}

/**
 * Get a session by token
 */
export function getSessionByToken(token: string): Session | undefined {
  const session = queryOne<Session>(
    'SELECT * FROM sessions WHERE token = ? AND datetime(expires_at) > datetime("now")',
    [token]
  );
  
  // Additional check: if session exists but might be expired, verify manually
  if (session) {
    const expiresAt = new Date(session.expires_at);
    const now = new Date();
    if (expiresAt <= now) {
      // Session is expired, clean it up
      execute('DELETE FROM sessions WHERE token = ?', [token]);
      return undefined;
    }
  }
  
  return session;
}

/**
 * Delete a session by token (logout)
 */
export function deleteSession(token: string): void {
  execute('DELETE FROM sessions WHERE token = ?', [token]);
}

/**
 * Delete all sessions for an employee
 */
export function deleteAllSessions(employeeId: number): void {
  execute('DELETE FROM sessions WHERE employee_id = ?', [employeeId]);
}

/**
 * Clean up expired sessions
 */
export function cleanupExpiredSessions(): void {
  execute('DELETE FROM sessions WHERE expires_at <= datetime("now")');
}

/**
 * Validate session and return employee if valid
 */
export function validateSession(token: string): Employee | null {
  const session = getSessionByToken(token);
  if (!session) {
    return null;
  }

  const employee = queryOne<Employee>(
    'SELECT * FROM employees WHERE id = ?',
    [session.employee_id]
  );

  return employee || null;
}

/**
 * Refresh session expiration
 */
export function refreshSession(token: string): boolean {
  const session = getSessionByToken(token);
  if (!session) {
    return false;
  }

  const newExpiresAt = new Date();
  newExpiresAt.setHours(newExpiresAt.getHours() + SESSION_DURATION_HOURS);

  execute(
    'UPDATE sessions SET expires_at = ? WHERE token = ?',
    [newExpiresAt.toISOString(), token]
  );

  return true;
}
