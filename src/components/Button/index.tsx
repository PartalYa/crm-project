import LoadingSpinner from '../LoadingSpinner';

type ButtonProps = {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
};

export default function Button({
  label,
  icon,
  onClick,
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'medium',
  loading = false,
}: ButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children?: React.ReactNode;
  }) {
  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-6 py-2 text-base',
    large: 'px-4 py-3 text-lg',
  };
  const variantClasses = {
    primary: 'bg-blue min-h-[40px] text-white hover:bg-blue-hover active:bg-blue-active',
    secondary: 'bg-white min-h-[48px] text-black hover:text-blue active:text-blue-active',
    tertiary: 'bg-black min-h-[40px] text-white hover:bg-black-hover',
    ghost:
      'bg-transparent border min-h-[40px] text-blue hover:text-blue-hover active:text-blue-active border-blue hover:border-blue-hover active:border-blue-active',
  };
  const loadingClasses = loading ? 'cursor-wait' : '';

  const disabledClasses = {
    primary: 'bg-gray hover:bg-gray active:bg-gray text-white cursor-default',
    secondary: 'text-gray hover:text-gray-dark active:text-gray-dark cursor-default',
    tertiary: 'bg-gray hover:bg-gray active:bg-gray text-white cursor-default',
    ghost: 'text-gray hover:text-gray-dark active:text-gray-dark cursor-default border-gray',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center font-semibold justify-center gap-2 rounded-lg transition-[.2s] [&>svg]:fill-current [&>svg]:shrink-0 ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${loadingClasses} ${
        disabled ? disabledClasses[variant] : ''
      } ${className}`}
      {...(loading ? { 'aria-busy': true, 'aria-label': 'Loading...' } : {})}
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {icon && icon}
          {label}
        </>
      )}
    </button>
  );
}
