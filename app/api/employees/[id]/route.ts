import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db/client';
import { validateSession } from '@/lib/auth/session';
import { handleApiError, AuthenticationError, AuthorizationError, NotFoundError } from '@/lib/utils/errors';
import type { Employee, EmployeeUpdate } from '@/types/employee';

// GET /api/employees/[id] - Get employee by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('session_token')?.value;
    const currentEmployee = token ? validateSession(token) : null;

    if (!currentEmployee) {
      throw new AuthenticationError();
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);

    // Users can only view their own profile, Admin/HR can view anyone
    if (currentEmployee.id !== id && currentEmployee.role !== 'admin' && currentEmployee.role !== 'hr') {
      throw new AuthorizationError('You can only view your own profile');
    }

    const employee = queryOne<Employee>(
      'SELECT * FROM employees WHERE id = ?',
      [id]
    );

    if (!employee) {
      throw new NotFoundError('Employee');
    }

    // Remove password hash
    const { password_hash, ...employeeData } = employee;

    return NextResponse.json({
      success: true,
      data: employeeData,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/employees/[id] - Update employee profile
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

    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);

    // Users can only edit their own profile
    if (currentEmployee.id !== id) {
      throw new AuthorizationError('You can only edit your own profile');
    }

    const body = await request.json() as EmployeeUpdate;
    const { name, email, contact, address } = body;

    // Build update query dynamically
    const updates: string[] = [];
    const values: unknown[] = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (contact) {
      updates.push('contact = ?');
      values.push(contact);
    }
    if (address) {
      updates.push('address = ?');
      values.push(address);
    }

    if (updates.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No changes to update',
      });
    }

    updates.push('updated_at = datetime("now")');
    values.push(id);

    execute(
      `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`,
      values
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
