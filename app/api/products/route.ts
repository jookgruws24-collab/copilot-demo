import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { query, execute } from '@/lib/db/client';
import { handleApiError, AuthenticationError, AuthorizationError } from '@/lib/utils/errors';
import { z } from 'zod';
import type { Product, ProductWithAvailability } from '@/types/product';

const productCreateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  diamond_price: z.number().int().positive(),
  quantity: z.number().int().min(0),
  image_url: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      throw new AuthenticationError('Not authenticated');
    }

    const employee = validateSession(token);
    if (!employee) {
      throw new AuthenticationError('Invalid or expired session');
    }

    // Get all products
    const products = query<Product>('SELECT * FROM products ORDER BY created_at DESC');

    // Add availability status
    const productsWithAvailability: ProductWithAvailability[] = products.map(product => ({
      ...product,
      is_available: product.quantity > 0,
      stock_status: product.quantity === 0 ? 'out_of_stock' : 
                    product.quantity < 10 ? 'low_stock' : 
                    'in_stock'
    }));

    return NextResponse.json({
      success: true,
      data: productsWithAvailability,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      throw new AuthenticationError('Not authenticated');
    }

    const employee = validateSession(token);
    if (!employee) {
      throw new AuthenticationError('Invalid or expired session');
    }

    // Only admin can create products
    if (employee.role !== 'admin') {
      throw new AuthorizationError('Only admins can create products');
    }

    const body = await request.json();
    const validatedData = productCreateSchema.parse(body);

    // Create product
    execute(
      `INSERT INTO products (name, description, diamond_price, quantity, image_url) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        validatedData.name,
        validatedData.description,
        validatedData.diamond_price,
        validatedData.quantity,
        validatedData.image_url || null,
      ]
    );

    // Get the created product
    const newProduct = query<Product>(
      'SELECT * FROM products WHERE name = ? ORDER BY created_at DESC LIMIT 1',
      [validatedData.name]
    )[0];

    return NextResponse.json({
      success: true,
      data: newProduct,
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
