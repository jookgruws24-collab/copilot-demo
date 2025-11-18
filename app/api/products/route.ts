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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '1000', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const includeArchived = searchParams.get('include_archived') === 'true';

    // For non-admin users, always exclude archived products
    const isAdmin = employee.role === 'admin';
    const showArchived = isAdmin && includeArchived;

    // Build WHERE clause
    let whereClause = showArchived ? '1=1' : 'is_archived = 0 OR is_archived IS NULL';
    const queryParams: any[] = [];

    // Add search filter
    if (search) {
      whereClause += ` AND (name LIKE ? OR description LIKE ?)`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern);
    }

    // Validate sort_by
    const validSortFields = ['name', 'diamond_price', 'quantity', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM products WHERE ${whereClause}`;
    const totalResult = query<{ total: number }>(countQuery, queryParams);
    const total = totalResult[0]?.total || 0;

    // Get products with pagination
    const products = query<Product>(
      `SELECT * FROM products 
       WHERE ${whereClause} 
       ORDER BY ${sortField} ${order} 
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Add availability status
    const productsWithAvailability: ProductWithAvailability[] = products.map(product => ({
      ...product,
      is_available: (product.is_archived === 0 || product.is_archived === null) && product.quantity > 0,
      stock_status: product.quantity === 0 ? 'out_of_stock' : 
                    product.quantity < 10 ? 'low_stock' : 
                    'in_stock'
    }));

    return NextResponse.json({
      success: true,
      data: productsWithAvailability,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
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
