'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { InvitationCodeForm } from '@/components/invitations/InvitationCodeForm';
import { InvitationCodeList } from '@/components/invitations/InvitationCodeList';

export default function InvitationsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCodeCreated = () => {
    // Refresh the list by changing the key
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <RoleGuard allowedRoles={['admin', 'hr']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invitation Codes</h1>
          <p className="mt-2 text-gray-600">
            Generate and manage invitation codes for new employee registration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generate New Code */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Generate New Code</CardTitle>
              </CardHeader>
              <CardContent>
                <InvitationCodeForm onSuccess={handleCodeCreated} />
              </CardContent>
            </Card>
          </div>

          {/* Existing Codes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Existing Invitation Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <InvitationCodeList key={refreshKey} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Information Box */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900">About Invitation Codes</h3>
                <div className="mt-2 text-sm text-blue-700 space-y-1">
                  <p>• Invitation codes never expire and can be reused multiple times</p>
                  <p>• Codes are optional - employees can register without one</p>
                  <p>• Use labels to organize codes by recruitment batch or department</p>
                  <p>• Deactivated codes will not be accepted during registration</p>
                  <p>• Click on any code to copy it to your clipboard</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
