'use client';

import { useState } from 'react';
import { AchievementCard } from './AchievementCard';
import type { AchievementWithStatus, AchievementStatus } from '@/types/achievement';

interface AchievementListProps {
  achievements: AchievementWithStatus[];
  showActions?: boolean;
  onEdit?: (achievement: AchievementWithStatus) => void;
  onDelete?: (id: number) => void;
}

export function AchievementList({ achievements, showActions = false, onEdit, onDelete }: AchievementListProps) {
  const [filterStatus, setFilterStatus] = useState<AchievementStatus | 'all'>('all');

  const filteredAchievements = filterStatus === 'all'
    ? achievements
    : achievements.filter(a => a.status === filterStatus);

  const statusCounts = {
    all: achievements.length,
    upcoming: achievements.filter(a => a.status === 'upcoming').length,
    ongoing: achievements.filter(a => a.status === 'ongoing').length,
    expired: achievements.filter(a => a.status === 'expired').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({statusCounts.all})
        </button>
        <button
          onClick={() => setFilterStatus('upcoming')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filterStatus === 'upcoming'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Upcoming ({statusCounts.upcoming})
        </button>
        <button
          onClick={() => setFilterStatus('ongoing')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filterStatus === 'ongoing'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          On Doing ({statusCounts.ongoing})
        </button>
        <button
          onClick={() => setFilterStatus('expired')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filterStatus === 'expired'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Expired ({statusCounts.expired})
        </button>
      </div>

      <div className="space-y-4">
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No achievements found</p>
          </div>
        ) : (
          filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              showActions={showActions}
              onEdit={onEdit ? () => onEdit(achievement) : undefined}
              onDelete={onDelete ? () => onDelete(achievement.id) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
