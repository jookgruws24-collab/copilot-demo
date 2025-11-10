import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { handleApiError, AuthenticationError } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    if (!token) throw new AuthenticationError('Not authenticated');
    const employee = validateSession(token);
    if (!employee) throw new AuthenticationError('Invalid or expired session');
    const { password_hash, ...employeeData } = employee;
    return NextResponse.json({ success: true, data: employeeData });
  } catch (error) {
    return handleApiError(error);
  }
}
