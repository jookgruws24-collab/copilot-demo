'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import type { AchievementCreate, Achievement } from '@/types/achievement';

interface AchievementFormProps {
  achievement?: Achievement;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AchievementForm({ achievement, onSuccess, onCancel }: AchievementFormProps) {
  const [formData, setFormData] = useState<AchievementCreate>({
    title: achievement?.title || '',
    description: achievement?.description || '',
    conditions: achievement?.conditions || '',
    diamond_reward: achievement?.diamond_reward || 0,
    start_date: achievement?.start_date ? new Date(achievement.start_date).toISOString().slice(0, 16) : '',
    end_date: achievement?.end_date ? new Date(achievement.end_date).toISOString().slice(0, 16) : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'diamond_reward' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = achievement
        ? `/api/achievements/${achievement.id}`
        : '/api/achievements';
      const method = achievement ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save achievement');
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save achievement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
        maxLength={200}
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="conditions" className="block text-sm font-medium text-gray-700 mb-1">
          Conditions
        </label>
        <textarea
          id="conditions"
          name="conditions"
          value={formData.conditions}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Input
        label="Diamond Reward"
        name="diamond_reward"
        type="number"
        min="1"
        value={formData.diamond_reward}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          name="start_date"
          type="datetime-local"
          value={formData.start_date}
          onChange={handleChange}
          required
        />

        <Input
          label="End Date"
          name="end_date"
          type="datetime-local"
          value={formData.end_date}
          onChange={handleChange}
          required
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={loading} className="flex-1">
          {achievement ? 'Update Achievement' : 'Create Achievement'}
        </Button>
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
