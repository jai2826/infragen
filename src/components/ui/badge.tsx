import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary/20 text-blue-300 border-blue-500/30 shadow-sm shadow-blue-500/10',
        secondary:
          'border-border/80 bg-secondary/70 text-secondary-foreground',
        destructive:
          'border-transparent bg-destructive/20 text-red-300 border-red-500/30',
        outline:
          'text-foreground border-border/80 bg-card/40',
        success:
          'border-transparent bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        warning:
          'border-transparent bg-amber-500/15 text-amber-300 border-amber-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
