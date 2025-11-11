export interface Product {
  id: number;
  name: string;
  description: string;
  diamond_price: number;
  quantity: number;
  image_url?: string | null;
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
