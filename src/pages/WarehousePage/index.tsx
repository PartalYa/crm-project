import { useState, useEffect, useMemo } from 'react';
import Select from '../../components/Select';
import SimpleTable, { SimpleTableColumn } from '../../components/SimpleTable';
import Button from '../../components/Button';
import ExportIcon from '@assets/export.svg?react';
import TrashIcon from '@assets/trash.svg?react';
import CheckIcon from '@assets/check.svg?react';
import { exportWarehouseToExcel } from '../../utils/warehouseExcelExport';
import { faker } from '@faker-js/faker';

interface RemainsTableRow {
  material: string;
  left: number;
  unit: string;
  minimum: number;
  status: 'pass' | 'warning' | 'danger';
}

interface LossesTableRow {
  point: string;
  service: string;
  client: string;
  date: string;
  loss: string;
}

interface AccountingTableRow {
  material: string;
  distributor: string;
  quantity: number;
  date: string;
  priceForUnit: number;
  totalPrice: number;
}

interface AccountingLossesTableRow {
  material: string;
  quantity: number;
  point: string;
  date: string;
  lostOn: string;
  totalPrice: number;
}

const tagOptions = [
  {
    value: 'pass',
    label: 'Satisfactory',
    color: 'bg-green-tag',
  },
  {
    value: 'warning',
    label: 'On the edge',
    color: 'bg-yellow-tag',
  },
  {
    value: 'danger',
    label: 'Low',
    color: 'bg-red-tag',
  },
];

const Tag = ({ value }: { value: string }) => {
  const tag = tagOptions.find((tag) => tag.value === value);
  return (
    <span
      className={`py-2 px-6 w-fit rounded-[100px] text-black text-md leading-[19px] h-[35px] flex justify-center items-center ${tag?.color}`}
    >
      {tag?.label || 'Unknown'}
    </span>
  );
};

