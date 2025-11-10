import { NextRequest, NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db/client';
import { hashPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { validateInvitationCode } from '@/lib/invitations/validate';
import { handleApiError, ConflictError, ValidationError } from '@/lib/utils/errors';
import { employeeCreateSchema } from '@/lib/validations/schemas';
import type { Employee, EmployeeRegister } from '@/types/employee';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as EmployeeRegister;
    const validation = employeeCreateSchema.safeParse(body);
    
    if (!validation.success) {
      const errors = validation.error.issues.map((e) => ({ field: e.path.join('.'), message: e.message }));
      throw new ValidationError('Invalid input', errors);
    }

    const { employee_id, name, email, password, contact, address, invitation_code } = validation.data;
    
    // T043: Check if employee_id or email already exists (unique validation)
    const existingEmployee = queryOne<Employee>(
      'SELECT id, employee_id, email FROM employees WHERE employee_id = ? OR email = ?',
      [employee_id, email]
    );

    if (existingEmployee) {
      if (existingEmployee.employee_id === employee_id) {
        throw new ConflictError('Employee ID already exists');
      }
      if (existingEmployee.email === email) {
        throw new ConflictError('Email already exists');
      }
    }

    // T045: Validate invitation code if provided (with detailed error messages)
    let validatedCode: string | null = null;
    if (invitation_code) {
      const codeValidation = validateInvitationCode(invitation_code);
      if (!codeValidation.valid) {
        // Log the error but don't block registration (per FR-003)
        console.warn(`Invalid invitation code used: ${invitation_code} - ${codeValidation.error}`);
      } else {
        validatedCode = codeValidation.code!.code;
      }
    }

    const passwordHash = await hashPassword(password);
    const result = execute(
      'INSERT INTO employees (employee_id, name, email, password_hash, contact, address, role, diamond_balance, invitation_code_used) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [employee_id, name, email, passwordHash, contact, address, 'user', 0, validatedCode]
    );
    
    const employeeId = result.lastInsertRowid as number;
    const session = createSession(employeeId);

    const response = NextResponse.json({ success: true, message: 'Registration successful', data: { id: employeeId, employee_id, name, email, role: 'user' } }, { status: 201 });
    response.cookies.set('session_token', session.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: new Date(session.expires_at), path: '/' });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
