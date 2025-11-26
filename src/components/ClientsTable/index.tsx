import { useMemo, useState, useRef } from 'react';
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
import PrintIcon from '@assets/u_print.svg?react';
import Button from '../Button';
import ArrowRight from '@assets/arrow-right.svg?react';
import Checkbox from '../Checkbox';
import { ClientData } from '../../data/mockClientData';
import { cityOptions, discountTypes } from '../../data/mockDropDowns';
import { exportClientsToExcel, exportSelectedClientsToExcel } from '../../utils/clientsExcelExport';

interface ClientsTableProps {
  data: ClientData[];
  className?: string;
}

interface TableRowData {
  rows: Row<ClientData>[];
  table: Table<ClientData>;
  columnSizing: Record<string, number>;
}

interface TableRowProps {
  index: number;
  style: React.CSSProperties;
  data: TableRowData;
}

const columnHelper = createColumnHelper<ClientData>();

// Row component for virtualization
const TableRow = ({ index, style, data }: TableRowProps) => {
  const { rows, columnSizing } = data;
  const row = rows[index];

  return (
    <div className="px-6">
      <div
        style={{
          ...style,
          width: 'unset',
          left: '24px',
        }}
        className={`flex items-center border-b border-lines hover:bg-gray-50`}
      >
        {row.getVisibleCells().map((cell: Cell<ClientData, unknown>) => {
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

export default function ClientsTable({ data, className = '' }: ClientsTableProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Column resizing state
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});
  const dragCol = useRef<string | null>(null);
  const dragStartX = useRef<number>(0);
  const dragStartWidth = useRef<number>(0);

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

  const columns = useMemo(
    () => [
      // Selection column for header
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

      columnHelper.accessor('name', {
        header: 'Full Name',
        size: 250,
        cell: (info) => <span className="">{info.getValue()}</span>,
      }),

      columnHelper.accessor('cardNumber', {
        header: 'Card Number',
        size: 150,
        cell: (info) => <span className="">{info.getValue()}</span>,
      }),

      columnHelper.accessor('email', {
        header: 'Email',
        size: 200,
        cell: (info) => <span className="">{info.getValue()}</span>,
      }),

      columnHelper.accessor('phone', {
        header: 'Phone Number',
        size: 180,
        cell: (info) => <span className="">{info.getValue()}</span>,
      }),

      columnHelper.accessor('dsDiscount', {
        header: 'Discount %',
        size: 120,
        cell: (info) => {
          const discountValue = info.getValue();
          return (
            <span>
              {discountValue !== undefined
                ? `${discountValue.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}`
                : '-'}
            </span>
          );
        },
      }),

      columnHelper.accessor('discount', {
        header: 'Discount Scheme',
        size: 150,
        cell: (info) => {
          const discount = discountTypes.find((type) => type.value === info.getValue());
          return <span className="">{discount ? discount.label : info.getValue()}</span>;
        },
      }),

      columnHelper.accessor('dateOfBirth', {
        header: 'Date of Birth',
        size: 160,
        cell: (info) => {
          const date = info.getValue();
          return date ? <span>{new Date(date).toLocaleDateString('en-US')}</span> : <span>-</span>;
        },
      }),

      columnHelper.accessor('age', {
        header: 'Age',
        size: 80,
        cell: (info) => {
          const age = info.getValue();
          return age ? <span>{age}</span> : <span>-</span>;
        },
      }),

      columnHelper.accessor('city', {
        header: 'City',
        size: 150,
        cell: (info) => {
          const city = cityOptions.find((option) => option.value === info.getValue());
          return <span className="">{city ? city.label : info.getValue()}</span>;
        },
      }),

      columnHelper.accessor('address', {
        header: 'Address',
        size: 200,
        cell: (info) => <span className="">{info.getValue()}</span>,
      }),

      columnHelper.accessor('factualAddress', {
        header: 'Actual Address',
        size: 200,
        cell: (info) => <span className="">{info.getValue()}</span>,
      }),

      columnHelper.accessor('dateOfRegistration', {
        header: 'Registration Date',
        size: 160,
        cell: (info) => {
          const date = info.getValue();
          return date ? <span>{new Date(date).toLocaleDateString('en-US')}</span> : <span>-</span>;
        },
      }),

      columnHelper.accessor('status', {
        header: 'Status',
        size: 120,
        cell: (info) => {
          const status = info.getValue();
          //   const statusColors = {
          //     active: 'text-green-600 bg-green-100',
          //     inactive: 'text-gray-600 bg-gray-100',
          //     suspended: 'text-red-600 bg-red-100',
          //   };
          const statusLabels: Record<string, string> = {
            active: 'Active',
            inactive: 'Inactive',
            suspended: 'Suspended',
          };
          return <span>{status ? statusLabels[status] || status : '-'}</span>;
        },
      }),

      columnHelper.accessor('isVip', {
        header: 'VIP',
        size: 80,
        cell: (info) => {
          const isVip = info.getValue();
          return isVip ? (
            <span className="text-yellow-600 font-bold">★</span>
          ) : (
            <span className="text-gray-300">☆</span>
          );
        },
      }),

      columnHelper.accessor('debt', {
        header: 'Debt (USD)',
        size: 120,
        cell: (info) => {
          const debt = info.getValue();
          return (
            <span>
              {debt.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
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
  const totalWidth = table.getAllColumns().reduce((sum, column) => {
    return sum + (columnSizing[column.id] || column.getSize());
  }, 0);

  return (
    <div className={`flex flex-col w-full h-full relative ${className}`}>
      <div className="flex-1 flex flex-col absolute inset-0">
        {/* Selected count */}
        {Object.keys(rowSelection).length > 0 && (
          <div className="px-6 pt-4 pb-2 flex items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="text-base font-semibold">
                {Object.keys(rowSelection).length} clients selected on this page
              </span>
              <Checkbox
                checked={table.getIsAllRowsSelected()}
                onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                checkboxClassName="mx-auto"
                label="select all"
                labelClassName="text-base font-semibold"
              />
            </div>
            <div className="flex-1 flex justify-end">
              <button
                className="text-black hover:text-blue-hover active:text-blue-active transition-[.2s] flex items-center gap-2 text-base font-semibold mr-4"
                onClick={() => {
                  const selectedIds = Object.keys(rowSelection);
                  exportSelectedClientsToExcel(data, selectedIds);
                }}
              >
                <PrintIcon className="w-4 h-4 fill-current" />
                Export
              </button>
            </div>
          </div>
        )}
        {/* Table container with custom scrollbars */}
        <div className="flex-1 relative overflow-hidden px-6">
          <div
            className="absolute inset-0 overflow-y-hidden overflow-x-auto scrollbar-small"
            ref={tableContainerRef}
          >
            <div style={{ minHeight: '100%' }}>
              {/* Table header */}
              <div
                className="flex border-b border-lines sticky top-0 z-10 mx-6 h-[50px] items-center"
                style={{
                  width: totalWidth - 32,
                  minWidth: totalWidth - 32,
                  maxWidth: totalWidth - 32,
                }}
              >
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
                            className="absolute top-0 right-0 h-full w-2 cursor-col-resize z-10 group-hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ userSelect: 'none' }}
                          />
                        )}
                      </div>
                    );
                  }),
                )}
              </div>
              {/* Virtualized table body */}
              <List
                height={Math.max(500, window.innerHeight - 300)} // Dynamic height
                itemCount={rows.length}
                itemSize={50}
                itemData={{ rows, table, columnSizing }}
                width={totalWidth}
                className="scrollbar-small !overflow-x-hidden"
              >
                {TableRow}
              </List>
            </div>
          </div>
        </div>{' '}
        {/* Footer with pagination info */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <span className="text-base text-gray-600">
            Displayed: {rows.length} of {data.length} records
          </span>
          <div className="flex items-center gap-4">
            <span className="text-base text-gray-600">
              {Object.keys(rowSelection).length > 0 &&
                `Selected: ${Object.keys(rowSelection).length}`}
            </span>
            {Object.keys(rowSelection).length === 0 && (
              <button
                className="text-black hover:text-blue-hover active:text-blue-active transition-[.2s] flex items-center gap-2 text-base font-medium"
                onClick={() => exportClientsToExcel(data)}
              >
                <PrintIcon className="w-4 h-4 fill-current" />
                Export All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
