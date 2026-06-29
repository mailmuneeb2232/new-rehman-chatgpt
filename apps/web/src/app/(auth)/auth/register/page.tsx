import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from './_components/register-form';

export const metadata: Metadata = { title: 'Create Account — ElectroStore' };

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black">ElectroStore</Link>
          <h1 className="mt-6 text-3xl font-black text-zinc-900 dark:text-white">Create account</h1>
          <p className="mt-2 text-zinc-500">Start shopping in seconds.</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-zinc-900 hover:underline dark:text-white">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
