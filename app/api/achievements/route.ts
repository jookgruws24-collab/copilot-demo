import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { execute, query, queryOne } from '@/lib/db/client';
import { achievementCreateSchema } from '@/lib/validations/schemas';
import { addStatusToAchievements } from '@/lib/achievements/status';
import { handleApiError, AuthenticationError, AuthorizationError } from '@/lib/utils/errors';
import type { Achievement } from '@/types/achievement';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      throw new AuthenticationError('Not authenticated');
    }

    const employee = validateSession(token);
    if (!employee) {
      throw new AuthenticationError('Invalid or expired session');
    }

    const achievements = query<Achievement>(
      'SELECT * FROM achievements ORDER BY start_date ASC'
    );

    const achievementsWithStatus = addStatusToAchievements(achievements);

    return NextResponse.json({
      success: true,
      data: achievementsWithStatus,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      throw new AuthenticationError('Not authenticated');
    }

    const employee = validateSession(token);
    if (!employee) {
      throw new AuthenticationError('Invalid or expired session');
    }

    if (employee.role !== 'admin' && employee.role !== 'hr') {
      throw new AuthorizationError('Only Admin or HR can create achievements');
    }

    const body = await request.json();
    const validatedData = achievementCreateSchema.parse(body);

    const result = execute(
      `INSERT INTO achievements (title, description, conditions, diamond_reward, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        validatedData.title,
        validatedData.description,
        validatedData.conditions,
        validatedData.diamond_reward,
        validatedData.start_date,
        validatedData.end_date,
      ]
    );

    const achievement = queryOne<Achievement>(
      'SELECT * FROM achievements WHERE id = ?',
      [result.lastInsertRowid]
    );

    return NextResponse.json({
      success: true,
      data: achievement,
      message: 'Achievement created successfully',
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
