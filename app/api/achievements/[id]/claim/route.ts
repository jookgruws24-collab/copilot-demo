import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { claimAchievementReward } from '@/lib/achievements/claim';
import { handleApiError, AuthenticationError } from '@/lib/utils/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      throw new AuthenticationError('Not authenticated');
    }

    const employee = validateSession(token);
    if (!employee) {
      throw new AuthenticationError('Invalid or expired session');
    }

    const result = claimAchievementReward(employee.id, parseInt(id));

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Achievement reward claimed successfully!',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
