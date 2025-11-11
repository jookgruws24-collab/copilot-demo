'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { AchievementForm } from '@/components/achievements/AchievementForm';
import { AchievementList } from '@/components/achievements/AchievementList';
import type { AchievementWithStatus, Achievement } from '@/types/achievement';

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements', {
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setAchievements(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to load achievements');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleSuccess = () => {
    setShowForm(false);
    setEditingAchievement(null);
    fetchAchievements();
  };

  const handleEdit = (achievement: AchievementWithStatus) => {
    setEditingAchievement(achievement);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this achievement?')) {
      return;
    }

    try {
      const response = await fetch(`/api/achievements/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchAchievements();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete achievement');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAchievement(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Achievement Management</h1>
          <p className="mt-2 text-gray-600">
            Create and manage achievements for employees
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            + Create Achievement
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAchievement ? 'Edit Achievement' : 'Create New Achievement'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AchievementForm
              achievement={editingAchievement || undefined}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          All Achievements ({achievements.length})
        </h2>
        <AchievementList
          achievements={achievements}
          showActions
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
