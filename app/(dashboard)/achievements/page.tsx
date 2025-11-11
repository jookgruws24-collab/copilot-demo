'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { AchievementStatusBadge } from '@/components/achievements/StatusBadge';
import { ProgressBar } from '@/components/achievements/ProgressBar';
import { ClaimButton } from '@/components/achievements/ClaimButton';
import { groupByStatus } from '@/lib/achievements/status';
import type { AchievementWithStatus, AchievementProgress } from '@/types/achievement';
import type { Employee } from '@/types/employee';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<{
    upcoming: AchievementWithStatus[];
    ongoing: AchievementWithStatus[];
    expired: AchievementWithStatus[];
  }>({
    upcoming: [],
    ongoing: [],
    expired: [],
  });
  const [progress, setProgress] = useState<Map<number, AchievementProgress>>(new Map());
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Fetch current employee
      const empResponse = await fetch('/api/auth/me', { credentials: 'include' });
      const empData = await empResponse.json();
      
      if (!empResponse.ok) {
        throw new Error('Failed to fetch employee data');
      }
      
      setEmployee(empData.data);

      // Fetch all achievements
      const achResponse = await fetch('/api/achievements', { credentials: 'include' });
      const achData = await achResponse.json();

      if (achResponse.ok) {
        const grouped = groupByStatus(achData.data);
        setAchievements(grouped);
      }

      // Fetch progress for current employee
      if (empData.data?.id) {
        const progResponse = await fetch(`/api/employees/${empData.data.id}/achievements`, {
          credentials: 'include',
        });
        const progData = await progResponse.json();

        if (progResponse.ok) {
          const progressMap = new Map<number, AchievementProgress>();
          progData.data.forEach((p: AchievementProgress) => {
            progressMap.set(p.achievement_id, p);
          });
          setProgress(progressMap);
        }
      }

      setError(null);
    } catch (error) {
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClaimSuccess = (newBalance: number) => {
    if (employee) {
      setEmployee({ ...employee, diamond_balance: newBalance });
    }
    fetchData(); // Refresh data
  };

  const renderAchievementWithProgress = (achievement: AchievementWithStatus) => {
    const prog = progress.get(achievement.id);
    const canClaim = prog?.status === 'completed' && achievement.status === 'ongoing';

    return (
      <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{achievement.title}</CardTitle>
              <AchievementStatusBadge status={achievement.status} />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-2xl font-bold text-purple-600">
                <span>💎</span>
                <span>{achievement.diamond_reward}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-3">{achievement.description}</p>
          
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Conditions:</p>
            <p className="text-sm text-gray-600">{achievement.conditions}</p>
          </div>

          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Timeline:</p>
            <p className="text-sm text-gray-600">
              {new Date(achievement.start_date).toLocaleDateString()} - {new Date(achievement.end_date).toLocaleDateString()}
            </p>
          </div>

          {prog && (
            <div className="mt-4 space-y-3">
              <ProgressBar 
                percentage={prog.progress_percentage} 
                color={prog.progress_percentage === 100 ? 'green' : 'blue'}
              />
              
              {prog.status === 'claimed' && (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <span className="text-xl">✓</span>
                  <span>Claimed on {new Date(prog.claimed_at || '').toLocaleDateString()}</span>
                </div>
              )}

              {canClaim && (
                <ClaimButton
                  achievementId={achievement.id}
                  canClaim={true}
                  onSuccess={handleClaimSuccess}
                />
              )}
            </div>
          )}

          {!prog && achievement.status === 'ongoing' && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 italic">Not started yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl mb-2">⚠️ Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header with Balance */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Achievements</h1>
            <p className="text-gray-600">Track your progress and claim rewards</p>
          </div>
          <Card className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm opacity-90 mb-1">Your Balance</p>
                <div className="flex items-center gap-2 text-3xl font-bold">
                  <span>💎</span>
                  <span>{employee?.diamond_balance || 0}</span>
                </div>
                <p className="text-xs opacity-75 mt-1">Diamonds</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ongoing Achievements */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🎯 On Doing</h2>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {achievements.ongoing.length}
          </span>
        </div>
        {achievements.ongoing.length === 0 ? (
          <p className="text-gray-500 italic">No active achievements</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.ongoing.map(renderAchievementWithProgress)}
          </div>
        )}
      </section>

      {/* Upcoming Achievements */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📅 Upcoming</h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {achievements.upcoming.length}
          </span>
        </div>
        {achievements.upcoming.length === 0 ? (
          <p className="text-gray-500 italic">No upcoming achievements</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.upcoming.map(renderAchievementWithProgress)}
          </div>
        )}
      </section>

      {/* Expired/Completed Achievements */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">⏰ Completed/Expired</h2>
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
            {achievements.expired.length}
          </span>
        </div>
        {achievements.expired.length === 0 ? (
          <p className="text-gray-500 italic">No expired achievements</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.expired.map(renderAchievementWithProgress)}
          </div>
        )}
      </section>
    </div>
  );
}
