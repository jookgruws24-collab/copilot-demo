'use client';

import type { AchievementStatus } from '@/types/achievement';

interface StatusBadgeProps {
  status: AchievementStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementStatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const statusConfig = {
    upcoming: {
      label: 'Upcoming',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      icon: '📅',
    },
    ongoing: {
      label: 'On Doing',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      icon: '🎯',
    },
    expired: {
      label: 'Expired',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      icon: '⏰',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
