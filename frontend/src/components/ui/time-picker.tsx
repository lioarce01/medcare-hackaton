import React from 'react';
import { cn } from '../../lib/utils';

export interface TimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, value, onChange, ...props }, ref) => {
    return (
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

TimePicker.displayName = 'TimePicker'; 