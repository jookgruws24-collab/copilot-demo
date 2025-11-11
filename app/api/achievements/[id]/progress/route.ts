import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { execute, queryOne } from '@/lib/db/client';
import { handleApiError, AuthenticationError, NotFoundError } from '@/lib/utils/errors';
import { z } from 'zod';
import type { AchievementProgress } from '@/types/achievement';

const progressUpdateSchema = z.object({
  progress_percentage: z.number().int().min(0).max(100),
});

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

    const body = await request.json();
    const validatedData = progressUpdateSchema.parse(body);

    // Check if achievement exists
    const achievement = queryOne(
      'SELECT * FROM achievements WHERE id = ?',
      [id]
    );

    if (!achievement) {
      throw new NotFoundError('Achievement not found');
    }

    // Check if progress record exists
    const existingProgress = queryOne<AchievementProgress>(
      'SELECT * FROM achievement_progress WHERE employee_id = ? AND achievement_id = ?',
      [employee.id, id]
    );

    if (existingProgress) {
      // Update existing progress
      execute(
        `UPDATE achievement_progress 
         SET progress_percentage = ?, 
             status = ?, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE employee_id = ? AND achievement_id = ?`,
        [
          validatedData.progress_percentage,
          validatedData.progress_percentage === 100 ? 'completed' : 'in_progress',
          employee.id,
          id,
        ]
      );
    } else {
      // Create new progress record
      execute(
        `INSERT INTO achievement_progress (employee_id, achievement_id, progress_percentage, status) 
         VALUES (?, ?, ?, ?)`,
        [
          employee.id,
          id,
          validatedData.progress_percentage,
          validatedData.progress_percentage === 100 ? 'completed' : 'in_progress',
        ]
      );
    }

    // Fetch updated progress
    const updatedProgress = queryOne<AchievementProgress>(
      'SELECT * FROM achievement_progress WHERE employee_id = ? AND achievement_id = ?',
      [employee.id, id]
    );

    return NextResponse.json({
      success: true,
      data: updatedProgress,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
