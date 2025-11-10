import type { ID, Timestamp } from './common';

// Invitation Code Types
export interface InvitationCode {
  id: ID;
  code: string;
  label: string | null;
  created_by: ID;
  is_active: number; // SQLite boolean: 0 or 1
  created_at: Timestamp;
}

export type InvitationCodeCreate = {
  label?: string;
  created_by: ID;
};

export interface InvitationCodeWithUsage extends InvitationCode {
  created_by_name: string;
  usage_count: number;
}

export interface InvitationCodeValidation {
  valid: boolean;
  code?: InvitationCode;
  error?: string;
}
