import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db/client';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { handleApiError, AuthenticationError } from '@/lib/utils/errors';
import type { Employee } from '@/types/employee';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    const employee = queryOne<Employee>('SELECT * FROM employees WHERE email = ?', [email]);
    if (!employee) throw new AuthenticationError('Invalid email or password');
    const isValid = await verifyPassword(password, employee.password_hash);
    if (!isValid) throw new AuthenticationError('Invalid email or password');
    const session = createSession(employee.id);
    const { password_hash, ...employeeData } = employee;
    const response = NextResponse.json({ success: true, message: 'Login successful', data: employeeData });
    response.cookies.set('session_token', session.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: new Date(session.expires_at), path: '/' });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
