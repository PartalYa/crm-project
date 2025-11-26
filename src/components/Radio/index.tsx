import React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

export interface RadioItemProps {
  value: string;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

export interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function RadioItem({
  value,
  children,
  disabled = false,
  className = '',
  error = false,
}: RadioItemProps) {
  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <RadioGroupPrimitive.Item
        className={`
          h-4 w-4 rounded-full border bg-white border-gray 
          hover:border-blue disabled:bg-gray-dark disabled:border-gray
          data-[state=checked]:bg-blue data-[state=checked]:border-blue
          transition-all duration-200
          flex items-center justify-center
          ${error ? 'border-error' : ''}
        `}
        value={value}
        disabled={disabled}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <div className="h-1 w-1 bg-white rounded-full" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      {children && (
        <div className="cursor-pointer" onClick={() => !disabled}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function RadioGroup({
  value,
  onValueChange,
  disabled = false,
  children,
  className = '',
  orientation = 'vertical',
}: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      className={`flex ${
        orientation === 'horizontal' ? 'flex-row gap-6' : 'flex-col gap-2'
      } ${className}`}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      orientation={orientation}
    >
      {children}
    </RadioGroupPrimitive.Root>
  );
}

// Export both as named exports for flexibility
export { RadioGroup };
