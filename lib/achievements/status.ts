import type { Achievement, AchievementStatus, AchievementWithStatus } from '@/types/achievement';

/**
 * Calculate achievement status based on current date and time boundaries
 */
export function calculateAchievementStatus(achievement: Achievement): AchievementStatus {
  const now = new Date();
  const startDate = new Date(achievement.start_date);
  const endDate = new Date(achievement.end_date);

  if (now < startDate) {
    return 'upcoming';
  } else if (now >= startDate && now <= endDate) {
    return 'ongoing';
  } else {
    return 'expired';
  }
}

/**
 * Add status to achievement object
 */
export function addStatusToAchievement(achievement: Achievement): AchievementWithStatus {
  return {
    ...achievement,
    status: calculateAchievementStatus(achievement),
  };
}

/**
 * Add status to multiple achievements
 */
export function addStatusToAchievements(achievements: Achievement[]): AchievementWithStatus[] {
  return achievements.map(addStatusToAchievement);
}

/**
 * Filter achievements by status
 */
export function filterByStatus(
  achievements: AchievementWithStatus[],
  status: AchievementStatus
): AchievementWithStatus[] {
  return achievements.filter(a => a.status === status);
}

/**
 * Group achievements by status
 */
export function groupByStatus(achievements: Achievement[]): {
  upcoming: AchievementWithStatus[];
  ongoing: AchievementWithStatus[];
  expired: AchievementWithStatus[];
} {
  const withStatus = addStatusToAchievements(achievements);
  return {
    upcoming: filterByStatus(withStatus, 'upcoming'),
    ongoing: filterByStatus(withStatus, 'ongoing'),
    expired: filterByStatus(withStatus, 'expired'),
  };
}
