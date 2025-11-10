import crypto from 'crypto';

// Characters to use for code generation (excluding ambiguous characters)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

/**
 * Generate a random 8-character alphanumeric invitation code
 * Excludes ambiguous characters: 0, O, 1, I, l
 */
export function generateInvitationCode(): string {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let code = '';
  
  for (let i = 0; i < CODE_LENGTH; i++) {
    const index = bytes[i] % CODE_CHARS.length;
    code += CODE_CHARS[index];
  }
  
  return code;
}

/**
 * Format invitation code for display (adds hyphen in middle)
 * @example "ABCD1234" -> "ABCD-1234"
 */
export function formatInvitationCode(code: string): string {
  if (code.length !== CODE_LENGTH) return code;
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/**
 * Clean invitation code (remove hyphens and whitespace, uppercase)
 */
export function cleanInvitationCode(code: string): string {
  return code.replace(/[-\s]/g, '').toUpperCase();
}

/**
 * Validate invitation code format
 */
export function isValidCodeFormat(code: string): boolean {
  const cleaned = cleanInvitationCode(code);
  return cleaned.length === CODE_LENGTH && /^[A-Z0-9]+$/.test(cleaned);
}
