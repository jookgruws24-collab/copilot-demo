import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { execute, queryOne } from '@/lib/db/client';
import { achievementUpdateSchema } from '@/lib/validations/schemas';
import { addStatusToAchievement } from '@/lib/achievements/status';
import { handleApiError, AuthenticationError, AuthorizationError, NotFoundError } from '@/lib/utils/errors';
import type { Achievement } from '@/types/achievement';

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

    const achievement = queryOne<Achievement>(
      'SELECT * FROM achievements WHERE id = ?',
      [id]
    );

    if (!achievement) {
      throw new NotFoundError('Achievement not found');
    }

    const achievementWithStatus = addStatusToAchievement(achievement);

    return NextResponse.json({
      success: true,
      data: achievementWithStatus,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
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

    if (employee.role !== 'admin' && employee.role !== 'hr') {
      throw new AuthorizationError('Only Admin or HR can update achievements');
    }

    const existing = queryOne<Achievement>(
      'SELECT * FROM achievements WHERE id = ?',
      [id]
    );

    if (!existing) {
      throw new NotFoundError('Achievement not found');
    }

    const body = await request.json();
    const validatedData = achievementUpdateSchema.parse(body);

    const updates: string[] = [];
    const values: any[] = [];

    if (validatedData.title !== undefined) {
      updates.push('title = ?');
      values.push(validatedData.title);
    }
    if (validatedData.description !== undefined) {
      updates.push('description = ?');
      values.push(validatedData.description);
    }
    if (validatedData.conditions !== undefined) {
      updates.push('conditions = ?');
      values.push(validatedData.conditions);
    }
    if (validatedData.diamond_reward !== undefined) {
      updates.push('diamond_reward = ?');
      values.push(validatedData.diamond_reward);
    }
    if (validatedData.start_date !== undefined) {
      updates.push('start_date = ?');
      values.push(validatedData.start_date);
    }
    if (validatedData.end_date !== undefined) {
      updates.push('end_date = ?');
      values.push(validatedData.end_date);
    }

    if (updates.length === 0) {
      return NextResponse.json({
        success: true,
        data: existing,
        message: 'No changes made',
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    execute(
      `UPDATE achievements SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updated = queryOne<Achievement>(
      'SELECT * FROM achievements WHERE id = ?',
      [id]
    );

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Achievement updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
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

    if (employee.role !== 'admin' && employee.role !== 'hr') {
      throw new AuthorizationError('Only Admin or HR can delete achievements');
    }

    const existing = queryOne<Achievement>(
      'SELECT * FROM achievements WHERE id = ?',
      [id]
    );

    if (!existing) {
      throw new NotFoundError('Achievement not found');
    }

    execute('DELETE FROM achievements WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Achievement deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
