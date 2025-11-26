import { useState, useRef, useEffect } from 'react';
import Calendar from '@assets/calendar.svg?react';
import AngleDown from '@assets/angle-down.svg?react';

export interface DatePickerProps {
  label?: string;
  value?: string | [string, string]; // Support both single date and date range
  onChange?: (date: string | [string, string]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  wrapperClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  isRange?: boolean; // New prop to enable range selection
  variant?: 'input' | 'icon'; // New prop for styling variant
}

type ViewMode = 'calendar' | 'months' | 'years';

interface CalendarDay {
  day: number;
  date: Date;
  isCurrentMonth: boolean;
  isPreviousMonth: boolean;
  isNextMonth: boolean;
}

export default function DatePicker({
  label,
  value = '',
  onChange,
  placeholder = 'Select date',
  error,
  disabled = false,
  wrapperClassName = '',
  inputClassName = '',
  labelClassName = '',
  isRange = false,
  variant = 'input',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | [string, string]>(value);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const yearsContainerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    setSelectedDate(value);
    if (isRange && Array.isArray(value) && value.length === 2) {
      setRangeStart(parseDate(value[0]));
      setRangeEnd(parseDate(value[1]));
    } else if (!isRange && typeof value === 'string' && value) {
      setRangeStart(parseDate(value));
      setRangeEnd(null);
    }
  }, [value, isRange]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode('calendar');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Auto-scroll to current year when years view is opened
  useEffect(() => {
    if (viewMode === 'years' && yearsContainerRef.current) {
      const container = yearsContainerRef.current;
      const currentYearIndex = 50; // Current year is always at index 50 in our array (±50 years)

      // Use setTimeout to ensure the DOM is fully rendered
      setTimeout(() => {
        // Calculate scroll position to center the current year
        // Grid has 3 columns, so we need to find the row of the current year
        const row = Math.floor(currentYearIndex / 3);
        const itemHeight = 46; // p-3 padding (12px top + 12px bottom) + estimated height (~32px)
        const gap = 8; // gap-2 is 8px
        const totalItemHeight = itemHeight + gap;
        const containerHeight = container.clientHeight;

        const targetScrollTop = row * totalItemHeight - containerHeight / 2 + itemHeight / 2;
        container.scrollTop = Math.max(0, targetScrollTop);
      }, 10);
    }
  }, [viewMode, currentMonth]);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const parseDate = (dateString: string) => {
    const [day, month, year] = dateString.split('.');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isDateInRange = (date: Date) => {
    if (!rangeStart || !isRange) return false;

    const endDate = hoveredDate && !rangeEnd ? hoveredDate : rangeEnd;
    if (!endDate) return false;

    const start = rangeStart < endDate ? rangeStart : endDate;
    const end = rangeStart < endDate ? endDate : rangeStart;

    return date >= start && date <= end;
  };

  const isDateRangeEdge = (date: Date) => {
    if (!isRange || !rangeStart) return false;
    return isSameDay(date, rangeStart) || (rangeEnd && isSameDay(date, rangeEnd));
  };
  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = (firstDay.getDay() + 6) % 7; // Adjust for Monday start

    const days: CalendarDay[] = [];

    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();

    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const dayDate = new Date(year, month - 1, day);
      days.push({
        day,
        date: dayDate,
        isCurrentMonth: false,
        isPreviousMonth: true,
        isNextMonth: false,
      });
    }

    // Add all days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      days.push({
        day,
        date: dayDate,
        isCurrentMonth: true,
        isPreviousMonth: false,
        isNextMonth: false,
      });
    }

    // Add days from next month to complete the grid (42 cells = 6 weeks)
    const totalCells = 42;
    const remainingCells = totalCells - days.length;

    for (let day = 1; day <= remainingCells; day++) {
      const dayDate = new Date(year, month + 1, day);
      days.push({
        day,
        date: dayDate,
        isCurrentMonth: false,
        isPreviousMonth: false,
        isNextMonth: true,
      });
    }

    return days;
  };
  const handleDateClick = (calendarDay: CalendarDay) => {
    const newDate = calendarDay.date;

    if (!isRange) {
      // Single date selection
      const formattedDate = formatDate(newDate);
      setSelectedDate(formattedDate);
      setRangeStart(newDate);
      setRangeEnd(null);
      onChange?.(formattedDate);
      setIsOpen(false);
    } else {
      // Range selection
      if (!rangeStart || (rangeStart && rangeEnd)) {
        // Start new range
        setRangeStart(newDate);
        setRangeEnd(null);
        setHoveredDate(null);
      } else {
        // Complete range
        const start = rangeStart < newDate ? rangeStart : newDate;
        const end = rangeStart < newDate ? newDate : rangeStart;
        setRangeStart(start);
        setRangeEnd(end);
        const formattedRange: [string, string] = [formatDate(start), formatDate(end)];
        setSelectedDate(formattedRange);
        onChange?.(formattedRange);
        setIsOpen(false);
      }
    }
  };

  const handleDateHover = (calendarDay: CalendarDay) => {
    if (isRange && rangeStart && !rangeEnd) {
      setHoveredDate(calendarDay.date);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handlePrevYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth()));
  };

  const handleNextYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth()));
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex));
    setViewMode('calendar');
  };

  const handleYearSelect = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth()));
    setViewMode('calendar');
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthNamesShort = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const days = getDaysInMonth(currentMonth);

  // Generate years for year selection (current year ± 50 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);

  const getDisplayValue = () => {
    if (Array.isArray(selectedDate) && selectedDate.length === 2) {
      return `${selectedDate[0]} - ${selectedDate[1]}`;
    }
    return typeof selectedDate === 'string' ? selectedDate : '';
  };

  const renderCalendarView = () => (
    <>
      {/* Month/Year header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-accent rounded-lg transition-colors"
        >
          <AngleDown className="h-4 w-4 text-gray rotate-90" />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('months')}
            className="text-base font-medium hover:text-blue transition-colors"
          >
            {monthNames[currentMonth.getMonth()]}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('years')}
            className="text-base font-medium hover:text-blue transition-colors"
          >
            {currentMonth.getFullYear()}
          </button>
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-accent rounded-lg transition-colors"
        >
          <AngleDown className="h-4 w-4 text-gray -rotate-90" />
        </button>
      </div>{' '}
      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2 bg-gray-accent rounded-[4px]">
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className="text-center text-base text-black h-10 w-10 flex justify-center items-center font-semibold"
          >
            {dayName}
          </div>
        ))}
      </div>
      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((calendarDay, index) => {
          const dayDate = calendarDay.date;
          const isToday = isSameDay(dayDate, today);
          const isSelected = isDateRangeEdge(dayDate);
          const isInRange = isDateInRange(dayDate);
          const isCurrentMonth = calendarDay.isCurrentMonth;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(calendarDay)}
              onMouseEnter={() => handleDateHover(calendarDay)}
              className={`
                h-10 w-10 rounded-lg flex items-center justify-center text-base font-medium transition-all
                ${!isCurrentMonth ? 'text-gray opacity-40' : ''}
                ${
                  isSelected
                    ? 'bg-blue text-white'
                    : isInRange
                    ? 'bg-green-accent text-black'
                    : isToday && !isSelected && isCurrentMonth
                    ? 'text-blue hover:bg-gray-accent'
                    : isCurrentMonth
                    ? 'hover:bg-gray-accent'
                    : 'hover:bg-gray-accent hover:opacity-60'
                }
              `}
            >
              {calendarDay.day}
            </button>
          );
        })}
      </div>
    </>
  );

  const renderMonthsView = () => (
    <>
      {/* Year header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevYear}
          className="p-2 hover:bg-gray-accent rounded-lg transition-colors"
        >
          <AngleDown className="h-4 w-4 text-gray rotate-90" />
        </button>
        <button
          type="button"
          onClick={() => setViewMode('years')}
          className="text-base font-medium hover:text-blue transition-colors"
        >
          {currentMonth.getFullYear()}
        </button>
        <button
          type="button"
          onClick={handleNextYear}
          className="p-2 hover:bg-gray-accent rounded-lg transition-colors"
        >
          <AngleDown className="h-4 w-4 text-gray -rotate-90" />
        </button>
      </div>

      {/* Months grid */}
      <div className="grid grid-cols-3 gap-2">
        {monthNamesShort.map((month, index) => {
          const isCurrentMonth =
            index === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
          const isSelectedMonth = index === currentMonth.getMonth();

          return (
            <button
              key={month}
              type="button"
              onClick={() => handleMonthSelect(index)}
              className={`
                p-3 rounded-lg text-base font-medium transition-all
                ${
                  isSelectedMonth
                    ? 'bg-blue text-white'
                    : isCurrentMonth && !isSelectedMonth
                    ? 'text-blue hover:bg-gray-accent'
                    : 'hover:bg-gray-accent'
                }
              `}
            >
              {month}
            </button>
          );
        })}
      </div>
    </>
  );

  const renderYearsView = () => (
    <>
      {/* Years header */}
      <div className="flex items-center justify-center mb-4">
        <span className="text-base font-medium">Select Year</span>
      </div>{' '}
      {/* Years grid */}
      <div
        ref={yearsContainerRef}
        className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto scrollbar"
      >
        {years.map((year) => {
          const isCurrentYear = year === today.getFullYear();
          const isSelectedYear = year === currentMonth.getFullYear();

          return (
            <button
              key={year}
              type="button"
              onClick={() => handleYearSelect(year)}
              className={`
                p-3 rounded-lg text-base font-medium transition-all
                ${
                  isSelectedYear
                    ? 'bg-blue text-white'
                    : isCurrentYear && !isSelectedYear
                    ? 'text-blue hover:bg-gray-accent'
                    : 'hover:bg-gray-accent'
                }
              `}
            >
              {year}
            </button>
          );
        })}
      </div>
    </>
  );
  return (
    <div className={`flex flex-col ${wrapperClassName}`} ref={datePickerRef}>
      {label && variant === 'input' && (
        <label className="mb-2 text-xs text-left leading-[12px] gap-2 font-bold text-black uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        {variant === 'input' ? (
          <div
            className={`
              flex items-center gap-2 px-3 py-2 min-h-[48px] rounded-lg border bg-white cursor-pointer
              ${error ? 'border-red' : 'border-gray hover:border-blue focus-within:border-blue'}
              ${disabled ? 'bg-gray-accent cursor-not-allowed' : ''}
              ${inputClassName}
            `}
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            <input
              type="text"
              value={getDisplayValue()}
              placeholder={placeholder}
              readOnly
              disabled={disabled}
              className="flex-1 outline-none bg-transparent cursor-pointer text-base leading-[22px] placeholder:text-gray "
            />
            <Calendar className="h-5 w-5 text-gray flex-shrink-0" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`
              h-10 w-10 rounded-lg bg-transparent border cursor-pointer transition-all
              flex items-center justify-center
              ${error ? 'border-red' : 'border-gray hover:border-blue focus:border-blue'}
              ${disabled ? 'border-gray-accent cursor-not-allowed opacity-50' : ''}
              ${inputClassName}
            `}
          >
            <Calendar className="h-5 w-5 text-gray" />
          </button>
        )}

        {isOpen && !disabled && (
          <div
            className={`
            absolute mt-1 p-4 bg-white border border-gray rounded-lg shadow-lg z-50 min-w-[360px]
            ${variant === 'icon' ? 'top-full right-0' : 'top-full left-0'}
          `}
          >
            {viewMode === 'calendar' && renderCalendarView()}
            {viewMode === 'months' && renderMonthsView()}
            {viewMode === 'years' && renderYearsView()}
          </div>
        )}
      </div>

      {error && variant === 'input' && (
        <span className="text-red text-sm leading-[18px]">{error}</span>
      )}
    </div>
  );
}
