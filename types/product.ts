export interface Product {
  id: number;
  name: string;
  description: string;
  diamond_price: number;
  quantity: number;
  image_url?: string | null;
  is_archived?: number; // 0 = active, 1 = archived
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  name: string;
  description: string;
  diamond_price: number;
  quantity: number;
  image_url?: string;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  diamond_price?: number;
  quantity?: number;
  image_url?: string;
}

export interface ProductWithAvailability extends Product {
  is_available: boolean;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface ProductWithMetadata extends ProductWithAvailability {
  pending_purchases?: number;
  total_purchases?: number;
}

export interface ProductFilters {
  search?: string;
  sort_by?: 'name' | 'diamond_price' | 'quantity' | 'created_at';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  include_archived?: boolean;
}
