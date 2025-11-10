import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">🏆 Employee Rewards</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Demo Credentials</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>Admin: admin@company.com / admin123</p>
              <p>HR: hr@company.com / hr123456</p>
              <p>User: john@company.com / user1234</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
