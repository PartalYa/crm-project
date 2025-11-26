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
import EditIcon from '@assets/edit.svg?react';
import PrintIcon from '@assets/u_print.svg?react';
import TrashIcon from '@assets/trash.svg?react';
import { OrderData } from '../../data/mockOrderData';
import Checkbox from '../Checkbox';
import Button from '../Button';
import ArrowRight from '@assets/arrow-right.svg?react';
import { exportOrdersToExcel, exportSelectedOrdersToExcel } from '../../utils/ordersExcelExport';

interface OrdersTableProps {
  data: OrderData[];
  className?: string;
}

interface TableRowData {
  rows: Row<OrderData>[];
  table: Table<OrderData>;
  columnSizing: Record<string, number>;
}

interface TableRowProps {
  index: number;
  style: React.CSSProperties;
  data: TableRowData;
}

const columnHelper = createColumnHelper<OrderData>();

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
        {row.getVisibleCells().map((cell: Cell<OrderData, unknown>) => {
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

export default function OrdersTable({ data, className = '' }: OrdersTableProps) {
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

      // № (Order number)
      columnHelper.accessor('orderNumber', {
        header: '№',
        size: 100,
        cell: (info) => <span className="">{info.getValue()}</span>,
      }),

      columnHelper.accessor('status', {
        header: 'Status',
        size: 77,
        cell: (info) => <span className="">{info.getValue()}</span>,
      }),

      columnHelper.accessor('createdDate', {
        header: 'Received Date',
        size: 148,
        cell: (info) => {
          const date = info.getValue();
          if (!date) return <span>Unknown Date</span>;
          // Convert to Date object if it's a string
          const dateObj = date instanceof Date ? date : new Date(date);
          return <span>{dateObj.toLocaleDateString('en-US')}</span>;
        },
      }),

      columnHelper.accessor('updatedDate', {
        header: 'Issued Date',
        size: 148,
        cell: (info) => {
          const date = info.getValue();
          if (!date) return <span>Unknown Date</span>;
          // Convert to Date object if it's a string
          const dateObj = date instanceof Date ? date : new Date(date);
          return <span>{dateObj.toLocaleDateString('en-US')}</span>;
        },
      }),

      columnHelper.accessor('company', {
        header: 'Company',
        size: 200,
        cell: (info) => <span className="">{info.getValue()}</span>,
      }),

      columnHelper.accessor('receiver', {
        header: 'Receiver',
        size: 200,
        cell: (info) => <span className="">{info.getValue()}</span>,
      }),

      columnHelper.accessor('client', {
        header: 'Client',
        size: 200,
        cell: (info) => <span className="">{info.getValue()}</span>,
      }),

      columnHelper.accessor('priceList', {
        header: 'Price List',
        size: 200,
        cell: (info) => {
          return <span>{info.getValue()}</span>;
        },
      }),

      columnHelper.accessor('amount', {
        header: 'Amount',
        size: 140,
        cell: (info) => {
          const amount = info.getValue();
          return (
            <span>
              {amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          );
        },
      }),

      columnHelper.accessor('amount', {
        id: 'payment',
        header: 'Payment',
        size: 140,
        cell: (info) => {
          const amount = info.getValue();
          return (
            <span>
              {amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          );
        },
      }),

      columnHelper.display({
        id: 'debt',
        header: 'Debt',
        size: 140,
        cell: ({ row }) => {
          const amount = row.original.amount;
          return (
            // <span className={`font-medium ${amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            <span>
              {amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          );
        },
      }),

      columnHelper.accessor('warehouse', {
        id: 'warehouse-display',
        header: 'Warehouse',
        size: 200,
        cell: (info) => <span className="">{info.getValue()}</span>,
      }),

      // Action checkboxes (Issue, Cancel, Execute) and buttons (Edit, Print, Delete)
      columnHelper.display({
        id: 'action-checkboxes',
        header: '',
        size: 480,
        cell: ({ row }) => {
          const [checkboxes, setCheckboxes] = useState({
            issue: false,
            cancel: false,
            execute: false,
          });

          return (
            <div className="flex items-center">
              <div className="flex items-center gap-8 mr-4">
                <Checkbox
                  label="Issue"
                  checked={checkboxes.issue}
                  onCheckedChange={(checked) => {
                    setCheckboxes((prev) => ({ ...prev, issue: checked }));
                    console.log('Issue:', row.original.id, checked);
                  }}
                  labelClassName="whitespace-nowrap"
                />
                <Checkbox
                  label="Cancel"
                  checked={checkboxes.cancel}
                  onCheckedChange={(checked) => {
                    setCheckboxes((prev) => ({ ...prev, cancel: checked }));
                    console.log('Cancel:', row.original.id, checked);
                  }}
                  labelClassName="whitespace-nowrap"
                />
                <Checkbox
                  label="Execute"
                  checked={checkboxes.execute}
                  onCheckedChange={(checked) => {
                    setCheckboxes((prev) => ({ ...prev, execute: checked }));
                    console.log('Execute:', row.original.id, checked);
                  }}
                  labelClassName="whitespace-nowrap"
                />
              </div>
              <button
                className="w-8 h-8 flex transition-[.2s] items-center justify-center text-black hover:text-blue-hover active:text-blue-active"
                onClick={() => console.log('Edit:', row.original.id)}
              >
                <EditIcon className="w-4 h-4 fill-current" />
              </button>
              <button
                className="w-8 h-8 flex transition-[.2s] items-center justify-center text-black hover:text-blue-hover active:text-blue-active"
                onClick={() => console.log('Print:', row.original.id)}
              >
                <PrintIcon className="w-4 h-4 fill-current" />
              </button>
              <button
                className="w-8 h-8 flex transition-[.2s] items-center justify-center text-black hover:text-blue-hover active:text-blue-active"
                onClick={() => console.log('Delete:', row.original.id)}
              >
                <TrashIcon className="w-4 h-4 fill-current" />
              </button>
            </div>
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
            {/* <span className="text-base text-blue-700 font-medium">
              Selected: {Object.keys(rowSelection).length} records
            </span> */}
            <div className="flex items-center gap-4">
              <span className="text-base font-semibold">
                {Object.keys(rowSelection).length} orders selected
              </span>

              <Checkbox
                checked={table.getIsAllRowsSelected()}
                onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                checkboxClassName="mx-auto"
                label="select all"
                labelClassName="text-base font-semibold"
              />
            </div>{' '}
            <div className="flex items-center gap-4">
              <Button
                label="Close Orders"
                variant="ghost"
                onClick={() => console.log('Close Orders: ', Object.keys(rowSelection).length)}
              />
              <Button
                label="Execute"
                variant="primary"
                onClick={() => console.log('Execute: ', Object.keys(rowSelection).length)}
              />
            </div>
            <div className="flex-1 flex justify-end">
              <button
                className="text-black hover:text-blue-hover active:text-blue-active transition-[.2s] flex items-center gap-2 text-base font-semibold mr-4"
                onClick={() => {
                  const selectedIds = Object.keys(rowSelection);
                  exportSelectedOrdersToExcel(data, selectedIds);
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
                className="flex  border-b border-lines sticky top-0 z-10 mx-6 h-[50px] items-center"
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
                            className="absolute top-0 right-0 h-full w-2 cursor-col-resize z-10 group-hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ userSelect: 'none' }}
                          />
                        )}
                      </div>
                    );
                  }),
                )}
              </div>
              {/* Virtualized table body */}{' '}
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
        </div>
        {/* Horizontal scrollbar for the table */} {/* Footer with pagination info */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <span className="text-base text-gray-600">
            Displayed: {rows.length} of {data.length} records
          </span>
          <div className="flex items-center gap-4">
            <span className="text-base text-gray-600">
              {Object.keys(rowSelection).length > 0 &&
                `Selected: ${Object.keys(rowSelection).length}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
