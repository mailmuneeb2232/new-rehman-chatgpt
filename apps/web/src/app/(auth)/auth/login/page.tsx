import type { Metadata } from 'next';
import { LoginForm } from './_components/login-form';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Sign In — ElectroStore' };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black">ElectroStore</Link>
          <h1 className="mt-6 text-3xl font-black text-zinc-900 dark:text-white">Welcome back</h1>
          <p className="mt-2 text-zinc-500">Sign in to your account to continue.</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <LoginForm />
          <p className="mt-6 text-center text-sm text-zinc-500">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-semibold text-zinc-900 hover:underline dark:text-white">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
