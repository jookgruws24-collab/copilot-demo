import { Card, CardContent } from '@/components/ui';
import { formatDateTime } from '@/lib/utils/dates';
import type { EmployeePublic } from '@/types/database';

interface EmployeeCardProps {
  employee: EmployeePublic;
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    hr: 'bg-blue-100 text-blue-700',
    user: 'bg-gray-100 text-gray-700',
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {employee.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                <p className="text-sm text-gray-500">{employee.employee_id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900">{employee.email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Contact</p>
                <p className="text-gray-900">{employee.contact}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-gray-900">{employee.address}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full capitalize ${roleColors[employee.role]}`}>
                  {employee.role}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Diamond Balance</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">💎</span>
                  <span className="text-2xl font-bold text-gray-900">{employee.diamond_balance}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Joined</p>
                <p className="text-gray-900">{formatDateTime(employee.created_at)}</p>
              </div>

              {employee.invitation_code_used && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Invitation Code Used</p>
                  <p className="font-mono text-gray-900">{employee.invitation_code_used}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
