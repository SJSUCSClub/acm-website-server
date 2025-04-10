import { cn } from '@/utils/cn';
import type React from 'react';

export const Spinner: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      {...props}
      className={cn(
        'animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900',
        className
      )}
    ></div>
  );
};
