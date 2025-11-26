import React from 'react';
import { PhoneInput as InternationalPhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import './phone-input.css';

// Define specific types for country data
export interface CountryData {
  name: string;
  iso2: string;
  dialCode: string;
}

export interface PhoneInputProps {
  label?: string;
  error?: string | boolean | null;
  value?: string;
  onChange?: (value: string, data: { country?: CountryData }) => void;
  placeholder?: string;
  disabled?: boolean;
  wrapperClassName?: string;
  inputClassName?: string;
  defaultCountry?: string;
  forceDialCode?: boolean;
  countrySelectorStyleProps?: {
    className?: string;
    buttonClassName?: string;
    buttonContentWrapperClassName?: string;
  };
  style?: React.CSSProperties;
}

export default function PhoneInputComponent({
  label,
  error = null,
  value,
  onChange,
  placeholder = 'Enter phone number',
  disabled = false,
  wrapperClassName = '',
  inputClassName = '',
  defaultCountry = 'UA',
  forceDialCode = true,
  countrySelectorStyleProps,
  style,
  ...props
}: PhoneInputProps) {
  const handleChange = (value: string, data: { country?: CountryData }) => {
    if (onChange) {
      onChange(value, data);
    }
  };
  return (
    <div className={`flex flex-col items-start ${wrapperClassName}`}>
      {label && (
        <label className="mb-1 text-xs leading-[12px] gap-2 font-bold text-black uppercase">
          {label}
        </label>
      )}
      <div className="relative w-full">
        {' '}
        <InternationalPhoneInput
          defaultCountry={defaultCountry.toLowerCase()}
          forceDialCode={forceDialCode}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          disabled={disabled}
          className={`phone-input ${error ? 'error' : ''} ${inputClassName}`}
          style={{
            minHeight: '48px',
            height: '100%',
            flex: 1,
            gap: '12px',
            padding: '0 15px',
            paddingLeft: '67px',
            ...style,
          }}
          inputStyle={{
            backgroundColor: 'transparent',
            border: 'none',
            flex: 1,
            height: '100%',
            padding: '0',
          }}
          inputClassName={`text-base leading-[22px] placeholder:text-gray ${
            disabled ? 'opacity-70' : ''
          }`}
          countrySelectorStyleProps={{
            className: '!h-full',
            buttonClassName: '!h-full !border-none !bg-transparent',
            buttonContentWrapperClassName: '!gap-2',
            ...countrySelectorStyleProps,
          }}
          arrowComponent={() => (
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="red"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1.5L6 6.5L11 1.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
          {...props}
        />
      </div>
      {typeof error === 'string' && error && (
        <div className="text-error leading-[22px] text-base mt-1">{error}</div>
      )}
    </div>
  );
}
