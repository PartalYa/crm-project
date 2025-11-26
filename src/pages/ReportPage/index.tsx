import { useState, useEffect, useMemo } from 'react';
import Button from '../../components/Button';
import Checkbox from '../../components/Checkbox';
import DatePicker from '../../components/DatePicker';
import Input from '../../components/Input';
import Select from '../../components/Select';
import ExportIcon from '@assets/export.svg?react';
import ReportTable, { ReportTableColumn } from '../../components/ReportTable';
import TrashIcon from '@assets/trash.svg?react';
import CheckIcon from '@assets/check.svg?react';
import { exportReportToExcel } from '../../utils/genericExcelExport';

const paymentTypeOptions = [
  { label: 'All', value: 'all' },
  { label: 'Cash', value: 'cash' },
  { label: 'Card', value: 'card' },
  { label: 'Cashless', value: 'cashless' },
];

const serviceTypeOptions = [
  { label: 'All', value: 'all' },
  { label: 'Dry Cleaning', value: 'dry_cleaning' },
  { label: 'Washing', value: 'washing' },
  { label: 'Ironing', value: 'ironing' },
  { label: 'Clothing Repair', value: 'clothing_repair' },
];

export default function ReportPage() {
  const [tableType, setTableType] = useState<'financial' | 'operational' | 'warehouse'>(
    'financial',
  );
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false); // for animation
  const [popupClosing, setPopupClosing] = useState(false);

  // Filter state variables
  const [dateRange, setDateRange] = useState<[string, string] | string>('');
  const [selectedPP, setSelectedPP] = useState('');
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [considerChemicalConsumption, setConsiderChemicalConsumption] = useState(false);

  // Table column configs
  const financialColumns = [
    { key: 'date', label: 'Date' },
    { key: 'pp', label: 'PP' },
    { key: 'client', label: 'Client' },
    { key: 'service', label: 'Service' },
    { key: 'amount', label: 'Amount' },
    { key: 'paymentType', label: 'Payment Type' },
  ];

  const operationalColumns = [
    { key: 'date', label: 'Date' },
    { key: 'pp', label: 'PP' },
    { key: 'employee', label: 'Employee' },
    { key: 'washing', label: 'Washing' },
    { key: 'ironing', label: 'Ironing' },
    { key: 'delivery', label: 'Delivery' },
    { key: 'reception', label: 'Reception' },
  ];

  const warehouseColumns = [
    { key: 'date', label: 'Date' },
    { key: 'pp', label: 'PP' },
    { key: 'material', label: 'Material Name' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'service', label: 'Service' },
    { key: 'employee', label: 'Employee' },
    { key: 'comment', label: 'Comment' },
  ];
  // Mock data generation (static - won't regenerate on state changes)
  const mockData = useMemo(() => {
    function generateFinancialData(count = 100) {
      const paymentTypes = ['Cash', 'Card', 'Cashless'];
      const services = ['Washing', 'Ironing', 'Dry Cleaning', 'Clothing Repair'];
      const clients = ['John Smith', 'Sarah Johnson', 'Michael Williams', 'Emily Brown'];
      const pps = ['Saltivka', 'Center', 'Pavlova'];
      const data = [];
      for (let i = 0; i < count; i++) {
        data.push({
          date: new Date(2025, 4, (i % 31) + 1).toLocaleDateString('en-US'),
          pp: pps[i % pps.length],
          client: clients[i % clients.length],
          service: services[i % services.length],
          amount: (((i * 17 + 123) % 1000) + 100).toFixed(2), // Static "random" amount
          paymentType: paymentTypes[i % paymentTypes.length],
        });
      }
      return data;
    }

    function generateOperationalData(count = 100) {
      const employees = ['Kovalenko A.', 'Gritsenko V.', 'Melnyk I.', 'Shevchenko O.'];
      const pps = ['Saltivka', 'Center', 'Pavlova'];
      const data = [];
      for (let i = 0; i < count; i++) {
        data.push({
          date: new Date(2025, 4, (i % 31) + 1).toLocaleDateString('en-US'),
          pp: pps[i % pps.length],
          employee: employees[i % employees.length],
          washing: (i * 7 + 3) % 10, // Static "random" numbers
          ironing: (i * 11 + 5) % 10,
          delivery: (i * 13 + 7) % 10,
          reception: (i * 19 + 9) % 10,
        });
      }
      return data;
    }

    function generateWarehouseData(count = 100) {
      const materials = ['Powder', 'Bleach', 'Stain Remover', 'Soap'];
      const pps = ['Saltivka', 'Center', 'Pavlova'];
      const employees = ['Kovalenko A.', 'Gritsenko V.', 'Melnyk I.', 'Shevchenko O.'];
      const services = ['Washing', 'Ironing', 'Dry Cleaning', 'Clothing Repair'];
      const comments = ['-', 'Urgent', 'Needs Verification', 'Completed'];
      const data = [];
      for (let i = 0; i < count; i++) {
        data.push({
          date: new Date(2025, 4, (i % 31) + 1).toLocaleDateString('en-US'),
          pp: pps[i % pps.length],
          material: materials[i % materials.length],
          quantity: ((i * 3 + 7) % 20) + 1, // Static "random" quantity
          service: services[i % services.length],
          employee: employees[i % employees.length],
          comment: comments[i % comments.length],
        });
      }
      return data;
    }

    return {
      financial: generateFinancialData(200),
      operational: generateOperationalData(200),
      warehouse: generateWarehouseData(200),
    };
  }, []); // Empty dependency array ensures this only runs once
  const tableColumns: Record<string, ReportTableColumn[]> = {
    financial: financialColumns,
    operational: operationalColumns,
    warehouse: warehouseColumns,
  };
  const rawTableData = mockData;
  // Filter the data based on current filters
  const filteredTableData = useMemo(() => {
    const filtered: Record<string, Record<string, unknown>[]> = {};

    Object.keys(rawTableData).forEach((tableKey) => {
      const tableType = tableKey as keyof typeof rawTableData;
      filtered[tableKey] = rawTableData[tableType].filter((item: Record<string, unknown>) => {
        // Date range filter
        if (Array.isArray(dateRange) && dateRange[0] && dateRange[1]) {
          const itemDateParts = (item.date as string).split('.');
          const itemDate = new Date(
            parseInt(itemDateParts[2]), // year
            parseInt(itemDateParts[1]) - 1, // month (0-indexed)
            parseInt(itemDateParts[0]), // day
          );
          const startDate = new Date(dateRange[0]);
          const endDate = new Date(dateRange[1]);
          if (itemDate < startDate || itemDate > endDate) return false;
        }

        // PP (Point of reception) filter
        if (selectedPP && selectedPP !== 'all' && item.pp !== selectedPP) return false;

        // Payment type filter (only for financial table)
        if (selectedPaymentType && selectedPaymentType !== 'all' && tableKey === 'financial') {
          const paymentTypeMap: Record<string, string> = {
            cash: 'Cash',
            card: 'Card',
            cashless: 'Cashless',
          };
          const searchTerm = paymentTypeMap[selectedPaymentType] || selectedPaymentType;
          if (item.paymentType !== searchTerm) return false;
        }

        // Client search filter (only for financial table)
        if (clientSearch.trim() && tableKey === 'financial') {
          if (!(item.client as string).toLowerCase().includes(clientSearch.toLowerCase().trim()))
            return false;
        }

        // Employee search filter (for operational and warehouse tables)
        if (employeeSearch.trim() && (tableKey === 'operational' || tableKey === 'warehouse')) {
          if (
            !(item.employee as string).toLowerCase().includes(employeeSearch.toLowerCase().trim())
          )
            return false;
        }

        // Service type filter
        if (selectedServiceType && selectedServiceType !== 'all') {
          const serviceTypeMap: Record<string, string> = {
            dry_cleaning: 'Dry Cleaning',
            washing: 'Washing',
            ironing: 'Ironing',
            clothing_repair: 'Clothing Repair',
          };
          const searchTerm = serviceTypeMap[selectedServiceType] || selectedServiceType;
          if (item.service && !(item.service as string).includes(searchTerm)) return false;
        }

        return true;
      });
    });

    return filtered;
  }, [
    rawTableData,
    dateRange,
    selectedPP,
    selectedPaymentType,
    clientSearch,
    employeeSearch,
    selectedServiceType,
  ]);

  // Check if any filters are applied
  const hasFilters = useMemo(() => {
    return !!(
      (Array.isArray(dateRange) && dateRange[0] && dateRange[1]) ||
      (selectedPP && selectedPP !== 'all') ||
      (selectedPaymentType && selectedPaymentType !== 'all') ||
      clientSearch.trim() ||
      employeeSearch.trim() ||
      (selectedServiceType && selectedServiceType !== 'all')
    );
  }, [
    dateRange,
    selectedPP,
    selectedPaymentType,
    clientSearch,
    employeeSearch,
    selectedServiceType,
  ]);
  const handleReset = () => {
    setDateRange('');
    setSelectedPP('');
    setSelectedPaymentType('');
    setClientSearch('');
    setEmployeeSearch('');
    setSelectedServiceType('');
    setConsiderChemicalConsumption(false);
  };

  const tableData = filteredTableData;
  useEffect(() => {
    if (showDownloadPopup) {
      setPopupVisible(true);
      setPopupClosing(false);
    } else if (popupVisible) {
      setPopupClosing(true);
      const timer = setTimeout(() => {
        setPopupVisible(false);
        setPopupClosing(false);
      }, 600); // slow fade out
      return () => clearTimeout(timer);
    }
  }, [showDownloadPopup, popupVisible]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showDownloadPopup && downloadProgress < 100) {
      timer = setTimeout(() => {
        setDownloadProgress((p) => Math.min(100, p + Math.floor(Math.random() * 20 + 10)));
      }, 400);
    } else if (showDownloadPopup && downloadProgress === 100) {
      // Export the current filtered data for the active table type
      const currentData = tableData[tableType];
      exportReportToExcel(tableType, currentData);
      timer = setTimeout(() => {
        setShowDownloadPopup(false);
        setDownloadProgress(0);
      }, 1800); // Close 1.8s after complete
    }
    return () => clearTimeout(timer);
  }, [showDownloadPopup, downloadProgress]);
  const handleExport = () => {
    // Show download popup for user feedback
    setShowDownloadPopup(true);
    setDownloadProgress(0);
  };
  const handleCancelDownload = () => {
    setShowDownloadPopup(false);
    setDownloadProgress(0);
  };

  return (
    <div className="flex flex-1 h-full w-full gap-2">
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
            label="Reception Point"
            options={[
              { label: 'All', value: 'all' },
              { label: 'Saltivka', value: 'Saltivka' },
              { label: 'Center', value: 'Center' },
              { label: 'Pavlova', value: 'Pavlova' },
            ]}
            value={selectedPP}
            placeholder="Reception"
            onChange={(value) => setSelectedPP(value)}
            wrapperClassName="w-full"
          />{' '}
          <Select
            label="Payment Type"
            options={paymentTypeOptions}
            value={selectedPaymentType}
            placeholder="Payment Type"
            onChange={(value) => setSelectedPaymentType(value)}
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
          <Input
            label="Employee"
            placeholder="#"
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            wrapperClassName="w-full"
            inputClassName="w-full"
            inputWrapperClassName="w-full"
          />{' '}
          <Select
            label="Service Type"
            options={serviceTypeOptions}
            value={selectedServiceType}
            placeholder="Service Type"
            onChange={(value) => setSelectedServiceType(value)}
            wrapperClassName="w-full"
          />{' '}
          <Checkbox
            label="Consider chemical consumption"
            checked={considerChemicalConsumption}
            onCheckedChange={(checked) => setConsiderChemicalConsumption(!!checked)}
            wrapperClassName="w-full"
          />
        </div>
        <Button
          label="Generate"
          onClick={() => {}}
          variant="tertiary"
          size="medium"
          className="w-full"
        />
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="bg-white rounded-2xl h-[60px] flex items-center justify-between px-6">
          <h1>Reports</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center p-1 rounded-lg border border-gray gap-1 text-base h-10">
              <button
                name="financial"
                className={`font-secondary uppercase leading-[16px] text-black font-semibold tracking-widest py-2 px-4 transition-[.2s] rounded-[6px] ${
                  tableType === 'financial'
                    ? 'bg-black text-white'
                    : 'bg-transparent hover:bg-green-accent'
                }`}
                onClick={() => setTableType('financial')}
              >
                Financial
              </button>
              <button
                name="operational"
                className={`font-secondary uppercase leading-[16px] text-black font-semibold tracking-widest py-2 px-4 transition-[.2s] rounded-[6px] ${
                  tableType === 'operational'
                    ? 'bg-black text-white'
                    : 'bg-transparent hover:bg-green-accent'
                }`}
                onClick={() => setTableType('operational')}
              >
                Operational
              </button>
              <button
                name="warehouse"
                className={`font-secondary uppercase leading-[16px] text-black font-semibold tracking-widest py-2 px-4 transition-[.2s] rounded-[6px] ${
                  tableType === 'warehouse'
                    ? 'bg-black text-white'
                    : 'bg-transparent hover:bg-green-accent'
                }`}
                onClick={() => setTableType('warehouse')}
              >
                Warehouse
              </button>
            </div>
            <div className="relative">
              <Button
                label="Export to Excel"
                onClick={handleExport}
                variant="primary"
                icon={<ExportIcon />}
              />
              {popupVisible && (
                <div
                  className={`absolute top-full w-[272px] right-0 bg-white shadow rounded-lg p-6 flex gap-2 items-center z-50 transition-all duration-150 ease-out ${
                    showDownloadPopup && !popupClosing
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-2 transition-opacity duration-600 ease-in'
                  }`}
                  style={{ pointerEvents: popupClosing ? 'none' : 'auto' }}
                >
                  {' '}
                  <div className="flex flex-col gap-1 w-full">
                    <span className="text-md font-medium leading-[26px]">
                      {tableType === 'financial'
                        ? 'financial_report.xlsx'
                        : tableType === 'operational'
                        ? 'operational_report.xlsx'
                        : 'warehouse_report.xlsx'}
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
        </div>
        <div className="flex-1 bg-white rounded-2xl overflow-hidden">
          <ReportTable
            columns={tableColumns[tableType]}
            data={tableData[tableType]}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
