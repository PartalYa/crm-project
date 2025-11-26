import React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import Check from '@assets/check.svg?react';

export interface CheckboxProps {
  label?: string;
  children?: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  wrapperClassName?: string;
  checkboxClassName?: string;
  labelClassName?: string;
}

export default function Checkbox({
  label,
  checked = false,
  onCheckedChange,
  disabled = false,
  wrapperClassName = '',
  checkboxClassName = '',
  labelClassName = '',
  children,
  ...props
}: CheckboxProps & React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <div className={`flex gap-2 items-center ${wrapperClassName}`}>
      <CheckboxPrimitive.Root
        className={`
          h-4 w-4 rounded-[3px] border bg-white border-gray 
          hover:border-blue disabled:bg-gray-accent
          data-[state=checked]:bg-blue data-[state=checked]:border-blue
          transition-all duration-200
          flex items-center justify-center
          ${checkboxClassName}
        `}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center">
          <Check className="h-3 w-3 text-white fill-current" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label
          className={`text-base leading-[22px] cursor-pointer ${labelClassName}`}
          onClick={() => !disabled && onCheckedChange?.(!checked)}
        >
          {label}
        </label>
      )}
      {children && <div className="flex-1">{children}</div>}
    </div>
  );
}
