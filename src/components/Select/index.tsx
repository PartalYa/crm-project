import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import AngleDown from '@assets/angle-down.svg?react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  error?: string | null;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  wrapperClassName?: string;
  selectClassName?: string;
  disabled?: boolean;
  searchable?: boolean;
}

const BASE_CLASSES =
  'bg-white border border-gray rounded-lg transition-[.2s] min-h-[48px] px-[15px] py-3 text-base leading-[22px] hover:border-blue focus:border-blue-active placeholder:text-gray';

const DROPDOWN_CLASSES =
  'absolute top-full left-0 right-0 z-50 mt-1 p-1 bg-white border border-gray rounded-lg max-h-[200px] shadow overflow-auto scrollbar';

const OPTION_CLASSES =
  'px-3 py-2 rounded-lg transition-[.2s] cursor-pointer text-left hover:bg-green-accent';

export default function Select({
  label,
  error = null,
  options,
  value,
  onChange,
  placeholder = 'Choose...',
  wrapperClassName = '',
  selectClassName = '',
  disabled = false,
  searchable = true,
}: SelectProps) {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsContainerRef = useRef<HTMLDivElement>(null);

  // Computed values
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm.trim()) {
      return options;
    }

    const searchLower = searchTerm.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(searchLower));
  }, [options, searchTerm, searchable]);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const displayValue = selectedOption?.label || placeholder;

  // Actions
  const resetState = useCallback(() => {
    setSearchTerm('');
    setHighlightedIndex(-1);
  }, []);

  const openDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    resetState();
  }, [disabled, resetState]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    resetState();
  }, [resetState]);

  const toggleDropdown = useCallback(() => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }, [isOpen, openDropdown, closeDropdown]);

  const selectOption = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      closeDropdown();
    },
    [onChange, closeDropdown],
  );

  // Event handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    // Reset highlight when search changes
    if (newSearchTerm.trim()) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      // If dropdown is closed, handle open keys
      if (!isOpen) {
        if (['ArrowDown', 'Enter', ' '].includes(e.key)) {
          e.preventDefault();
          openDropdown();
        }
        return;
      }

      // Handle navigation when dropdown is open
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            selectOption(filteredOptions[highlightedIndex].value);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const nextIndex = prev < filteredOptions.length - 1 ? prev + 1 : 0;
            return filteredOptions.length > 0 ? nextIndex : -1;
          });
          break;

        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const nextIndex = prev > 0 ? prev - 1 : filteredOptions.length - 1;
            return filteredOptions.length > 0 ? nextIndex : -1;
          });
          break;

        case 'Escape':
          e.preventDefault();
          closeDropdown();
          break;

        case 'Tab':
          closeDropdown();
          break;

        default:
          // For other keys, if searchable and input exists, focus it
          if (searchable && searchInputRef.current && e.key.length === 1) {
            searchInputRef.current.focus();
          }
          break;
      }
    },
    [
      disabled,
      isOpen,
      highlightedIndex,
      filteredOptions,
      openDropdown,
      selectOption,
      closeDropdown,
      searchable,
    ],
  );

  const handleOptionClick = useCallback(
    (optionValue: string) => {
      selectOption(optionValue);
    },
    [selectOption],
  );

  const handleOptionMouseEnter = useCallback((index: number) => {
    setHighlightedIndex(index);
  }, []);

  // Effects
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      // Small delay to ensure the input is rendered
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchable]);

  useEffect(() => {
    if (highlightedIndex >= 0 && optionsContainerRef.current) {
      const optionElement = optionsContainerRef.current.children[highlightedIndex] as HTMLElement;
      if (optionElement) {
        optionElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [highlightedIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [isOpen, closeDropdown]);

  // Render helpers
  const renderSearchInput = () => (
    <input
      ref={searchInputRef}
      type="text"
      value={searchTerm}
      onChange={handleSearchChange}
      placeholder={displayValue}
      className="flex-1 bg-transparent border-none outline-none placeholder:text-gray"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      disabled={disabled}
    />
  );

  const renderDisplayValue = () => (
    <span className={`truncate ${value ? '' : 'text-gray'}`}>{displayValue}</span>
  );

  const renderOption = (option: SelectOption, index: number) => {
    const isHighlighted = highlightedIndex === index;
    const isSelected = option.value === value;

    return (
      <div
        key={option.value}
        className={`${OPTION_CLASSES} ${isHighlighted ? 'bg-green-accent' : ''} ${
          isSelected ? 'bg-gray-accent' : ''
        }`}
        onClick={() => handleOptionClick(option.value)}
        onMouseEnter={() => handleOptionMouseEnter(index)}
      >
        {option.label}
      </div>
    );
  };

  const renderDropdown = () => {
    if (!isOpen) return null;

    return (
      <div ref={optionsContainerRef} className={DROPDOWN_CLASSES}>
        {filteredOptions.length > 0 ? (
          filteredOptions.map(renderOption)
        ) : (
          <div className="px-3 py-2 text-gray text-center">No results found</div>
        )}
      </div>
    );
  };

  // Main render
  return (
    <div
      ref={containerRef}
      className={`flex flex-col ${wrapperClassName}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {label && (
        <label className="mb-2 text-xs text-left leading-[12px] gap-2 font-bold text-black uppercase">
          {label}
        </label>
      )}

      <div
        className={`relative ${BASE_CLASSES} ${selectClassName} ${error ? 'border-error' : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onClick={disabled ? undefined : toggleDropdown}
      >
        <div className="flex items-center justify-between">
          {isOpen && searchable ? renderSearchInput() : renderDisplayValue()}
          <AngleDown
            className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {renderDropdown()}
      </div>

      {error && <div className="mt-2 text-error text-base text-left">{error}</div>}
    </div>
  );
}
