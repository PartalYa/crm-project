import { FixedSizeList as List } from 'react-window';
import React, { useRef, useState } from 'react';

export interface SimpleTableColumn<T> {
  key: keyof T;
  label: string;
  width?: number;
  render?: (value: any, row: T) => React.ReactNode;
}

interface SimpleTableProps<T> {
  columns: SimpleTableColumn<T>[];
  data: T[];
  rowHeight?: number;
  height?: number;
  className?: string;
  /**
   * If true, removes header background and borders for a minimal look
   */
  noHeaderStyle?: boolean;
}

export default function SimpleTable<T extends object>({
  columns,
  data,
  rowHeight = 48,
  height = 320,
  className = '',
  noHeaderStyle = false,
}: SimpleTableProps<T>) {
  // State for column widths (in px)
  const [colWidths, setColWidths] = useState(() => columns.map((col) => col.width || 200));
  const tableRef = useRef<HTMLDivElement>(null);
  const dragCol = useRef<number | null>(null);
  const dragStartX = useRef<number>(0);
  const dragStartWidth = useRef<number>(0);

  // Drag logic
  const onDragStart = (e: React.MouseEvent, idx: number) => {
    dragCol.current = idx;
    dragStartX.current = e.clientX;
    dragStartWidth.current = colWidths[idx];
    document.body.style.cursor = 'col-resize';
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
  };
  const onDragMove = (e: MouseEvent) => {
    if (dragCol.current === null) return;
    const delta = e.clientX - dragStartX.current;
    setColWidths((widths) => {
      const next = [...widths];
      next[dragCol.current!] = Math.max(60, dragStartWidth.current + delta);
      return next;
    });
  };
  const onDragEnd = () => {
    dragCol.current = null;
    document.body.style.cursor = '';
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
  };

  // If wrapper is wider, columns flex-grow to fill
  const getColStyle = (idx: number) => ({
    minWidth: 60,
    width: colWidths[idx],
    flex: `${colWidths[idx]} ${colWidths[idx]} 0%`,
    maxWidth: colWidths[idx],
    position: 'relative' as const,
    boxSizing: 'border-box' as const,
  });

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = data[index];
    return (
      <div
        className={`flex items-center text-base bg-white hover:bg-gray-50 w-full ${
          noHeaderStyle ? '' : 'border-b border-lines'
        }`}
        style={{ ...style, minWidth: 0 }}
      >
        {columns.map((col, idx) => (
          <div
            key={String(col.key)}
            className="px-3 py-2 truncate flex items-center"
            style={getColStyle(idx)}
          >
            {col.render ? col.render(row[col.key], row) : (row[col.key] as React.ReactNode)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={tableRef}
      className={`w-full bg-white  ${
        noHeaderStyle ? '' : 'border border-lines rounded-2xl'
      } ${className}`}
      style={{ width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      <div
        className={`flex items-center font-semibold text-base w-full border-b border-lines ${
          noHeaderStyle ? '' : ' bg-gray-50'
        }`}
        style={{ minWidth: 0 }}
      >
        {columns.map((col, idx) => (
          <div
            key={String(col.key)}
            className="px-3 py-2 flex items-center group select-none relative"
            style={getColStyle(idx)}
          >
            <span className="truncate flex-1">{col.label}</span>
            {/* Drag handle */}
            {idx < columns.length - 1 && (
              <span
                onMouseDown={(e) => onDragStart(e, idx)}
                className="absolute top-0 right-0 h-full w-2 cursor-col-resize z-10 group-hover:bg-gray-200"
                style={{ userSelect: 'none' }}
              />
            )}
          </div>
        ))}
      </div>
      <div style={{ width: '100%', flex: 1, minWidth: 0 }}>
        <List
          height={height}
          itemCount={data.length}
          itemSize={rowHeight}
          width={'100%'}
          className="scrollbar-small"
        >
          {Row}
        </List>
      </div>
    </div>
  );
}
