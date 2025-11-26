import React from 'react';
import CrossIcon from '../../assets/cross.svg?react';

interface PopupProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  showCross?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

const Popup: React.FC<PopupProps> = ({
  open,
  onClose,
  children,
  showCross = true,
  width,
  height,
  className = '',
  style = {},
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      style={{ top: 0, left: 0 }}
    >
      <div
        className={`relative bg-white rounded-2xl p-[48px] shadow-xl ${className}`}
        style={{ width, height, ...style }}
        role="dialog"
        aria-modal="true"
      >
        {showCross && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close popup"
          >
            <CrossIcon className="w-6 h-6" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Popup;
