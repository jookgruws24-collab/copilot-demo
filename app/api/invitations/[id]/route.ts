import { NextRequest, NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db/client';
import { validateSession } from '@/lib/auth/session';
import { handleApiError, AuthenticationError, AuthorizationError, NotFoundError } from '@/lib/utils/errors';
import type { InvitationCode } from '@/types/invitation';

// PATCH /api/invitations/[id] - Deactivate/activate invitation code
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('session_token')?.value;
    const employee = token ? validateSession(token) : null;

    if (!employee) {
      throw new AuthenticationError();
    }

    if (employee.role !== 'admin' && employee.role !== 'hr') {
      throw new AuthorizationError('Only Admin and HR can modify invitation codes');
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);

    // Check if code exists
    const code = queryOne<InvitationCode>(
      'SELECT * FROM invitation_codes WHERE id = ?',
      [id]
    );

    if (!code) {
      throw new NotFoundError('Invitation code');
    }

    const body = await request.json();
    const { is_active } = body;

    // Update active status
    execute(
      'UPDATE invitation_codes SET is_active = ? WHERE id = ?',
      [is_active ? 1 : 0, id]
    );

    const updatedCode = {
      ...code,
      is_active: is_active ? 1 : 0,
    };

    return NextResponse.json({
      success: true,
      data: updatedCode,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
