import { useMemo, useState, useRef, useEffect } from 'react';
import SearchIcon from '@assets/search.svg?react';
import PlusIcon from '@assets/plus.svg?react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { mockClients, ClientData } from '../../data/mockClientData';
import { useCreateOrderStore } from '../../stores/createOrderStore';
import { useReactTable, createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { FixedSizeList as List } from 'react-window';
import { Row } from '@tanstack/react-table';
import { useBarcodeScanner, getBarcodeMode } from '../../hooks/useBarcodeScanner';
import { cityOptions, discountTypes } from '../../data/mockDropDowns';

const columnHelper = createColumnHelper<ClientData>();

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '');
}

function normalizeCardNumber(cardNumber: string) {
  return cardNumber.replace(/\D/g, '');
}

const Step1 = () => {
  const [search, setSearch] = useState('');
  const { data, setOrderValue } = useCreateOrderStore();
  console.log('Step1 data:', data);
  const selectedClientId = data.selectedClient.id;
  const [barcodeMode] = useState<'enter' | 'timer'>(getBarcodeMode());
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const columns = useMemo(
    () => [
      columnHelper.accessor('code', {
        header: 'ID',
        size: 100,
        cell: (info) => <span className="">{info.getValue()}</span>,
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
        header: 'Debt',
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

  // Handle barcode scanning
  useBarcodeScanner((barcode) => {
    setSearch(barcode);
  }, barcodeMode);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return mockClients;
    const searchTerm = search.trim().toLowerCase();
    const searchPhone = normalizePhone(search);
    const searchCardNumber = normalizeCardNumber(search);

    return mockClients.filter((client) => {
      // Search by name
      if (client.name.toLowerCase().includes(searchTerm)) return true;

      // Search by phone number (normalized)
      if (searchPhone && normalizePhone(client.phone).includes(searchPhone)) return true;

      // Search by email
      if (client.email && client.email.toLowerCase().includes(searchTerm)) return true;

      // Search by card number (normalized)
      if (searchCardNumber && normalizeCardNumber(client.cardNumber).includes(searchCardNumber))
        return true;

      // Search by client code
      if (client.code.toLowerCase().includes(searchTerm)) return true;

      return false;
    });
  }, [search]);

  const table = useReactTable({
    data: filteredClients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      rowSelection: selectedClientId ? { [selectedClientId]: true } : {},
    },
    enableRowSelection: true,
    onRowSelectionChange: (rowSelection) => {
      setOrderValue('selectedClient', rowSelection);
    },
  });
  const handleRowClick = (row: Row<ClientData>) => {
    setOrderValue('selectedClient', row.original);
  };

  const handleNext = () => {
    if (selectedClientId) {
      window.location.hash = '#/create-order/1/phone';
    }
  }; // Virtualized row renderer
  const TableRow = ({
    index,
    style,
    data,
  }: {
    index: number;
    style: React.CSSProperties;
    data: { rows: Row<ClientData>[] };
  }) => {
    const { rows } = data;
    const row = rows[index];
    return (
      <div className="px-6">
        <div
          style={{ ...style, width: 'unset', left: '24px' }}
          className={`flex items-center border-b border-lines hover:bg-gray-accent/50 ${
            selectedClientId === row.original.id ? '!bg-gray-accent' : ''
          }`}
          onClick={() => handleRowClick(row)}
        >
          {row.getVisibleCells().map((cell: ReturnType<typeof row.getVisibleCells>[number]) => {
            const columnWidth = cell.column.getSize();
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
                {typeof cell.column.columnDef.cell === 'function'
                  ? cell.column.columnDef.cell(cell.getContext())
                  : cell.getValue()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  const rows = table.getRowModel().rows;

  // Calculate total width for horizontal scrolling
  const calculatedWidth = table.getAllColumns().reduce((sum, column) => sum + column.getSize(), 0);

  // Use the larger of calculated width or container width to ensure table fills container
  const totalWidth = Math.max(calculatedWidth, containerWidth);

  return (
    <div className="flex flex-col w-full h-full relative gap-2">
      <div className="bg-white rounded-2xl flex gap-6 items-center p-4 px-6">
        {' '}
        <Input
          placeholder="Search by name, phone, card, or scan card"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          wrapperClassName="flex-1"
          iconLeft={<SearchIcon className="w-6 h-6" />}
          inputClassName="w-full min-h-[50px]"
          inputWrapperClassName="w-full"
          maxLength={100}
        />
        <div className="flex items-center gap-4">
          <Button
            label="Create Client"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => console.log('Create Client')}
            variant="primary"
            size="medium"
            className="flex-shrink-0"
          />
          <Button
            label="Next"
            onClick={handleNext}
            variant="tertiary"
            size="medium"
            className="flex-shrink-0"
            disabled={!selectedClientId}
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl flex-col flex-1 py-4 relative overflow-hidden">
        <div className="flex-1 flex flex-col absolute inset-0 top-[16px]">
          {' '}
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
                    headerGroup.headers.map((header) => {
                      const columnWidth = header.getSize();
                      return (
                        <div
                          key={header.id}
                          className="flex items-center px-3 py-3 font-semibold text-base text-gray-700 cursor-pointer hover:bg-gray-100 h-[50px]"
                          style={{
                            width: columnWidth,
                            minWidth: columnWidth,
                            maxWidth: columnWidth,
                          }}
                        >
                          {header.isPlaceholder ? null : (header.column.columnDef.header as string)}
                        </div>
                      );
                    }),
                  )}
                </div>
                {/* Virtualized table body */}{' '}
                <List
                  height={Math.max(500, window.innerHeight - 300)}
                  itemCount={rows.length}
                  itemSize={50}
                  itemData={{ rows }}
                  width={totalWidth}
                  className="scrollbar-small !overflow-x-hidden"
                >
                  {TableRow}
                </List>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1;
