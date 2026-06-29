'use client';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  max?: number;
  size?: number;
  className?: string;
  showCount?: boolean;
  count?: number;
}

export function Rating({ value, max = 5, size = 16, className, showCount, count }: RatingProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i + 1 <= Math.floor(value);
        const partial = !filled && i < value;
        return (
          <Star
            key={i}
            size={size}
            className={cn(
              filled ? 'fill-amber-400 text-amber-400' : partial ? 'fill-amber-200 text-amber-400' : 'fill-transparent text-zinc-300',
            )}
          />
        );
      })}
      {showCount && count !== undefined && (
        <span className="ml-1 text-xs text-zinc-500">({count.toLocaleString()})</span>
      )}
    </span>
  );
}
