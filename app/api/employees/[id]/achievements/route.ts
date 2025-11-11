import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { query } from '@/lib/db/client';
import { handleApiError, AuthenticationError, AuthorizationError } from '@/lib/utils/errors';
import type { AchievementProgress } from '@/types/achievement';

export async function GET(
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

    // Users can only view their own progress, admins/HR can view anyone's
    if (employee.role === 'user' && employee.id !== parseInt(id)) {
      throw new AuthorizationError('You can only view your own achievement progress');
    }

    const progressRecords = query<AchievementProgress>(
      `SELECT * FROM achievement_progress 
       WHERE employee_id = ? 
       ORDER BY created_at DESC`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: progressRecords,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
