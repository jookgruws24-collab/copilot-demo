import { getDatabase } from '@/lib/db/client';
import { NotFoundError, ValidationError } from '@/lib/utils/errors';
import type { Purchase } from '@/types/purchase';

export interface CreatePurchaseParams {
  employeeId: number;
  productId: number;
  quantity: number;
}

export interface CreatePurchaseResult {
  purchase: Purchase;
  newBalance: number;
}

export function createPurchase(params: CreatePurchaseParams): CreatePurchaseResult {
  const db = getDatabase();
  const { employeeId, productId, quantity } = params;

  return db.transaction(() => {
    // 1. Get employee and check balance
    const employee = db.prepare('SELECT id, name, diamond_balance FROM employees WHERE id = ?').get(employeeId) as { id: number; name: string; diamond_balance: number } | undefined;
    
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    // 2. Get product and check availability
    const product = db.prepare('SELECT id, name, diamond_price, quantity FROM products WHERE id = ?').get(productId) as { id: number; name: string; diamond_price: number; quantity: number } | undefined;
    
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (product.quantity < quantity) {
      throw new ValidationError(`Insufficient stock. Available: ${product.quantity}, Requested: ${quantity}`);
    }

    if (quantity <= 0) {
      throw new ValidationError('Quantity must be greater than 0');
    }

    // 3. Calculate total cost
    const totalDiamonds = product.diamond_price * quantity;

    if (employee.diamond_balance < totalDiamonds) {
      throw new ValidationError(`Insufficient balance. Required: ${totalDiamonds}💎, Available: ${employee.diamond_balance}💎`);
    }

    // 4. Deduct diamonds from employee balance
    db.prepare('UPDATE employees SET diamond_balance = diamond_balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(totalDiamonds, employeeId);

    // 5. Decrement product inventory
    db.prepare('UPDATE products SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(quantity, productId);

    // 6. Create purchase record with pending status
    const purchaseResult = db.prepare(
      `INSERT INTO purchases (employee_id, product_id, product_name, diamond_cost, status) 
       VALUES (?, ?, ?, ?, 'pending')
       RETURNING *`
    ).get(employeeId, productId, product.name, totalDiamonds) as Purchase;

    // 7. Insert history record
    db.prepare(
      `INSERT INTO history (employee_id, employee_name, type, action, details, diamonds, created_at) 
       VALUES (?, ?, 'purchase', 'created', ?, ?, CURRENT_TIMESTAMP)`
    ).run(
      employeeId,
      employee.name || 'Unknown',
      `Purchased ${quantity}x ${product.name} (Pending Approval)`,
      -totalDiamonds
    );

    const newBalance = employee.diamond_balance - totalDiamonds;

    return {
      purchase: purchaseResult,
      newBalance
    };
  })();
}
