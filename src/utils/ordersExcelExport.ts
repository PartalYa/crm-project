import * as XLSX from 'xlsx';
import { OrderData } from '../data/mockOrderData';

// Helper function to get readable status label
const getStatusLabel = (status: number): string => {
  const statusLabels = {
    1: 'In Progress',
    2: 'Ready',
    3: 'Completed',
  };
  return statusLabels[status as keyof typeof statusLabels] || `Status ${status}`;
};

// Helper function to format date
const formatDate = (date: Date | string): string => {
  if (!date) return '-';

  // Convert to Date object if it's a string
  const dateObj = date instanceof Date ? date : new Date(date);

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) return '-';

  return dateObj.toLocaleDateString('en-US');
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Helper function to format weight
const formatWeight = (weight: number): string => {
  return weight.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
};

export const exportOrdersToExcel = (ordersData: OrderData[]) => {
  // Create worksheet data with headers matching the OrdersTable
  const worksheetData = [
    [
      '№',
      'Status',
      'Date Received',
      'Date Issued',
      'Company',
      'Receiver',
      'Client',
      'Price List',
      'Amount',
      'Payment',
      'Debt',
      'Warehouse',
      'Tag',
      'Number of Items',
      'Weight',
      'Outbound Order',
      'Has Photos',
      'Notes',
    ],
    // Data rows
    ...ordersData.map((order) => [
      order.orderNumber,
      getStatusLabel(order.status),
      formatDate(order.createdDate),
      formatDate(order.updatedDate),
      order.company,
      order.receiver,
      order.client,
      order.priceList,
      formatCurrency(order.amount),
      formatCurrency(order.amount), // Same as amount for now
      formatCurrency(order.amount), // Same as amount for now
      order.warehouse,
      order.tag,
      order.items.toString(),
      formatWeight(order.weight),
      order.isOutbound ? 'Yes' : 'No',
      order.hasPhotos ? 'Yes' : 'No',
      order.notes || '-',
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
    'P1',
    'Q1',
    'R1',
  ];

  headerCells.forEach((cell) => {
    if (!worksheet[cell]) worksheet[cell] = {};
    worksheet[cell].s = headerStyle;
  });

  // Set column widths to match the table
  const columnWidths = [
    { wch: 15 }, // №
    { wch: 12 }, // Status
    { wch: 18 }, // Date Received
    { wch: 18 }, // Date Issued
    { wch: 25 }, // Company
    { wch: 25 }, // Receiver
    { wch: 25 }, // Client
    { wch: 20 }, // Price List
    { wch: 15 }, // Amount
    { wch: 15 }, // Payment
    { wch: 15 }, // Debt
    { wch: 30 }, // Warehouse
    { wch: 15 }, // Tag
    { wch: 18 }, // Number of Items
    { wch: 12 }, // Weight
    { wch: 18 }, // Outbound Order
    { wch: 12 }, // Has Photos
    { wch: 40 }, // Notes
  ];
  worksheet['!cols'] = columnWidths;

  // Add auto-filter to the headers
  const lastColumn = String.fromCharCode(65 + columnWidths.length - 1); // Convert to letter (A=65)
  const lastRow = ordersData.length + 1;
  worksheet['!autofilter'] = { ref: `A1:${lastColumn}${lastRow}` };

  // Freeze the header row
  worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

  // Generate filename with current date
  const filename = `orders_export_${new Date().toISOString().slice(0, 10)}.xlsx`;

  // Write and download file
  XLSX.writeFile(workbook, filename, { bookType: 'xlsx' });

  console.log(`Excel file exported: ${filename}`);

  return filename;
};

// Export function for selected orders only
export const exportSelectedOrdersToExcel = (ordersData: OrderData[], selectedIds: string[]) => {
  const selectedOrders = ordersData.filter((_, index) => selectedIds.includes(index.toString()));

  if (selectedOrders.length === 0) {
    console.warn('No orders selected for export');
    return;
  }

  // Use the same export function but with filtered data
  const filename = exportOrdersToExcel(selectedOrders);

  // Update the filename to indicate it's a selection
  const selectionFilename = filename.replace(
    'orders_export_',
    `selected_orders_${selectedOrders.length}_`,
  );

  console.log(`Selected orders exported: ${selectionFilename}`);

  return selectionFilename;
};
