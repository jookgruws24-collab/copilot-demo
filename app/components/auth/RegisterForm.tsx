'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    password: '',
    contact: '',
    address: '',
    invitation_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Registration successful, redirect to profile
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Employee ID"
          name="employee_id"
          value={formData.employee_id}
          onChange={handleChange}
          required
          placeholder="EMP001"
        />
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="John Doe"
        />
      </div>

      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="john@company.com"
      />

      <Input
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required
        placeholder="Min. 8 characters"
        helperText="Must be at least 8 characters long"
      />

      <Input
        label="Contact"
        name="contact"
        value={formData.contact}
        onChange={handleChange}
        required
        placeholder="+1-555-0123"
      />

      <Input
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        required
        placeholder="123 Main St, City, State 12345"
      />

      <Input
        label="Invitation Code (Optional)"
        name="invitation_code"
        value={formData.invitation_code}
        onChange={handleChange}
        placeholder="ABCD-1234"
        helperText="Enter invitation code if you have one"
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        Create Account
      </Button>

      <div className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign in
        </a>
      </div>
    </form>
  );
}
