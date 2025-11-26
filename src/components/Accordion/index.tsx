import { useRef, useState } from 'react';
import AngleDown from '@assets/angle-down.svg?react';

interface AccordionProps {
  title?: string;
  header?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function Accordion({
  title,
  header,
  children,
  defaultOpen = false,
  className = '',
  isOpen,
  setIsOpen,
}: AccordionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  // Use controlled state if provided, otherwise use internal state
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = setIsOpen || setInternalOpen;

  return (
    <div className={`${className}`}>
      <button
        type="button"
        className="flex justify-between items-center w-full text-base font-medium focus:outline-none"
        onClick={() => setOpen(!open)}
      >
        {header || <span>{title}</span>}
        <AngleDown
          className={`w-6 h-6 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        ref={contentRef}
        style={{
          maxHeight: open ? contentRef.current?.scrollHeight : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}
