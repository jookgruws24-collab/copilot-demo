import { Card, CardContent } from '@/components/ui';
import { formatDateTime } from '@/lib/utils/dates';
import type { AchievementWithStatus } from '@/types/achievement';

interface AchievementCardProps {
  achievement: AchievementWithStatus;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function AchievementCard({ achievement, onEdit, onDelete, showActions = false }: AchievementCardProps) {
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
    ongoing: 'bg-green-100 text-green-700 border-green-200',
    expired: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const statusLabels = {
    upcoming: 'Upcoming',
    ongoing: 'On Doing',
    expired: 'Expired',
  };

  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{achievement.title}</h3>
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[achievement.status]}`}>
                  {statusLabels[achievement.status]}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{achievement.description}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Conditions</p>
                <p className="text-gray-900 text-sm mt-1">{achievement.conditions}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Reward</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl">💎</span>
                  <span className="text-xl font-bold text-gray-900">{achievement.diamond_reward}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <p className="text-gray-900 text-sm mt-1">{formatDateTime(achievement.start_date)}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">End Date</p>
                <p className="text-gray-900 text-sm mt-1">{formatDateTime(achievement.end_date)}</p>
              </div>
            </div>
          </div>

          {showActions && (
            <div className="flex gap-2 border-t pt-4">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
