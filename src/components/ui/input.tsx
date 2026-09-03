import * as React from 'react';
import { Input as BaseInput } from '@base-ui/react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <BaseInput
        type={type}
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-input/80 bg-background/60 px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors backdrop-blur-sm',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
