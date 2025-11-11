import { getDatabase } from '@/lib/db/client';
import { NotFoundError, ValidationError } from '@/lib/utils/errors';

export interface RejectPurchaseParams {
  purchaseId: number;
  adminId: number;
  adminName: string;
  rejectionReason: string;
}

export interface RejectPurchaseResult {
  purchaseId: number;
  refundedAmount: number;
  newBalance: number;
}

export function rejectPurchase(params: RejectPurchaseParams): RejectPurchaseResult {
  const db = getDatabase();
  const { purchaseId, adminId, adminName, rejectionReason } = params;

  return db.transaction(() => {
    // 1. Get purchase details
    const purchase = db.prepare(
      'SELECT id, employee_id, product_id, product_name, diamond_cost, status FROM purchases WHERE id = ?'
    ).get(purchaseId) as { id: number; employee_id: number; product_id: number; product_name: string; diamond_cost: number; status: string } | undefined;

    if (!purchase) {
      throw new NotFoundError('Purchase not found');
    }

    // 2. Validate purchase status
    if (purchase.status !== 'pending') {
      throw new ValidationError(`Purchase has already been ${purchase.status}`);
    }

    // 3. Get employee details
    const employee = db.prepare('SELECT id, name, diamond_balance FROM employees WHERE id = ?').get(purchase.employee_id) as { id: number; name: string; diamond_balance: number } | undefined;

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    // 4. Refund diamonds to employee balance
    db.prepare('UPDATE employees SET diamond_balance = diamond_balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(purchase.diamond_cost, purchase.employee_id);

    // 5. Restore product inventory
    db.prepare('UPDATE products SET quantity = quantity + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(purchase.product_id);

    // 6. Update purchase status
    db.prepare(
      `UPDATE purchases 
       SET status = 'rejected', 
           rejection_reason = ?, 
           approved_by = ?, 
           approved_at = CURRENT_TIMESTAMP 
       WHERE id = ?`
    ).run(rejectionReason, adminId, purchaseId);

    // 7. Insert history record for rejection
    db.prepare(
      `INSERT INTO history (employee_id, employee_name, type, action, details, diamonds, created_at) 
       VALUES (?, ?, 'purchase', 'rejected', ?, ?, CURRENT_TIMESTAMP)`
    ).run(
      purchase.employee_id,
      employee.name,
      `Purchase rejected: ${purchase.product_name}. Reason: ${rejectionReason}. Refunded by ${adminName}`,
      purchase.diamond_cost
    );

    const newBalance = employee.diamond_balance + purchase.diamond_cost;

    return {
      purchaseId: purchase.id,
      refundedAmount: purchase.diamond_cost,
      newBalance
    };
  })();
}
