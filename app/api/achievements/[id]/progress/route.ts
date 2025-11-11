import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { execute, queryOne } from '@/lib/db/client';
import { handleApiError, AuthenticationError, AuthorizationError, NotFoundError } from '@/lib/utils/errors';
import { z } from 'zod';
import type { AchievementProgress } from '@/types/achievement';

const progressUpdateSchema = z.object({
  progress_percentage: z.number().int().min(0).max(100),
  employee_id: z.number().int().positive().optional(), // For admin/HR to update other employees
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

    // Only Admin/HR can update progress
    if (employee.role !== 'admin' && employee.role !== 'hr') {
      throw new AuthorizationError('Only Admin or HR can update achievement progress');
    }

    const body = await request.json();
    const validatedData = progressUpdateSchema.parse(body);

    // Determine which employee's progress to update
    const targetEmployeeId = validatedData.employee_id || employee.id;

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
      [targetEmployeeId, id]
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
          validatedData.progress_percentage === 100 ? 'completed' : 'on_doing',
          targetEmployeeId,
          id,
        ]
      );
    } else {
      // Create new progress record
      execute(
        `INSERT INTO achievement_progress (employee_id, achievement_id, progress_percentage, status) 
         VALUES (?, ?, ?, ?)`,
        [
          targetEmployeeId,
          id,
          validatedData.progress_percentage,
          validatedData.progress_percentage === 100 ? 'completed' : 'on_doing',
        ]
      );
    }

    // Fetch updated progress
    const updatedProgress = queryOne<AchievementProgress>(
      'SELECT * FROM achievement_progress WHERE employee_id = ? AND achievement_id = ?',
      [targetEmployeeId, id]
    );

    return NextResponse.json({
      success: true,
      data: updatedProgress,
      message: 'Progress updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
