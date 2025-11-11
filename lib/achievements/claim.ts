import { execute, queryOne, transaction } from '@/lib/db/client';
import type { Achievement, AchievementProgress } from '@/types/achievement';
import type { Employee } from '@/types/employee';

export interface ClaimResult {
  success: boolean;
  newBalance: number;
  claimed_at: string;
}

export function claimAchievementReward(
  employeeId: number,
  achievementId: number
): ClaimResult {
  return transaction(() => {
    // Get achievement details
    const achievement = queryOne<Achievement>(
      'SELECT * FROM achievements WHERE id = ?',
      [achievementId]
    );

    if (!achievement) {
      throw new Error('Achievement not found');
    }

    // Check if achievement is expired
    const now = new Date();
    const endDate = new Date(achievement.end_date);
    if (now > endDate) {
      throw new Error('Cannot claim expired achievement');
    }

    // Get progress record
    const progress = queryOne<AchievementProgress>(
      'SELECT * FROM achievement_progress WHERE employee_id = ? AND achievement_id = ?',
      [employeeId, achievementId]
    );

    if (!progress) {
      throw new Error('Achievement progress not found');
    }

    // Check if already claimed
    if (progress.status === 'claimed') {
      throw new Error('Achievement reward already claimed');
    }

    // Check if progress is 100%
    if (progress.progress_percentage !== 100) {
      throw new Error('Achievement not completed yet');
    }

    // Update employee's diamond balance
    execute(
      'UPDATE employees SET diamond_balance = diamond_balance + ? WHERE id = ?',
      [achievement.diamond_reward, employeeId]
    );

    // Get new balance
    const employee = queryOne<Employee>(
      'SELECT diamond_balance FROM employees WHERE id = ?',
      [employeeId]
    );

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Update progress status to claimed
    const claimedAt = new Date().toISOString();
    execute(
      `UPDATE achievement_progress 
       SET status = 'claimed', claimed_at = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE employee_id = ? AND achievement_id = ?`,
      [claimedAt, employeeId, achievementId]
    );

    // Insert history record
    execute(
      `INSERT INTO history (employee_id, type, action, details, diamonds_change) 
       VALUES (?, 'claim', 'claimed', ?, ?)`,
      [
        employeeId,
        JSON.stringify({
          achievement_id: achievementId,
          achievement_title: achievement.title,
          diamond_reward: achievement.diamond_reward,
        }),
        achievement.diamond_reward,
      ]
    );

    return {
      success: true,
      newBalance: employee.diamond_balance,
      claimed_at: claimedAt,
    };
  });
}
