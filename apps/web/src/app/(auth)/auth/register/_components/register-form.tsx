'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api-client';

export function RegisterForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post<{ user: any }>('/auth/register', form);
      setUser(data.user);
      router.push('/');
    } catch (err: any) {
      setError(err.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">First name</label>
          <Input placeholder="John" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} leftIcon={<User size={16} />} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Last name</label>
          <Input placeholder="Doe" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Email</label>
        <Input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} leftIcon={<Mail size={16} />} required autoComplete="email" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Password</label>
        <Input
          type={showPwd ? 'text' : 'password'}
          placeholder="Min. 8 characters"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          leftIcon={<Lock size={16} />}
          rightIcon={<button type="button" onClick={() => setShowPwd((v) => !v)}>{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
          required
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" className="w-full" loading={loading}>Create Account</Button>
      <p className="text-center text-xs text-zinc-500">
        By creating an account you agree to our{' '}
        <a href="/terms" className="underline">Terms</a> and{' '}
        <a href="/privacy" className="underline">Privacy Policy</a>.
      </p>
    </form>
  );
}
