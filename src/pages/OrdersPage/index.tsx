import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import SettingsIcon from '@assets/settings.svg?react';
import PlusIcon from '@assets/plus.svg?react';
import Checkbox from '../../components/Checkbox';
import DatePicker from '../../components/DatePicker';
import OrdersTable from '../../components/OrdersTable';
import { mockOrders } from '../../data/mockOrderData';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import barEnter from '@assets/bar_enter.png';
import { useBarcodeScanner, getBarcodeMode, setBarcodeMode } from '../../hooks/useBarcodeScanner';
import ExportIcon from '@assets/export.svg?react';
import TrashIcon from '@assets/trash.svg?react';
import CheckIcon from '@assets/check.svg?react';
import { exportOrdersToExcel } from '../../utils/ordersExcelExport';
import { useCreatedOrdersStore } from '../../stores/createdOrders';
import { convertOrderToTable } from '../../utils/orderUtils';
import { OrderData } from '../../data/mockOrderData';

const typeOptions = [
  { value: 'all', label: 'All' },
  { value: 'reception', label: 'Reception' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'return', label: 'Return' },
];

const warehouseOptions = [
  { value: 'all', label: 'All' },
  { value: 'warehouse1', label: 'Warehouse #1' },
  { value: 'warehouse2', label: 'Warehouse #2' },
  { value: 'warehouse3', label: 'Warehouse #3' },
  { value: 'main', label: 'Main Warehouse' },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [tag, setTag] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [dateRange, setDateRange] = useState<[string, string] | string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showOutbound, setShowOutbound] = useState(false);
  const [showCancelledClosed, setShowCancelledClosed] = useState(true);
  const [showWithPhotosOnly, setShowWithPhotosOnly] = useState(false);
  const [barcodeMode, setBarcodeModeState] = useState<'enter' | 'timer'>(getBarcodeMode());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { orders } = useCreatedOrdersStore();
  console.log('Orders from store:', orders);
  const [ordersData, setOrdersData] = useState<OrderData[]>(mockOrders);

  useEffect(() => {
    // Add orders from the store to the top of the ordersData array
    const createdOrders = orders.map((order) => convertOrderToTable(order));
    console.log('Converted orders:', createdOrders);
    setOrdersData([...createdOrders, ...mockOrders]);
  }, [orders]);

  // Export animation states
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupClosing, setPopupClosing] = useState(false);
  // Handle popup animation
  useEffect(() => {
    if (showDownloadPopup) {
      setPopupVisible(true);
      setPopupClosing(false);

      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval); // Trigger the actual export when progress is complete
            // Calculate filtered orders at export time to avoid dependency issues
            const currentFilteredOrders = ordersData.filter((order) => {
              if (tag.trim() && !order.tag.includes(tag.trim())) return false;
              if (
                orderNumber.trim() &&
                !order.orderNumber.toLowerCase().includes(orderNumber.toLowerCase().trim())
              )
                return false;
              if (selectedType && selectedType !== 'all') {
                const typeMapping: Record<string, number[]> = {
                  reception: [1],
                  delivery: [2],
                  pickup: [1, 2],
                  return: [3],
                };
                if (typeMapping[selectedType] && !typeMapping[selectedType].includes(order.status))
                  return false;
              }
              if (dateRange && Array.isArray(dateRange) && dateRange[0] && dateRange[1]) {
                const orderDate = order.createdDate;
                const convertDateFormat = (dateStr: string) => {
                  const [day, month, year] = dateStr.split('.');
                  return `${year}-${month}-${day}`;
                };
                const startDate = new Date(convertDateFormat(dateRange[0]));
                const endDate = new Date(convertDateFormat(dateRange[1]));
                if (orderDate < startDate || orderDate > endDate) return false;
              }
              if (selectedWarehouse && selectedWarehouse !== 'all') {
                const warehouseMap: Record<string, string> = {
                  warehouse1: 'Warehouse #1',
                  warehouse2: 'Warehouse #2',
                  warehouse3: 'Warehouse #3',
                  main: 'Main Warehouse',
                };
                const searchTerm = warehouseMap[selectedWarehouse] || selectedWarehouse;
                if (!order.warehouse.toLowerCase().includes(searchTerm.toLowerCase())) return false;
              }
              if (
                clientSearch.trim() &&
                !order.client.toLowerCase().includes(clientSearch.toLowerCase().trim())
              )
                return false;
              if (showOutbound && !order.isOutbound) return false;
              if (!showCancelledClosed && order.status === 3) return false;
              if (showWithPhotosOnly && !order.hasPhotos) return false;
              return true;
            });

            exportOrdersToExcel(currentFilteredOrders);

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
  }, [
    showDownloadPopup,
    ordersData,
    tag,
    orderNumber,
    selectedType,
    dateRange,
    selectedWarehouse,
    clientSearch,
    showOutbound,
    showCancelledClosed,
    showWithPhotosOnly,
  ]);

  const handleExportToExcel = () => {
    // Start the loading animation (export will happen when progress reaches 100%)
    setShowDownloadPopup(true);
    setDownloadProgress(0);
  };

  const handleCancelDownload = () => {
    setShowDownloadPopup(false);
    setDownloadProgress(0);
  };

  // Function to clear all filters
  const clearFilters = async () => {
    setTag('');
    setOrderNumber('');
    setSelectedType('');
    setDateRange('');
    setSelectedWarehouse('');
    setClientSearch('');
    setShowOutbound(false);
    setShowCancelledClosed(true);
    setShowWithPhotosOnly(false);
  };

  const handleSetTag = (barcode: string) => {
    // clear other filters, because if one scans a tag it means that there would only be one order with that tag
    clearFilters().then(() => {
      setTag(barcode);
    });
  };

  useBarcodeScanner((barcode) => handleSetTag(barcode), barcodeMode);
  // Check if any filter is active
  const hasFilters = Boolean(
    tag.trim() ||
      orderNumber.trim() ||
      (selectedType && selectedType !== 'all') ||
      (Array.isArray(dateRange) && dateRange[0] && dateRange[1]) ||
      (selectedWarehouse && selectedWarehouse !== 'all') ||
      clientSearch.trim() ||
      showOutbound ||
      !showCancelledClosed ||
      showWithPhotosOnly,
  );
  const filteredOrders = useMemo(() => {
    return ordersData.filter((order) => {
      // Tag filter
      if (tag.trim() && !order.tag.includes(tag.trim())) return false;

      // Order number filter
      if (
        orderNumber.trim() &&
        !order.orderNumber.toLowerCase().includes(orderNumber.toLowerCase().trim())
      )
        return false; // Type filter - we'll use status as a proxy for different types
      // In a real app, you'd have a proper type field
      if (selectedType && selectedType !== 'all') {
        const typeMapping: Record<string, number[]> = {
          reception: [1], // Pending orders are receptions
          delivery: [2], // Processing orders are deliveries
          pickup: [1, 2], // Both pending and processing can be pickup
          return: [3], // Completed orders could be returns
        };
        if (typeMapping[selectedType] && !typeMapping[selectedType].includes(order.status))
          return false;
      }

      // Date range filter
      if (dateRange && Array.isArray(dateRange) && dateRange[0] && dateRange[1]) {
        const orderDate = order.createdDate;

        // Convert dd.mm.yyyy format to yyyy-mm-dd for proper Date parsing
        const convertDateFormat = (dateStr: string) => {
          const [day, month, year] = dateStr.split('.');
          return `${year}-${month}-${day}`;
        };

        const startDate = new Date(convertDateFormat(dateRange[0]));
        const endDate = new Date(convertDateFormat(dateRange[1]));

        if (orderDate < startDate || orderDate > endDate) return false;
      } // Warehouse filter - check if the warehouse contains the selected value
      if (selectedWarehouse && selectedWarehouse !== 'all') {
        const warehouseMap: Record<string, string> = {
          warehouse1: 'Warehouse #1',
          warehouse2: 'Warehouse #2',
          warehouse3: 'Warehouse #3',
          main: 'Main Warehouse',
        };
        const searchTerm = warehouseMap[selectedWarehouse] || selectedWarehouse;
        if (!order.warehouse.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      }

      // Client filter
      if (
        clientSearch.trim() &&
        !order.client.toLowerCase().includes(clientSearch.toLowerCase().trim())
      )
        return false;

      // Outbound orders filter
      if (showOutbound && !order.isOutbound) return false;

      // Show cancelled/closed filter (assuming status 3 is closed/cancelled)
      if (!showCancelledClosed && order.status === 3) return false;

      // Show with photos only filter
      if (showWithPhotosOnly && !order.hasPhotos) return false;

      return true;
    });
  }, [
    ordersData, // Add ordersData to dependency array
    tag,
    orderNumber,
    selectedType,
    dateRange,
    selectedWarehouse,
    clientSearch,
    showOutbound,
    showCancelledClosed,
    showWithPhotosOnly,
  ]);

  const handleReset = () => {
    setTag('');
    setOrderNumber('');
    setSelectedType('');
    setDateRange('');
    setSelectedWarehouse('');
    setClientSearch('');
    setShowOutbound(false);
    setShowCancelledClosed(true);
    setShowWithPhotosOnly(false);
  };
  const handleSwitch = (checked: boolean) => {
    const mode = checked ? 'timer' : 'enter';
    setBarcodeMode(mode);
    setBarcodeModeState(mode);
  };

  return (
    <div className="flex gap-2 w-full h-full flex-1">
      <div className="flex flex-col gap-2 w-[287px] h-full">
        <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white">
          <div className="flex w-full justify-between items-center">
            <span className="text-base font-semibold">Filters</span>{' '}
            <button
              className={`text-base font-medium cursor-pointer transition-colors ${
                hasFilters
                  ? 'text-blue hover:text-blue-hover active:text-blue-active'
                  : 'text-gray cursor-default'
              }`}
              onClick={handleReset}
              disabled={!hasFilters}
            >
              Reset
            </button>
          </div>
          <div className="divider-h" />{' '}
          <Input
            label="Order Number"
            placeholder="#"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            wrapperClassName="w-full"
            inputClassName="w-full"
            inputWrapperClassName="w-full"
          />
          <Input
            label="Tag"
            placeholder="#"
            onChange={(e) => setTag(e.target.value)}
            wrapperClassName="w-full"
            inputClassName="w-full"
            inputWrapperClassName="w-full"
            value={tag}
          />
          <div className="divider-h" />{' '}
          <Select
            label="Type"
            options={typeOptions}
            value={selectedType}
            placeholder="Reception"
            onChange={(value) => setSelectedType(value)}
            wrapperClassName="w-full"
          />{' '}
          <DatePicker
            label="Date"
            onChange={(dateRange) => setDateRange(dateRange)}
            wrapperClassName="w-full"
            isRange={true}
            placeholder="Select period"
            value={dateRange}
          />
          <div className="divider-h" />{' '}
          <Select
            label="Warehouse"
            options={warehouseOptions}
            value={selectedWarehouse}
            placeholder="Warehouse"
            onChange={(value) => setSelectedWarehouse(value)}
            wrapperClassName="w-full"
          />{' '}
          <Input
            label="Client"
            placeholder="#"
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            wrapperClassName="w-full"
            inputClassName="w-full"
            inputWrapperClassName="w-full"
          />{' '}
          <Checkbox
            label="Outbound Orders"
            checked={showOutbound}
            onCheckedChange={(checked) => setShowOutbound(!!checked)}
            wrapperClassName="w-full"
          />{' '}
          <Checkbox
            label="Show Cancelled and Closed Orders"
            checked={showCancelledClosed}
            onCheckedChange={(checked) => setShowCancelledClosed(!!checked)}
            wrapperClassName="w-full"
          />{' '}
          <Checkbox
            label="Show Orders with Photos Only"
            checked={showWithPhotosOnly}
            onCheckedChange={(checked) => setShowWithPhotosOnly(!!checked)}
            wrapperClassName="w-full"
          />
        </div>
        <Button
          label="Settings"
          onClick={() => setSettingsOpen(true)}
          icon={<SettingsIcon />}
          variant="secondary"
          size="medium"
          className="w-full"
        />
        {settingsOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/15"
            onClick={() => setSettingsOpen(false)}
          >
            <div
              className="bg-white rounded-xl p-6 min-w-[320px] shadow-xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setSettingsOpen(false)}
              >
                ×
              </button>
              <div className="mb-4 text-lg font-semibold flex flex-col gap-2">
                Barcode Scanner Settings
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-base font-medium">Scan for Enter mode:</span>
                <img
                  src={barEnter}
                  alt="Enter Barcode"
                  className="bar-img w-full h-auto max-w-[490px]"
                />
              </div>
              <div className="flex items-center gap-3">
                <span>Enter/Tab (default)</span>{' '}
                <SwitchPrimitive.Root
                  checked={barcodeMode === 'timer'}
                  onCheckedChange={handleSwitch}
                  className="w-[42px] h-[25px] bg-gray-300 rounded-full relative data-[state=checked]:bg-blue cursor-default"
                >
                  <SwitchPrimitive.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px] shadow-lg" />
                </SwitchPrimitive.Root>
                <span>Timer (without Enter/Tab)</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {barcodeMode === 'enter'
                  ? 'Scanning ends with pressing Enter or Tab.'
                  : 'Scanning is determined by input speed (without Enter/Tab).'}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-2 overflow-x-hidden">
        {' '}
        <div className="bg-white rounded-2xl flex justify-between items-center p-4 px-6">
          <h1>Orders</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button
                label="Export to Excel"
                onClick={handleExportToExcel}
                variant="ghost"
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
                      orders_export_{new Date().toISOString().slice(0, 10)}.xls
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
            </div>
            <Button
              label="Create"
              onClick={() => navigate('/create-order/1')}
              icon={<PlusIcon />}
              variant="primary"
              size="medium"
            />
          </div>
        </div>
        <div className="flex-1 bg-white rounded-2xl overflow-hidden">
          {ordersData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">No orders</div>
          ) : (
            <OrdersTable data={filteredOrders} className="h-full" />
          )}
        </div>
      </div>
    </div>
  );
}
