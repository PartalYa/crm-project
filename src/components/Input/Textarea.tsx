import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | boolean | null;
  wrapperClassName?: string;
  textareaClassName?: string;
}

const baseClass =
  'bg-white border border-gray rounded-lg transition-[.2s] min-h-[120px] px-[15px] py-3 text-base leading-[22px] hover:border-blue focus:border-blue-active placeholder:text-gray resize-none w-full';

export default function Textarea({
  label,
  error = null,
  wrapperClassName = '',
  textareaClassName = '',
  ...props
}: TextareaProps) {
  return (
    <div className={`flex flex-col items-start ${wrapperClassName}`}>
      {label && (
        <label className="mb-2 text-xs leading-[12px] gap-2 font-bold text-black uppercase">
          {label}
        </label>
      )}
      <textarea
        className={`${baseClass} ${error ? 'border-error' : ''} ${textareaClassName}`.trim()}
        {...props}
      />
      {typeof error === 'string' && error && (
        <div className="text-error leading-[22px] text-base">{error}</div>
      )}
    </div>
  );
}
