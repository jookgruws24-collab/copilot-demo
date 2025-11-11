export type HistoryType = 'claim' | 'purchase';
export type HistoryAction = 'created' | 'approved' | 'rejected' | 'claimed';

export interface History {
  id: number;
  employee_id: number;
  employee_name: string;
  type: HistoryType;
  action: HistoryAction;
  details: string;
  diamonds: number;
  created_at: string;
}

export interface HistoryFilters {
  startDate?: string;
  endDate?: string;
  employeeId?: number;
  type?: HistoryType;
  action?: HistoryAction;
  search?: string;
  page?: number;
  limit?: number;
}

export interface HistoryResponse {
  data: History[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
