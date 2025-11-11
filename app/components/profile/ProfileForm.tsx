'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import type { EmployeePublic } from '@/types/database';

interface ProfileFormProps {
  employee: EmployeePublic;
  onSuccess?: () => void;
}

export function ProfileForm({ employee, onSuccess }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: employee.name,
    email: employee.email,
    contact: employee.contact,
    address: employee.address,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      
      // Reload page to refresh employee data
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <Input
        label="Contact"
        name="contact"
        value={formData.contact}
        onChange={handleChange}
        required
      />

      <Input
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        required
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-600">
          Profile updated successfully!
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        Save Changes
      </Button>
    </form>
  );
}
