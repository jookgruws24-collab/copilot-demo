import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { query } from '@/lib/db/client';
import { handleApiError, AuthenticationError, AuthorizationError } from '@/lib/utils/errors';

interface PurchaseWithDetails {
  id: number;
  employee_id: number;
  employee_name: string;
  product_id: number;
  product_name: string;
  diamond_cost: number;
  status: string;
  created_at: string;
}

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

    // Only admin can view pending purchases
    if (employee.role !== 'admin') {
      throw new AuthorizationError('Only admins can view pending purchases');
    }

    // Get all pending purchases with employee details
    const pendingPurchases = query<PurchaseWithDetails>(
      `SELECT 
        p.id,
        p.employee_id,
        e.name as employee_name,
        p.product_id,
        p.product_name,
        p.diamond_cost,
        p.status,
        p.created_at
       FROM purchases p
       JOIN employees e ON p.employee_id = e.id
       WHERE p.status = 'pending'
       ORDER BY p.created_at ASC`
    );

    return NextResponse.json({
      success: true,
      data: pendingPurchases,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
