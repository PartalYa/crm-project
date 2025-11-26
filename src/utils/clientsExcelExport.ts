import * as XLSX from 'xlsx';
import { ClientData } from '../data/mockClientData';
import { cityOptions, discountTypes } from '../data/mockDropDowns';

// Helper function to get readable discount type label
const getDiscountTypeLabel = (value: string): string => {
  const discountType = discountTypes.find((type) => type.value === value);
  return discountType ? discountType.label : value;
};

// Helper function to get readable city label
const getCityLabel = (value: string): string => {
  const city = cityOptions.find((option) => option.value === value);
  return city ? city.label : value;
};

// Helper function to get readable status label
const getStatusLabel = (status: string): string => {
  const statusLabels = {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
  };
  return statusLabels[status as keyof typeof statusLabels] || status;
};

// Helper function to format date
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US');
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const exportClientsToExcel = (clientsData: ClientData[]) => {
  // Create worksheet data with headers matching the ClientsTable
  const worksheetData = [
    [
      'Full Name',
      'Card Number',
      'Email',
      'Phone Number',
      'DS Discount',
      'Discount Scheme',
      'Date of Birth',
      'Age',
      'City',
      'Address',
      'Factual Address',
      'Registration Date',
      'Status',
      'VIP',
      'Debt',
    ],
    // Data rows
    ...clientsData.map((client) => [
      client.name,
      client.cardNumber,
      client.email || '-',
      client.phone,
      client.dsDiscount !== undefined ? client.dsDiscount.toString() : '-',
      getDiscountTypeLabel(client.discount),
      formatDate(client.dateOfBirth),
      client.age?.toString() || '-',
      getCityLabel(client.city || ''),
      client.address,
      client.factualAddress,
      formatDate(client.dateOfRegistration),
      getStatusLabel(client.status || ''),
      client.isVip ? 'Yes' : 'No',
      formatCurrency(client.debt),
    ]),
  ];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Style the headers
  const headerStyle = {
    font: { bold: true },
    alignment: { horizontal: 'center', vertical: 'center' },
    fill: { fgColor: { rgb: 'E6E6FA' } },
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    },
  };

  // Apply styles to headers (row 1)
  const headerCells = [
    'A1',
    'B1',
    'C1',
    'D1',
    'E1',
    'F1',
    'G1',
    'H1',
    'I1',
    'J1',
    'K1',
    'L1',
    'M1',
    'N1',
    'O1',
  ];

  headerCells.forEach((cell) => {
    if (!worksheet[cell]) worksheet[cell] = {};
    worksheet[cell].s = headerStyle;
  });

  // Set column widths to match the table
  const columnWidths = [
    { wch: 30 }, // Full Name
    { wch: 15 }, // Card Number
    { wch: 25 }, // Email
    { wch: 18 }, // Phone Number
    { wch: 15 }, // DS Discount
    { wch: 20 }, // Discount Scheme
    { wch: 18 }, // Date of Birth
    { wch: 8 }, // Age
    { wch: 15 }, // City
    { wch: 35 }, // Address
    { wch: 35 }, // Factual Address
    { wch: 18 }, // Registration Date
    { wch: 15 }, // Status
    { wch: 8 }, // VIP
    { wch: 12 }, // Debt
  ];
  worksheet['!cols'] = columnWidths;

  // Add auto-filter to the headers
  const lastColumn = String.fromCharCode(65 + columnWidths.length - 1); // Convert to letter (A=65)
  const lastRow = clientsData.length + 1;
  worksheet['!autofilter'] = { ref: `A1:${lastColumn}${lastRow}` };

  // Freeze the header row
  worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');

  // Generate filename with current date
  const filename = `clients_export_${new Date().toISOString().slice(0, 10)}.xlsx`;

  // Write and download file
  XLSX.writeFile(workbook, filename, { bookType: 'xlsx' });

  console.log(`Excel file exported: ${filename}`);

  return filename;
};

// Export function for selected clients only
export const exportSelectedClientsToExcel = (clientsData: ClientData[], selectedIds: string[]) => {
  const selectedClients = clientsData.filter((_, index) => selectedIds.includes(index.toString()));

  if (selectedClients.length === 0) {
    console.warn('No clients selected for export');
    return;
  }

  // Use the same export function but with filtered data
  const filename = exportClientsToExcel(selectedClients);

  // Update the filename to indicate it's a selection
  const selectionFilename = filename.replace(
    'clients_export_',
    `selected_clients_${selectedClients.length}_`,
  );

  console.log(`Selected clients exported: ${selectionFilename}`);

  return selectionFilename;
};
