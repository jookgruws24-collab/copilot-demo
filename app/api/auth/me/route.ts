import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { handleApiError, AuthenticationError } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    
    if (!token) {
      console.log('[/api/auth/me] No session token found in cookies');
      throw new AuthenticationError('Not authenticated');
    }
    
    console.log('[/api/auth/me] Validating token:', token.substring(0, 10) + '...');
    const employee = validateSession(token);
    
    if (!employee) {
      console.log('[/api/auth/me] Session validation failed - no employee found');
      throw new AuthenticationError('Invalid or expired session');
    }
    
    console.log('[/api/auth/me] Successfully validated employee:', employee.id, employee.email);
    const { password_hash, ...employeeData } = employee;
    return NextResponse.json({ success: true, data: employeeData });
  } catch (error) {
    console.error('[/api/auth/me] Error:', error);
    return handleApiError(error);
  }
}
