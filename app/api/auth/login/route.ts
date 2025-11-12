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
    
    console.log('[/api/auth/login] Login attempt for:', email);
    
    const employee = queryOne<Employee>('SELECT * FROM employees WHERE email = ?', [email]);
    if (!employee) {
      console.log('[/api/auth/login] Employee not found');
      throw new AuthenticationError('Invalid email or password');
    }
    
    const isValid = await verifyPassword(password, employee.password_hash);
    if (!isValid) {
      console.log('[/api/auth/login] Invalid password');
      throw new AuthenticationError('Invalid email or password');
    }
    
    const session = createSession(employee.id);
    console.log('[/api/auth/login] Session created:', session.token.substring(0, 10) + '...', 'expires:', session.expires_at);
    
    const { password_hash, ...employeeData } = employee;
    const response = NextResponse.json({ success: true, message: 'Login successful', data: employeeData });
    response.cookies.set('session_token', session.token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', 
      expires: new Date(session.expires_at), 
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });
    
    console.log('[/api/auth/login] Login successful for:', email, 'id:', employee.id);
    return response;
  } catch (error) {
    console.error('[/api/auth/login] Error:', error);
    return handleApiError(error);
  }
}
