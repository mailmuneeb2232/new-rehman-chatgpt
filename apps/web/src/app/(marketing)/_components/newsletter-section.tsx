'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-20 bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">
            <Mail size={24} className="text-violet-600 dark:text-violet-400" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-4">Stay in the Loop</h2>
        <p className="text-zinc-500 mb-8">Get exclusive deals, new arrival alerts, and tech news delivered to your inbox.</p>

        {submitted ? (
          <p className="text-green-600 dark:text-green-400 font-semibold">Thanks! You're on the list. 🎉</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit">Subscribe</Button>
          </form>
        )}
      </div>
    </section>
  );
}
