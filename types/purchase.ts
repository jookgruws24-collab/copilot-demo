export type PurchaseStatus = 'pending' | 'accepted' | 'rejected';

export interface Purchase {
  id: number;
  employee_id: number;
  product_id: number;
  product_name: string;
  diamond_cost: number;
  status: PurchaseStatus;
  approved_by?: number | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
}

export interface PurchaseCreate {
  product_id: number;
  quantity: number;
}

export interface PurchaseWithDetails extends Purchase {
  employee_name: string;
  product_description: string;
  approver_name?: string | null;
}

export interface PurchaseApproval {
  status: 'accepted' | 'rejected';
  rejection_reason?: string;
}
