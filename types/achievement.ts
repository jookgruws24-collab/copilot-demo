export type AchievementStatus = 'upcoming' | 'ongoing' | 'expired';

export interface Achievement {
  id: number;
  title: string;
  description: string;
  conditions: string;
  diamond_reward: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface AchievementCreate {
  title: string;
  description: string;
  conditions: string;
  diamond_reward: number;
  start_date: string;
  end_date: string;
}

export interface AchievementUpdate {
  title?: string;
  description?: string;
  conditions?: string;
  diamond_reward?: number;
  start_date?: string;
  end_date?: string;
}

export interface AchievementWithStatus extends Achievement {
  status: AchievementStatus;
}

export interface AchievementProgress {
  id: number;
  employee_id: number;
  achievement_id: number;
  progress_percentage: number;
  status: 'upcoming' | 'on_doing' | 'completed' | 'claimed';
  claimed_at?: string | null;
  created_at: string;
  updated_at: string;
}
