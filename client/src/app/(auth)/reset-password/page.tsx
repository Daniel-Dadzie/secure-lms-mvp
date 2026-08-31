'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/reset-password', { token, newPassword: password });
      setStatus('Password reset successful! You can now log in.');
    } catch (err: any) {
      setStatus(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Set New Password</h1>
      {status && <p className="mb-4 text-sm text-center">{status}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-green-700 text-white p-2 rounded">
          Update Password
        </button>
      </form>
    </div>
  );
}