import type { ID, Timestamp, Role } from './common';

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

export type EmployeePublic = Omit<Employee, 'password_hash'>;

export interface EmployeeRegister {
  employee_id: string;
  name: string;
  email: string;
  password: string;
  contact: string;
  address: string;
  invitation_code?: string;
}

export interface EmployeeLogin {
  email: string;
  password: string;
}

export interface EmployeeUpdate {
  name?: string;
  email?: string;
  contact?: string;
  address?: string;
}
