import { ID, Timestamp, Role } from './common';

// ============================================================================
// Employee Entity
// ============================================================================
export interface Employee {
  id: ID;
  employee_id: string;
  name: string;
  email: string;
  password_hash: string;
  contact: string;
  address: string;
  role: Role;
  diamond_balance: number;
  invitation_code_used: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type EmployeeCreate = Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'diamond_balance'> & {
  diamond_balance?: number;
};

export type EmployeeUpdate = Partial<Omit<Employee, 'id' | 'created_at' | 'password_hash'>>;

export type EmployeePublic = Omit<Employee, 'password_hash'>;

// ============================================================================
// Invitation Code Entity
// ============================================================================
export interface InvitationCode {
  id: ID;
  code: string;
  label: string | null;
  created_by: ID;
  is_active: number; // SQLite stores as 0 or 1
  created_at: Timestamp;
}

export type InvitationCodeCreate = Omit<InvitationCode, 'id' | 'created_at'>;

export interface InvitationCodeWithUsage extends InvitationCode {
  created_by_name: string;
  usage_count: number;
}

// ============================================================================
// Session Entity
// ============================================================================
export interface Session {
  id: ID;
  employee_id: ID;
  token: string;
  expires_at: Timestamp;
  created_at: Timestamp;
}

export type SessionCreate = Omit<Session, 'id' | 'created_at'>;

// ============================================================================
// Achievement Entity
// ============================================================================
export interface Achievement {
  id: ID;
  title: string;
  description: string;
  conditions: string;
  diamond_reward: number;
  start_date: Timestamp;
  end_date: Timestamp;
  created_by: ID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type AchievementCreate = Omit<Achievement, 'id' | 'created_at' | 'updated_at'>;

export type AchievementUpdate = Partial<Omit<Achievement, 'id' | 'created_by' | 'created_at'>>;

export type AchievementStatus = 'upcoming' | 'active' | 'expired';

export interface AchievementWithStatus extends Achievement {
  status: AchievementStatus;
}

// ============================================================================
// Achievement Progress Entity
// ============================================================================
export type ProgressStatus = 'upcoming' | 'on_doing' | 'completed' | 'claimed';

export interface AchievementProgress {
  id: ID;
  employee_id: ID;
  achievement_id: ID;
  status: ProgressStatus;
  progress_percentage: number;
  claimed_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type AchievementProgressCreate = Omit<AchievementProgress, 'id' | 'created_at' | 'updated_at' | 'claimed_at'>;

export type AchievementProgressUpdate = Partial<Pick<AchievementProgress, 'status' | 'progress_percentage'>>;

export interface AchievementProgressWithDetails extends AchievementProgress {
  achievement_title: string;
  achievement_description: string;
  diamond_reward: number;
  start_date: Timestamp;
  end_date: Timestamp;
}

// ============================================================================
// Product Entity
// ============================================================================
export interface Product {
  id: ID;
  name: string;
  description: string;
  diamond_price: number;
  quantity: number;
  image_url: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type ProductCreate = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

export type ProductUpdate = Partial<Omit<Product, 'id' | 'created_at'>>;

// ============================================================================
// Purchase Entity
// ============================================================================
export type PurchaseStatus = 'pending' | 'accepted' | 'rejected';

export interface Purchase {
  id: ID;
  employee_id: ID;
  product_id: ID;
  product_name: string;
  diamond_cost: number;
  status: PurchaseStatus;
  rejection_reason: string | null;
  approved_by: ID | null;
  approved_at: Timestamp | null;
  created_at: Timestamp;
}

export type PurchaseCreate = Pick<Purchase, 'employee_id' | 'product_id' | 'product_name' | 'diamond_cost'>;

export interface PurchaseWithDetails extends Purchase {
  employee_name: string;
  approver_name: string | null;
}

// ============================================================================
// History Entity
// ============================================================================
export type HistoryType = 'claim' | 'purchase';
export type HistoryAction = 'created' | 'approved' | 'rejected' | 'claimed';

export interface History {
  id: ID;
  employee_id: ID;
  employee_name: string;
  type: HistoryType;
  action: HistoryAction;
  details: string; // JSON string
  diamonds: number;
  created_at: Timestamp;
}

export type HistoryCreate = Omit<History, 'id' | 'created_at'>;

export interface HistoryDetails {
  [key: string]: unknown;
}

export interface ClaimHistoryDetails {
  achievement_id: number;
  achievement_title: string;
  diamonds_earned: number;
}

export interface PurchaseHistoryDetails {
  purchase_id: number;
  product_id: number;
  product_name: string;
  diamond_cost: number;
  status: PurchaseStatus;
  approved_by?: string;
}

// ============================================================================
// Query Filters
// ============================================================================
export interface HistoryFilter {
  employee_id?: ID;
  type?: HistoryType;
  action?: HistoryAction;
  start_date?: Timestamp;
  end_date?: Timestamp;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AchievementFilter {
  status?: AchievementStatus;
  employee_id?: ID;
}

export interface PurchaseFilter {
  employee_id?: ID;
  status?: PurchaseStatus;
  start_date?: Timestamp;
  end_date?: Timestamp;
}
