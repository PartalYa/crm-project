import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import SettingsIcon from '@assets/settings.svg?react';
import PlusIcon from '@assets/plus.svg?react';
import ExportIcon from '@assets/export.svg?react';
import SearchIcon from '@assets/search.svg?react';
import TrashIcon from '@assets/trash.svg?react';
import CheckIcon from '@assets/check.svg?react';
import DatePicker from '../../components/DatePicker';
// import ClientsTable from '../../components/ClientsTable';
import ClientsTable from '../../components/ClientsTable';
import { mockClients } from '../../data/mockClientData';
import { useState, useMemo, useEffect } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import barEnter from '@assets/bar_enter.png';
import { useBarcodeScanner, getBarcodeMode, setBarcodeMode } from '../../hooks/useBarcodeScanner';
import { cityOptions, discountTypes } from '../../data/mockDropDowns';
import { exportClientsToExcel } from '../../utils/clientsExcelExport';

export default function ClientsPage() {
  const [selectedType, setSelectedType] = useState('');
  const [dateRange, setDateRange] = useState<[string, string] | string>('');
  const [selectedCity, setSelectedCity] = useState('');
  const [search, setSearch] = useState('');
  const [barcodeMode, setBarcodeModeState] = useState<'enter' | 'timer'>(getBarcodeMode());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

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
            clearInterval(progressInterval);

            // Trigger the actual export when progress is complete
            exportClientsToExcel(filteredClients);

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
  }, [showDownloadPopup]);

  const handleExportToExcel = () => {
    // Start the loading animation (export will happen when progress reaches 100%)
    setShowDownloadPopup(true);
    setDownloadProgress(0);
  };

  const handleCancelDownload = () => {
    setShowDownloadPopup(false);
    setDownloadProgress(0);
  };

  const handleBarScan = (barcode: string) => {
    setSearch(barcode);
    setSelectedType('');
    setDateRange('');
    setSelectedCity('');
  };

  useBarcodeScanner((barcode) => handleBarScan(barcode), barcodeMode);
  // Check if any filter is active
  const hasFilters = Boolean(
    (selectedType && selectedType !== 'all') ||
      (Array.isArray(dateRange) && dateRange[0] && dateRange[1]) ||
      (selectedCity && selectedCity !== 'all'),
  );
  const filteredClients = useMemo(() => {
    return mockClients.filter((client) => {
      // In a real app, you'd have a proper type field
      // Search filter (name, cardNumber, phone)
      if (search) {
        const searchLower = search.toLowerCase();
        if (
          !client.name.toLowerCase().includes(searchLower) &&
          !client.cardNumber.toLowerCase().includes(searchLower) &&
          !client.phone.includes(search) &&
          !client.email?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      if (selectedType && selectedType !== 'all' && client.discount !== selectedType) return false;
      // City filter
      if (selectedCity && selectedCity !== 'all' && client.city !== selectedCity) return false;

      // Date range filter based on dateOfRegistration
      if (Array.isArray(dateRange) && dateRange[0] && dateRange[1]) {
        // Convert dd.mm.yyyy format to yyyy-mm-dd for proper Date parsing
        const convertDateFormat = (dateStr: string) => {
          const [day, month, year] = dateStr.split('.');
          return `${year}-${month}-${day}`;
        };

        const startDate = new Date(convertDateFormat(dateRange[0]));
        const endDate = new Date(convertDateFormat(dateRange[1]));
        const clientDate = new Date(client.dateOfRegistration);

        if (clientDate < startDate || clientDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [selectedType, dateRange, selectedCity, search]);

  const handleReset = () => {
    setSelectedType('');
    setDateRange('');
    setSelectedCity('');
    setSearch('');
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
          <Select
            label="Discount Type"
            options={[{ value: 'all', label: 'All' }, ...discountTypes]}
            value={selectedType}
            placeholder="Discount Type"
            onChange={(value) => setSelectedType(value)}
            wrapperClassName="w-full"
          />{' '}
          <div className="divider-h" />{' '}
          <Select
            label="City"
            options={[{ value: 'all', label: 'All' }, ...cityOptions]}
            value={selectedCity}
            placeholder="City"
            onChange={(value) => setSelectedCity(value)}
            wrapperClassName="w-full"
          />
          <DatePicker
            label="Date range"
            onChange={(dateRange) => setDateRange(dateRange)}
            wrapperClassName="w-full"
            isRange={true}
            placeholder="Select period"
            value={dateRange}
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
        <div className="bg-white rounded-2xl flex justify-between items-center py-[6px] px-6 h-[60px]">
          <h1>Clients</h1>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search by name, phone number,..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              iconLeft={<SearchIcon className="w-4 h-4" />}
              wrapperClassName="w-[338px]"
              inputClassName="w-full min-h-[48px]"
              inputWrapperClassName="w-full"
            />
            <Button
              label="Create"
              onClick={() => {}}
              icon={<PlusIcon />}
              variant="primary"
              size="medium"
            />
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
                      clients_export_{new Date().toISOString().slice(0, 10)}.xls
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
          </div>
        </div>{' '}
        <div className="flex-1 bg-white rounded-2xl overflow-hidden">
          <ClientsTable data={filteredClients} className="" />
        </div>
      </div>
    </div>
  );
}
