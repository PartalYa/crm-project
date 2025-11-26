import { useMemo, useState, useRef, useEffect } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowSelectionState,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  Row,
  Table,
  Cell,
} from '@tanstack/react-table';
import { FixedSizeList as List } from 'react-window';
import Checkbox from '../Checkbox';
import ArrowRight from '@assets/arrow-right.svg?react';

export interface ReportTableColumn {
  key: string;
  label: string;
  width?: number;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ReportTableProps {
  columns: ReportTableColumn[];
  data: any[];
  className?: string;
}

interface TableRowData {
  rows: Row<any>[];
  table: Table<any>;
  columnSizing: Record<string, number>;
}

interface TableRowProps {
  index: number;
  style: React.CSSProperties;
  data: TableRowData;
}

const columnHelper = createColumnHelper<any>();

const TableRow = ({ index, style, data }: TableRowProps) => {
  const { rows, columnSizing } = data;
  const row = rows[index];
  return (
    <div className="px-6">
      <div
        style={{ ...style, width: 'unset', left: '24px' }}
        className={`flex items-center border-b border-lines hover:bg-gray-50`}
      >
        {row.getVisibleCells().map((cell: Cell<any, unknown>) => {
          const columnWidth = columnSizing[cell.column.id] || cell.column.getSize();
          return (
            <div
              key={cell.id}
              className="table-cell-wrapper flex items-center px-3 py-3 text-base"
              style={{
                width: columnWidth,
                minWidth: columnWidth,
                maxWidth: columnWidth,
              }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ReportTable({ columns, data, className = '' }: ReportTableProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  // Column resizing state
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});
  const dragCol = useRef<string | null>(null);
  const dragStartX = useRef<number>(0);
  const dragStartWidth = useRef<number>(0);

  // Update container width when container resizes
  useEffect(() => {
    const updateContainerWidth = () => {
      if (tableContainerRef.current) {
        // Subtract padding: 24px left + 24px right = 48px
        setContainerWidth(tableContainerRef.current.clientWidth - 48);
      }
    };

    // Initial measurement
    updateContainerWidth();

    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateContainerWidth);
    if (tableContainerRef.current) {
      resizeObserver.observe(tableContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Drag logic for column resizing
  const onDragStart = (e: React.MouseEvent, columnId: string, currentWidth: number) => {
    dragCol.current = columnId;
    dragStartX.current = e.clientX;
    dragStartWidth.current = currentWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
  };

  const onDragMove = (e: MouseEvent) => {
    if (dragCol.current === null) return;
    const delta = e.clientX - dragStartX.current;
    const newWidth = Math.max(60, dragStartWidth.current + delta);
    setColumnSizing((prev) => ({
      ...prev,
      [dragCol.current!]: newWidth,
    }));
  };

  const onDragEnd = () => {
    dragCol.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
  };

  // Build columns for tanstack table
  const tableColumns = useMemo(() => {
    const cols = [
      columnHelper.display({
        id: 'select',
        size: 50,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
            checkboxClassName="mx-auto"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            checkboxClassName="mx-auto"
          />
        ),
      }),
      ...columns.map((col) =>
        columnHelper.accessor(col.key, {
          header: col.label,
          size: col.width || 160,
          cell: (info) =>
            col.render ? col.render(info.getValue(), info.row.original) : info.getValue(),
        }),
      ),
    ];
    return cols;
  }, [columns]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  const { rows } = table.getRowModel();

  // Calculate total width for horizontal scrolling
  const calculatedWidth = table.getAllColumns().reduce((sum, column) => {
    return sum + (columnSizing[column.id] || column.getSize());
  }, 0);

  // Use the larger of calculated width or container width to ensure table fills container
  const totalWidth = Math.max(calculatedWidth, containerWidth);

  return (
    <div className={`flex flex-col w-full h-full relative ${className}`}>
      <div className="flex-1 flex flex-col absolute inset-0">
        {Object.keys(rowSelection).length > 0 && (
          <div className="px-6 pt-4 pb-2 flex items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="text-base font-semibold">
                {Object.keys(rowSelection).length} selected
              </span>
              <Checkbox
                checked={table.getIsAllRowsSelected()}
                onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                checkboxClassName="mx-auto"
                label="select all"
                labelClassName="text-base font-semibold"
              />
            </div>
          </div>
        )}
        <div className="flex-1 relative overflow-hidden px-6">
          <div
            className="absolute inset-0 overflow-y-hidden overflow-x-auto scrollbar-small"
            ref={tableContainerRef}
          >
            <div style={{ minHeight: '100%' }}>
              <div
                className="flex border-b border-lines sticky top-0 z-10 mx-6 h-[50px] items-center"
                style={{
                  width: totalWidth - 32,
                  minWidth: totalWidth - 32,
                  maxWidth: totalWidth - 32,
                }}
              >
                {' '}
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header, headerIndex) => {
                    const currentWidth = columnSizing[header.id] || header.getSize();
                    return (
                      <div
                        key={header.id}
                        className="flex items-center px-3 py-3 font-semibold text-base text-gray-700 cursor-pointer hover:bg-gray-100 h-[50px] relative group"
                        style={{
                          width: currentWidth,
                          minWidth: currentWidth,
                          maxWidth: currentWidth,
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex-1 flex items-center">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() && (
                            <span className="ml-1">
                              {/* {header.column.getIsSorted() === 'desc' ? ' 🔽' : ' 🔼'} */}
                              {header.column.getIsSorted() === 'desc' ? (
                                <ArrowRight className="w-4 h-4 rotate-90" />
                              ) : (
                                <ArrowRight className="w-4 h-4 -rotate-90" />
                              )}
                            </span>
                          )}
                        </div>
                        {/* Drag handle - don't show on last column */}
                        {headerIndex < headerGroup.headers.length - 1 && (
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              onDragStart(e, header.id, currentWidth);
                            }}
                            onMouseUp={(e) => {
                              e.stopPropagation();
                            }}
                            className="absolute top-0 right-0 h-full w-2 cursor-col-resize z-10 group-hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ userSelect: 'none' }}
                          />
                        )}
                      </div>
                    );
                  }),
                )}
              </div>{' '}
              <List
                height={Math.max(500, window.innerHeight - 300)}
                itemCount={rows.length}
                itemSize={50}
                itemData={{ rows, table, columnSizing }}
                width={totalWidth}
                className="no-scrollbar !overflow-x-hidden"
              >
                {TableRow}
              </List>
            </div>
          </div>
        </div>
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <span className="text-base text-gray-600">
            Displayed: {rows.length} of {data.length} records
          </span>
          <span className="text-base text-gray-600">
            {Object.keys(rowSelection).length > 0 &&
              `Selected: ${Object.keys(rowSelection).length}`}
          </span>
        </div>
      </div>
    </div>
  );
}
