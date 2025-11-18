import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { query, execute } from '@/lib/db/client';
import { handleApiError, AuthenticationError, AuthorizationError } from '@/lib/utils/errors';
import { productUpdateSchema } from '@/lib/validations/schemas';
import type { Product } from '@/types/product';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      throw new AuthenticationError('Not authenticated');
    }

    const employee = validateSession(token);
    if (!employee) {
      throw new AuthenticationError('Invalid or expired session');
    }

    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Get product with pending purchase count
    const products = query<Product & { pending_count: number }>(
      `SELECT 
        p.*,
        COALESCE(SUM(CASE WHEN pu.status = 'pending' THEN 1 ELSE 0 END), 0) as pending_count
      FROM products p
      LEFT JOIN purchases pu ON pu.product_id = p.id
      WHERE p.id = ?
      GROUP BY p.id`,
      [productId]
    );

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = products[0];
    const { pending_count, ...productData } = product;

    return NextResponse.json({
      success: true,
      data: {
        ...productData,
        pending_purchases: pending_count,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      throw new AuthenticationError('Not authenticated');
    }

    const employee = validateSession(token);
    if (!employee) {
      throw new AuthenticationError('Invalid or expired session');
    }

    // Only admin can update products
    if (employee.role !== 'admin') {
      throw new AuthorizationError('Only admins can update products');
    }

    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = productUpdateSchema.parse(body);

    // Check if product exists
    const existing = query<Product>('SELECT * FROM products WHERE id = ?', [productId]);
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // If quantity is being updated, validate against pending purchases
    if (validatedData.quantity !== undefined) {
      const pendingResult = query<{ pending_count: number }>(
        `SELECT COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_count
         FROM purchases 
         WHERE product_id = ?`,
        [productId]
      );
      const pendingCount = pendingResult[0]?.pending_count || 0;

      if (validatedData.quantity < pendingCount) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot reduce quantity to ${validatedData.quantity}. There are ${pendingCount} pending purchases for this product.`,
          },
          { status: 409 }
        );
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (validatedData.name !== undefined) {
      updates.push('name = ?');
      values.push(validatedData.name);
    }
    if (validatedData.description !== undefined) {
      updates.push('description = ?');
      values.push(validatedData.description);
    }
    if (validatedData.diamond_price !== undefined) {
      updates.push('diamond_price = ?');
      values.push(validatedData.diamond_price);
    }
    if (validatedData.quantity !== undefined) {
      updates.push('quantity = ?');
      values.push(validatedData.quantity);
    }
    if (validatedData.image_url !== undefined) {
      updates.push('image_url = ?');
      // Allow empty string to clear the image URL
      values.push(validatedData.image_url === '' ? null : validatedData.image_url);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push("updated_at = datetime('now')");
    values.push(productId);

    execute(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated product
    const updated = query<Product>('SELECT * FROM products WHERE id = ?', [productId])[0];

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      throw new AuthenticationError('Not authenticated');
    }

    const employee = validateSession(token);
    if (!employee) {
      throw new AuthenticationError('Invalid or expired session');
    }

    // Only admin can delete products
    if (employee.role !== 'admin') {
      throw new AuthorizationError('Only admins can delete products');
    }

    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existing = query<Product>('SELECT * FROM products WHERE id = ?', [productId]);
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check for purchase history
    const purchaseCount = query<{ count: number }>(
      'SELECT COUNT(*) as count FROM purchases WHERE product_id = ?',
      [productId]
    )[0]?.count || 0;

    if (purchaseCount > 0) {
      // Soft delete (archive)
      execute(
        `UPDATE products SET is_archived = 1, updated_at = datetime('now') WHERE id = ?`,
        [productId]
      );

      return NextResponse.json({
        success: true,
        data: { id: productId, archived: true },
        message: 'Product archived successfully (has purchase history)',
      });
    } else {
      // Hard delete (no purchase history)
      execute('DELETE FROM products WHERE id = ?', [productId]);

      return NextResponse.json({
        success: true,
        data: { id: productId, deleted: true },
        message: 'Product deleted successfully',
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}

