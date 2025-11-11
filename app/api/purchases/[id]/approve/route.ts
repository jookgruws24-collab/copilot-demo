import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db/client';
import { handleApiError, AuthenticationError, AuthorizationError, NotFoundError, ValidationError } from '@/lib/utils/errors';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      throw new AuthenticationError('Not authenticated');
    }

    const employee = validateSession(token);
    if (!employee) {
      throw new AuthenticationError('Invalid or expired session');
    }

    // Only admin can approve purchases
    if (employee.role !== 'admin') {
      throw new AuthorizationError('Only admins can approve purchases');
    }

    const { id } = await params;
    const purchaseId = parseInt(id);

    if (isNaN(purchaseId)) {
      throw new ValidationError('Invalid purchase ID');
    }

    const db = getDatabase();

    // Execute approval transaction
    const result = db.transaction(() => {
      // 1. Get purchase details
      const purchase = db.prepare(
        'SELECT id, employee_id, product_name, diamond_cost, status FROM purchases WHERE id = ?'
      ).get(purchaseId) as { id: number; employee_id: number; product_name: string; diamond_cost: number; status: string } | undefined;

      if (!purchase) {
        throw new NotFoundError('Purchase not found');
      }

      // 2. Check if already processed (T089 - prevent duplicate approvals)
      if (purchase.status !== 'pending') {
        throw new ValidationError(`Purchase has already been ${purchase.status}`);
      }

      // 3. Get employee details for history
      const purchaseEmployee = db.prepare('SELECT name FROM employees WHERE id = ?').get(purchase.employee_id) as { name: string } | undefined;

      if (!purchaseEmployee) {
        throw new NotFoundError('Employee not found');
      }

      // 4. Update purchase status
      db.prepare(
        `UPDATE purchases 
         SET status = 'accepted', 
             approved_by = ?, 
             approved_at = CURRENT_TIMESTAMP 
         WHERE id = ?`
      ).run(employee.id, purchaseId);

      // 5. Insert history record for approval
      db.prepare(
        `INSERT INTO history (employee_id, employee_name, type, action, details, diamonds, created_at) 
         VALUES (?, ?, 'purchase', 'approved', ?, ?, CURRENT_TIMESTAMP)`
      ).run(
        purchase.employee_id,
        purchaseEmployee.name,
        `Purchase approved: ${purchase.product_name}. Approved by ${employee.name}`,
        0
      );

      return {
        purchaseId: purchase.id,
        status: 'accepted'
      };
    })();

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Purchase approved successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
