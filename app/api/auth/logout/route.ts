import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  if (token) deleteSession(token);
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete('session_token');
  return response;
}
