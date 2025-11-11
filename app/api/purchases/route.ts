import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { handleApiError, AuthenticationError } from '@/lib/utils/errors';
import { createPurchase } from '@/lib/purchases/create';
import { z } from 'zod';

const purchaseCreateSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

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

    const body = await request.json();
    const validatedData = purchaseCreateSchema.parse(body);

    // Create purchase with atomic transaction
    const result = createPurchase({
      employeeId: employee.id,
      productId: validatedData.product_id,
      quantity: validatedData.quantity,
    });

    return NextResponse.json({
      success: true,
      data: {
        purchase: result.purchase,
        new_balance: result.newBalance,
      },
      message: 'Purchase created successfully. Awaiting admin approval.',
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
