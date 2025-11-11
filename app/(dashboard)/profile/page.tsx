'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { EmployeeCard } from '@/components/profile/EmployeeCard';
import { ProfileForm } from '@/components/profile/ProfileForm';
import type { EmployeePublic } from '@/types/database';

export default function ProfilePage() {
  const [employee, setEmployee] = useState<EmployeePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        console.log('[Profile] Fetching profile from /api/auth/me');
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        const data = await response.json();
        
        console.log('[Profile] Response status:', response.status, 'data:', data);
        
        if (response.ok) {
          setEmployee(data.data);
          setError(null);
        } else {
          const errorMsg = data.error || 'Failed to load profile';
          console.error('[Profile] Failed to fetch profile:', errorMsg);
          setError(errorMsg);
        }
      } catch (error) {
        console.error('[Profile] Failed to fetch profile:', error);
        setError('Network error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Failed to load profile</h2>
          {error && (
            <p className="text-sm text-red-700">{error}</p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-2 text-gray-600">
          View and manage your employee profile information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Display */}
        <div className="lg:col-span-2">
          <EmployeeCard employee={employee} />
        </div>

        {/* Edit Profile */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              {!showEdit ? (
                <button
                  onClick={() => setShowEdit(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Information
                </button>
              ) : (
                <div>
                  <button
                    onClick={() => setShowEdit(false)}
                    className="mb-4 text-sm text-gray-600 hover:text-gray-900"
                  >
                    ← Cancel
                  </button>
                  <ProfileForm employee={employee} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardContent>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Diamond Balance</span>
                  <span className="font-bold text-gray-900">💎 {employee.diamond_balance}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Role</span>
                  <span className="font-medium text-gray-900 capitalize">{employee.role}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
