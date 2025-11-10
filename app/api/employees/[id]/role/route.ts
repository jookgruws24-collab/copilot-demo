import { NextRequest, NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db/client';
import { validateSession } from '@/lib/auth/session';
import { handleApiError, AuthenticationError, AuthorizationError, NotFoundError } from '@/lib/utils/errors';
import type { Employee } from '@/types/employee';

// PATCH /api/employees/[id]/role - Update employee role (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('session_token')?.value;
    const currentEmployee = token ? validateSession(token) : null;

    if (!currentEmployee) {
      throw new AuthenticationError();
    }

    // Only admins can change roles
    if (currentEmployee.role !== 'admin') {
      throw new AuthorizationError('Only administrators can change employee roles');
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);

    const body = await request.json();
    const { role } = body;

    // Validate role
    if (!['user', 'admin', 'hr'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid role. Must be user, admin, or hr',
        },
        { status: 400 }
      );
    }

    // Check if employee exists
    const employee = queryOne<Employee>(
      'SELECT * FROM employees WHERE id = ?',
      [id]
    );

    if (!employee) {
      throw new NotFoundError('Employee');
    }

    // Update role
    execute(
      'UPDATE employees SET role = ?, updated_at = datetime("now") WHERE id = ?',
      [role, id]
    );

    // Get updated employee
    const updatedEmployee = queryOne<Employee>(
      'SELECT * FROM employees WHERE id = ?',
      [id]
    );

    if (!updatedEmployee) {
      throw new NotFoundError('Employee');
    }

    const { password_hash, ...employeeData } = updatedEmployee;

    return NextResponse.json({
      success: true,
      data: employeeData,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