// Helper function to get random variation (±20% of original value)
const getRandomVariation = (baseValue: number, minValue: number = 0): number => {
  const variation = 0.2; // 20% variation
  const min = Math.max(minValue, Math.floor(baseValue * (1 - variation)));
  const max = Math.ceil(baseValue * (1 + variation));
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to get random price variation
const getRandomPriceVariation = (basePrice: number): number => {
  const variation = 0.15; // 15% variation for prices
  const min = Math.floor(basePrice * (1 - variation));
  const max = Math.ceil(basePrice * (1 + variation));
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRemainsMockData = (): RemainsTableRow[] => {
  const baseData = [
    { material: 'Large Bags', left: 150, unit: 'pcs', minimum: 50, status: 'pass' as const },
    { material: 'Hangers', left: 25, unit: 'pcs', minimum: 30, status: 'warning' as const },
    { material: 'Chemicals', left: 8, unit: 'ml', minimum: 20, status: 'danger' as const },
    { material: 'Paper Bags', left: 200, unit: 'pcs', minimum: 100, status: 'pass' as const },
    {
      material: 'Napkins / Rags',
      left: 45,
      unit: 'pcs',
      minimum: 40,
      status: 'warning' as const,
    },
  ];

  return baseData.map((item) => {
    const newLeft = getRandomVariation(item.left, 0);
    let newStatus: 'pass' | 'warning' | 'danger' = 'pass';

    if (newLeft <= item.minimum * 0.5) {
      newStatus = 'danger';
    } else if (newLeft <= item.minimum) {
      newStatus = 'warning';
    }

    return {
      ...item,
      left: newLeft,
      status: newStatus,
    };
  });
};

const lossesMockData: LossesTableRow[] = [
  {
    point: 'Point #1',
    service: 'Coat Dry Cleaning',
    client: faker.person.fullName(),
    date: '2025-05-22',
    loss: '120 ml chemicals, 1 bag',
  },
  {
    point: 'Point #2',
    service: 'Ironing Laundry',
    client: faker.person.fullName(),
    date: '2025-05-23',
    loss: '90 ml chemicals',
  },
  {
    point: 'Point #3',
    service: 'Laundry Washing',
    client: faker.person.fullName(),
    date: '2025-05-24',
    loss: '120 ml chemicals, 2 napkins',
  },
  {
    point: 'Point #4',
    service: 'Blanket Washing',
    client: faker.person.fullName(),
    date: '2025-05-25',
    loss: '150 ml chemicals, 1 bag',
  },
  {
    point: 'Point #5',
    service: 'Dry Cleaning Jacket',
    client: faker.person.fullName(),
    date: '2025-05-26',
    loss: '100 ml chemicals, 1 bag',
  },
];

const generateAccountingMockData = (): AccountingTableRow[] => {
  const baseData = [
    {
      material: 'Laundry Chemicals',
      distributor: 'CleanPro',
      quantity: 50,
      date: '2025-05-20',
      priceForUnit: 80,
      totalPrice: 4000,
    },
    {
      material: 'Laundry Bags',
      distributor: 'PackIt',
      quantity: 200,
      date: '2025-05-21',
      priceForUnit: 10,
      totalPrice: 2000,
    },
    {
      material: 'Hangers',
      distributor: 'HangerCo',
      quantity: 100,
      date: '2025-05-22',
      priceForUnit: 15,
      totalPrice: 1500,
    },
    {
      material: 'Cleaning Wipes',
      distributor: 'CleanSupply',
      quantity: 75,
      date: '2025-05-23',
      priceForUnit: 12,
      totalPrice: 900,
    },
    {
      material: 'Paper Bags',
      distributor: 'EcoPack',
      quantity: 300,
      date: '2025-05-24',
      priceForUnit: 8,
      totalPrice: 2400,
    },
  ];

  return baseData.map((item) => {
    const newQuantity = getRandomVariation(item.quantity, 1);
    const newPriceForUnit = getRandomPriceVariation(item.priceForUnit);
    const newTotalPrice = newQuantity * newPriceForUnit;

    return {
      ...item,
      quantity: newQuantity,
      priceForUnit: newPriceForUnit,
      totalPrice: newTotalPrice,
    };
  });
};

const generateAccountingLossesMockData = (): AccountingLossesTableRow[] => {
  const baseData = [
    {
      material: 'Laundry Chemicals',
      quantity: 120,
      point: 'Point #1',
      date: '2025-05-22',
      lostOn: 'Order #8421',
      totalPrice: 9600,
    },
    {
      material: 'Laundry Bags',
      quantity: 200,
      point: 'Point #2',
      date: '2025-05-23',
      lostOn: 'Laundry Washing',
      totalPrice: 2000,
    },
    {
      material: 'Cleaning Wipes',
      quantity: 75,
      point: 'Point #3',
      date: '2025-05-24',
      lostOn: 'Laundry Washing',
      totalPrice: 900,
    },
    {
      material: 'Paper Bags',
      quantity: 300,
      point: 'Point #5',
      date: '2025-05-25',
      lostOn: 'Laundry Washing',
      totalPrice: 2400,
    },
    {
      material: 'Hangers',
      quantity: 100,
      point: 'Point #4',
      date: '2025-05-26',
      lostOn: 'Dry Cleaning Jacket',
      totalPrice: 1500,
    },
  ];

  return baseData.map((item) => {
    const newQuantity = getRandomVariation(item.quantity, 1);
    const basePrice = item.totalPrice / item.quantity;
    const newTotalPrice = Math.round(newQuantity * basePrice);

    return {
      ...item,
      quantity: newQuantity,
      totalPrice: newTotalPrice,
    };
  });
};

const remainsTableColumns: SimpleTableColumn<RemainsTableRow>[] = [
  {
    key: 'material',
    label: 'Material',
  },
  {
    key: 'left',
    label: 'Remaining',
  },
  {
    key: 'unit',
    label: 'Unit',
  },
  {
    key: 'minimum',
    label: 'Minimum',
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: string) => <Tag value={value} />,
  },
];
const lossesTableColumns: SimpleTableColumn<LossesTableRow>[] = [
  { key: 'point', label: 'Reception Point' },
  { key: 'service', label: 'Service' },
  { key: 'client', label: 'Client', width: 265 },
  { key: 'date', label: 'Date' },
  { key: 'loss', label: 'Written Off (Materials)' },
];
const accountingTableColumns: SimpleTableColumn<AccountingTableRow>[] = [
  { key: 'material', label: 'Material' },
  { key: 'distributor', label: 'Distributor' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'date', label: 'Date' },
  { key: 'priceForUnit', label: 'Price per Unit', render: (value: number) => `$${value}` },
  { key: 'totalPrice', label: 'Total', render: (value: number) => `$${value}` },
];
const accountingLossesTableColumns: SimpleTableColumn<AccountingLossesTableRow>[] = [
  { key: 'material', label: 'Material' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'point', label: 'Reception Point' },
  { key: 'date', label: 'Date' },
  { key: 'lostOn', label: 'Written Off On' },
  { key: 'totalPrice', label: 'Total', render: (value: number) => `$${value}` },
];

export default function WarehousePage() {
  const [accountingType, setAccountingType] = useState<'income' | 'spending'>('income');

  // Filter states
  const [selectedPoint, setSelectedPoint] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedClient, setSelectedClient] = useState('all');

  // Export animation states
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupClosing, setPopupClosing] = useState(false);

  // Generate filtered data based on current filters
  const remainsMockData = useMemo(() => {
    const baseData = generateRemainsMockData();

    // Simulate filtering effect by varying the data based on selected point
    if (selectedPoint === 'point1') {
      return baseData.map((item) => ({
        ...item,
        left: Math.max(item.minimum - 5, Math.floor(item.left * 0.7)),
        status: item.left <= item.minimum ? ('warning' as const) : item.status,
      }));
    } else if (selectedPoint === 'point2') {
      return baseData.map((item) => ({
        ...item,
        left: Math.floor(item.left * 1.3),
        status: 'pass' as const,
      }));
    }

    return baseData;
  }, [selectedPoint]);

  const filteredLossesData = useMemo(() => {
    let filtered = [...lossesMockData];

    if (selectedBranch !== 'all') {
      const branchMap = {
        point1: 'Point #1',
        point2: 'Point #2',
      };
      const branchName = branchMap[selectedBranch as keyof typeof branchMap];
      if (branchName) {
        filtered = filtered.filter((item) => item.point === branchName);
      }
    }

    if (selectedClient !== 'all') {
      const clientMap = {
        point1: 'Client 1',
        point2: 'Client 2',
      };
      const clientName = clientMap[selectedClient as keyof typeof clientMap];
      if (clientName) {
        filtered = filtered.filter((item) => item.client.includes(clientName));
      }
    }

    return filtered;
  }, [selectedBranch, selectedClient]);

  // Generate static data once
  const [accountingMockData] = useState(() => generateAccountingMockData());
  const [accountingLossesMockData] = useState(() => generateAccountingLossesMockData());
  // Handle popup animation
  useEffect(() => {
    if (showDownloadPopup) {
      setPopupVisible(true);
      setPopupClosing(false);

      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);

            // Trigger the actual export when progress is complete
            exportWarehouseToExcel(remainsMockData, accountingMockData, accountingLossesMockData);

            // Hide popup after 2 seconds when complete
            setTimeout(() => {
              setPopupClosing(true);
              setTimeout(() => {
                setPopupVisible(false);
                setShowDownloadPopup(false);
                setDownloadProgress(0);
              }, 600);
            }, 2000);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(progressInterval);
    }
  }, [showDownloadPopup, remainsMockData, accountingMockData, accountingLossesMockData]);

  const handleExportToExcel = () => {
    // Start the loading animation (export will happen when progress reaches 100%)
    setShowDownloadPopup(true);
    setDownloadProgress(0);
  };

  const handleCancelDownload = () => {
    setShowDownloadPopup(false);
    setDownloadProgress(0);
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-2">
      <div className="p-6 bg-white rounded-2xl flex flex-col gap-4">
        {' '}
        <div className="flex items-center justify-between">
          <h1>Warehouse Inventory</h1>{' '}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Button
                label="Export to Excel"
                onClick={handleExportToExcel}
                variant="primary"
                icon={<ExportIcon />}
              />
              {popupVisible && (
                <div
                  className={`absolute top-full w-fit right-0 bg-white shadow rounded-lg p-6 flex gap-2 items-center z-50 transition-all duration-150 ease-out ${
                    showDownloadPopup && !popupClosing
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-2 transition-opacity duration-600 ease-in'
                  }`}
                  style={{ pointerEvents: popupClosing ? 'none' : 'auto' }}
                >
                  <div className="flex flex-col gap-1 w-full">
                    <span className="text-md font-medium leading-[26px] whitespace-nowrap">
                      warehouse_export_{new Date().toISOString().slice(0, 10)}.xls
                    </span>
                    <div className="h-2 w-full bg-border rounded overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          downloadProgress === 100 ? 'bg-green' : 'bg-blue'
                        }`}
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  </div>
                  {downloadProgress < 100 ? (
                    <button
                      className="h-6 w-6 text-black hover:text-blue transition-[.2s]"
                      onClick={handleCancelDownload}
                    >
                      <TrashIcon className="w-full h-full" />
                    </button>
                  ) : (
                    <div className="h-6 w-6">
                      <CheckIcon className="w-full h-full text-green" />
                    </div>
                  )}
                </div>
              )}
            </div>{' '}
            <Select
              options={[
                { label: 'All Points', value: 'all' },
                { label: 'Point #1', value: 'point1' },
                { label: 'Point #2', value: 'point2' },
              ]}
              value={selectedPoint}
              onChange={(value) => setSelectedPoint(value)}
              placeholder="Select Point"
              wrapperClassName="w-[255px]"
            />
          </div>
        </div>
        <SimpleTable
          columns={remainsTableColumns}
          data={remainsMockData}
          rowHeight={50}
          noHeaderStyle
          height={300}
        />
      </div>
      <div className="p-6 bg-white rounded-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1>Write-offs by Order</h1>
          <div className="flex items-center gap-4">
            {' '}
            <Select
              options={[
                { label: 'All Branches', value: 'all' },
                { label: 'Branch 1', value: 'point1' },
                { label: 'Branch 2', value: 'point2' },
              ]}
              value={selectedBranch}
              onChange={(value) => setSelectedBranch(value)}
              placeholder="Select Branch"
              wrapperClassName="w-[255px]"
            />
            <Select
              options={[
                { label: 'All Clients', value: 'all' },
                { label: 'Client 1', value: 'point1' },
                { label: 'Client 2', value: 'point2' },
              ]}
              value={selectedClient}
              onChange={(value) => setSelectedClient(value)}
              placeholder="Select Client"
              wrapperClassName="w-[255px]"
            />
          </div>
        </div>{' '}
        <SimpleTable
          columns={lossesTableColumns}
          data={filteredLossesData}
          rowHeight={50}
          noHeaderStyle
          height={300}
        />
      </div>
      <div className="p-6 bg-white rounded-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1>Material Accounting</h1>
          <div className="flex items-center p-1 rounded-lg border border-gray gap-1 text-base h-10">
            <button
              name="income"
              className={`font-secondary uppercase leading-[16px] text-black font-semibold tracking-widest py-2 px-4 transition-[.2s] rounded-[6px] ${
                accountingType === 'income'
                  ? 'bg-black text-white'
                  : 'bg-transparent hover:bg-green-accent'
              }`}
              onClick={() => setAccountingType('income')}
            >
              Material Income
            </button>
            <button
              name="spending"
              className={`font-secondary uppercase leading-[16px] text-black font-semibold tracking-widest py-2 px-4 transition-[.2s] rounded-[6px] ${
                accountingType === 'spending'
                  ? 'bg-black text-white'
                  : 'bg-transparent hover:bg-green-accent'
              }`}
              onClick={() => setAccountingType('spending')}
            >
              Material Spending
            </button>
          </div>
        </div>
        {accountingType === 'income' ? (
          <SimpleTable
            columns={accountingTableColumns}
            data={accountingMockData}
            rowHeight={50}
            noHeaderStyle
            height={300}
          />
        ) : (
          <SimpleTable
            columns={accountingLossesTableColumns}
            data={accountingLossesMockData}
            rowHeight={50}
            noHeaderStyle
            height={300}
          />
        )}
      </div>
    </div>
  );
}
