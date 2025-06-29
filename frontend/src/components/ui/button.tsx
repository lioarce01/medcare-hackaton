import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'text-white shadow hover:opacity-90 dark:text-white dark:border dark:border-gray-600 dark:hover:border-gray-500',
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-700 dark:bg-red-600 dark:text-white dark:border dark:border-red-500 dark:hover:bg-red-700 dark:hover:border-red-400',
        outline:
          'border border-gray-300 text-white shadow-sm hover:opacity-90 dark:text-white dark:border-gray-600 dark:hover:border-gray-500',
        secondary:
          'text-white shadow-sm hover:opacity-90 dark:text-white dark:border dark:border-gray-600 dark:hover:border-gray-500',
        ghost: 'text-gray-900 hover:text-white dark:text-white dark:hover:border dark:hover:border-gray-600',
        link: 'text-gray-900 underline-offset-4 hover:underline dark:text-white',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
