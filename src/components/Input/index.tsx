import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | boolean | null;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  wrapperClassName?: string;
  inputClassName?: string;
  inputWrapperClassName?: string;
  maxLength?: number;
}

const baseClass =
  'bg-white border border-gray rounded-lg transition-[.2s] min-h-[48px] px-[15px] py-3 text-base leading-[22px] hover:border-blue focus:border-blue-active placeholder:text-gray';

export default function Input({
  label,
  error = null,
  iconLeft,
  iconRight,
  wrapperClassName = '',
  inputWrapperClassName = '',
  inputClassName = '',
  maxLength = 100,
  type = 'text',
  ...props
}: InputProps) {
  // Remove arrows for number input
  const inputType = type === 'number' ? 'number' : type;
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (type === 'number' && inputRef.current) {
      inputRef.current.setAttribute('inputmode', 'numeric');
      inputRef.current.setAttribute('pattern', '[0-9]*');
      // @ts-expect-error: vendor property for Firefox
      inputRef.current.style.MozAppearance = 'textfield';
      inputRef.current.style.appearance = 'textfield';
    }
  }, [type]);

  return (
    <div className={`flex flex-col items-start ${wrapperClassName}`}>
      {label && (
        <label className="mb-2 text-xs leading-[12px] gap-2 font-bold text-black uppercase">
          {label}
        </label>
      )}
      <div className={`relative flex items-center ${inputWrapperClassName}`}>
        {iconLeft && <span className="absolute left-4">{iconLeft}</span>}
        <input
          ref={inputRef}
          type={inputType}
          maxLength={maxLength}
          className={`${baseClass} ${error ? 'border-error' : ''} ${iconLeft ? 'pl-12' : ''} ${
            iconRight ? 'pr-12' : ''
          } ${inputClassName}`.trim()}
          onWheel={type === 'number' ? (e) => e.currentTarget.blur() : undefined}
          {...props}
        />
        {iconRight && <span className="absolute right-4">{iconRight}</span>}
      </div>
      {typeof error === 'string' && error && (
        <div className="text-error leading-[22px] text-base">{error}</div>
      )}
    </div>
  );
}
