'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { formatDateTime } from '@/lib/utils/dates';
import type { EmployeePublic } from '@/types/database';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeePublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      // For now, we'll fetch all employees via auth/me as a placeholder
      // In production, you'd want a dedicated /api/employees endpoint
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (response.ok) {
        // This is just showing current user - extend to list all employees
        setEmployees([data.data]);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (employeeId: number, newRole: string) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchEmployees();
        alert('Role updated successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update role');
      }
    } catch (error) {
      alert('Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'hr']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="mt-2 text-gray-600">
            View and manage employee accounts and roles
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No employees found</p>
            ) : (
              <div className="space-y-4">
                {employees.map((emp) => (
                  <div key={emp.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                            <p className="text-sm text-gray-500">{emp.employee_id} • {emp.email}</p>
                          </div>
                        </div>

                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Contact:</span>
                            <p className="font-medium">{emp.contact}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Balance:</span>
                            <p className="font-medium">💎 {emp.diamond_balance}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Role:</span>
                            <span className={`ml-1 px-2 py-0.5 text-xs rounded-full capitalize ${
                              emp.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                              emp.role === 'hr' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {emp.role}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Joined:</span>
                            <p className="font-medium text-xs">{formatDateTime(emp.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col space-y-2">
                        <select
                          value={emp.role}
                          onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="user">User</option>
                          <option value="hr">HR</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900">Employee Management</h3>
                <div className="mt-2 text-sm text-blue-700 space-y-1">
                  <p>• Change employee roles from User → HR → Admin</p>
                  <p>• Admin role has full system access</p>
                  <p>• HR can manage achievements and invitations</p>
                  <p>• Note: This is a demo view showing current employee only</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
