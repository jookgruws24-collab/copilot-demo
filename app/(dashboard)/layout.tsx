'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import type { EmployeePublic } from '@/types/database';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [employee, setEmployee] = useState<EmployeePublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployee() {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        const data = await response.json();
        setEmployee(data.data);
      } catch (error) {
        console.error('Failed to fetch employee:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    fetchEmployee();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isActive = (path: string) => pathname === path;
  const isAdmin = employee?.role === 'admin';
  const isHR = employee?.role === 'hr';
  const isAdminOrHR = isAdmin || isHR;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/profile" className="text-xl font-bold text-blue-600">
                  🏆 Rewards
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                <Link
                  href="/profile"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    isActive('/profile')
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  Profile
                </Link>

                <Link
                  href="/achievements"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    isActive('/achievements')
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  Achievements
                </Link>

                <Link
                  href="/store"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    isActive('/store')
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  Store
                </Link>

                <Link
                  href="/history"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    isActive('/history')
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  History
                </Link>

                {/* Admin/HR Links */}
                {isAdminOrHR && (
                  <>
                    <Link
                      href="/admin/achievements"
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                        pathname?.startsWith('/admin/achievements')
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-700 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                      }`}
                    >
                      Manage Achievements
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin/approvals"
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                          isActive('/admin/approvals')
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-700 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                        }`}
                      >
                        Approvals
                      </Link>
                    )}

                    <Link
                      href="/admin/invitations"
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                        isActive('/admin/invitations')
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-700 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                      }`}
                    >
                      Invitations
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Diamond Balance */}
              <div className="hidden sm:flex items-center px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
                <span className="text-yellow-600 font-semibold">💎</span>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {employee?.diamond_balance || 0}
                </span>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {employee?.name}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {employee?.role}
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2025 Employee Rewards System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
