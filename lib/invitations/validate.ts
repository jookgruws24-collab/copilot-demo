import { queryOne } from '../db/client';
import type { InvitationCode, InvitationCodeValidation } from '@/types/invitation';
import { cleanInvitationCode, isValidCodeFormat } from './generate';

/**
 * Validate an invitation code
 * Returns validation result with code details if valid
 */
export function validateInvitationCode(code: string): InvitationCodeValidation {
  // Clean and validate format
  const cleanedCode = cleanInvitationCode(code);
  
  if (!isValidCodeFormat(cleanedCode)) {
    return {
      valid: false,
      error: 'Invalid code format. Code must be 8 alphanumeric characters.',
    };
  }

  // Check if code exists and is active
  const invitationCode = queryOne<InvitationCode>(
    'SELECT * FROM invitation_codes WHERE code = ? AND is_active = 1',
    [cleanedCode]
  );

  if (!invitationCode) {
    return {
      valid: false,
      error: 'Invalid or inactive invitation code.',
    };
  }

  return {
    valid: true,
    code: invitationCode,
  };
}

/**
 * Check if invitation code exists (without validation)
 */
export function codeExists(code: string): boolean {
  const cleanedCode = cleanInvitationCode(code);
  const result = queryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM invitation_codes WHERE code = ?',
    [cleanedCode]
  );
  return (result?.count ?? 0) > 0;
}

/**
 * Get invitation code by ID
 */
export function getInvitationCodeById(id: number): InvitationCode | undefined {
  return queryOne<InvitationCode>(
    'SELECT * FROM invitation_codes WHERE id = ?',
    [id]
  );
}

/**
 * Get invitation code by code string
 */
export function getInvitationCodeByCode(code: string): InvitationCode | undefined {
  const cleanedCode = cleanInvitationCode(code);
  return queryOne<InvitationCode>(
    'SELECT * FROM invitation_codes WHERE code = ?',
    [cleanedCode]
  );
}
