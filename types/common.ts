// Common TypeScript types used across the application

export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type ID = number;

export type Timestamp = string; // ISO 8601 format

export type Role = 'user' | 'admin' | 'hr';

export type Status = 'active' | 'inactive' | 'pending';

export interface PaginationParams {
  page?: number;
  perPage?: number;
  offset?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
}
