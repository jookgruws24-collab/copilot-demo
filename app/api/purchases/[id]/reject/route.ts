import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { handleApiError, AuthenticationError, AuthorizationError, ValidationError } from '@/lib/utils/errors';
import { rejectPurchase } from '@/lib/purchases/reject';
import { z } from 'zod';

const rejectSchema = z.object({
  rejection_reason: z.string().min(1, 'Rejection reason is required').max(500),
});

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

    // Only admin can reject purchases
    if (employee.role !== 'admin') {
      throw new AuthorizationError('Only admins can reject purchases');
    }

    const { id } = await params;
    const purchaseId = parseInt(id);

    if (isNaN(purchaseId)) {
      throw new ValidationError('Invalid purchase ID');
    }

    const body = await request.json();
    const validatedData = rejectSchema.parse(body);

    // Execute rejection with refund transaction
    const result = rejectPurchase({
      purchaseId,
      adminId: employee.id,
      adminName: employee.name,
      rejectionReason: validatedData.rejection_reason,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Purchase rejected and ${result.refundedAmount}💎 refunded`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
