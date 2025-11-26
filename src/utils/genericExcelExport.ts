import * as XLSX from 'xlsx';

// Generic interface for column definition
export interface ExportColumn {
  key: string;
  label: string;
  formatter?: (value: unknown, row: Record<string, unknown>) => string;
}

// Helper function to format date
const formatDate = (date: Date | string): string => {
  if (!date) return '-';

  let dateObj: Date;

  if (date instanceof Date) {
    dateObj = date;
  } else {
    // Handle 'dd.mm.yyyy' format
    if (typeof date === 'string' && date.includes('.')) {
      const parts = date.split('.');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        // Create date with month-1 since Date constructor expects 0-based months
        dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = new Date(date);
    }
  }

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) return '-';

  return dateObj.toLocaleDateString('en-US');
};

// Helper function to format currency
const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '-';

  return numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Helper function to format numbers
const formatNumber = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '-';

  return numValue.toLocaleString('en-US');
};

// Default formatters for common data types
export const defaultFormatters = {
  date: (value: unknown) => formatDate(value as Date | string),
  currency: (value: unknown) => formatCurrency(value as number | string),
  number: (value: unknown) => formatNumber(value as number | string),
  text: (value: unknown) => value?.toString() || '-',
  boolean: (value: unknown) => (value ? 'Yes' : 'No'),
};

/**
 * Generic function to export table data to Excel
 * @param data - Array of data objects to export
 * @param columns - Column definitions with keys, labels, and optional formatters
 * @param filename - Name of the exported file (without extension)
 * @param sheetName - Name of the worksheet
 */
export const exportTableToExcel = (
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string = 'export',
  sheetName: string = 'Data',
) => {
  // Create worksheet data with headers
  const worksheetData = [
    // Headers
    columns.map((col) => col.label),
    // Data rows
    ...data.map((row) =>
      columns.map((col) => {
        const value = row[col.key];

        // Use custom formatter if provided, otherwise use the raw value
        if (col.formatter) {
          return col.formatter(value, row);
        }

        // Default formatting based on data type
        if (value === null || value === undefined) {
          return '-';
        }

        if (typeof value === 'boolean') {
          return defaultFormatters.boolean(value);
        }

        if (typeof value === 'number') {
          return defaultFormatters.number(value);
        }

        return defaultFormatters.text(value);
      }),
    ),
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
  // Remove unused variable
  // const headerRange = XLSX.utils.encode_range({
  //   s: { c: 0, r: 0 },
  //   e: { c: columns.length - 1, r: 0 },
  // });

  for (let col = 0; col < columns.length; col++) {
    const cellAddress = XLSX.utils.encode_cell({ c: col, r: 0 });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = headerStyle;
  }
  // Auto-size columns
  const columnWidths = columns.map((col) => {
    let maxWidth = col.label.length;

    // Check data rows for max width
    data.forEach((row) => {
      const value = row[col.key];
      let displayValue = '';

      if (col.formatter) {
        displayValue = col.formatter(value, row);
      } else {
        displayValue = defaultFormatters.text(value);
      }

      maxWidth = Math.max(maxWidth, displayValue.length);
    });

    // Set reasonable limits
    return { wch: Math.min(Math.max(maxWidth + 2, 10), 50) };
  });

  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate and download file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export utility specifically for report data with predefined column configurations
 */
export const exportReportToExcel = (
  tableType: 'financial' | 'operational' | 'warehouse',
  data: Record<string, unknown>[],
  filename?: string,
) => {
  const columnConfigs = {
    financial: [
      { key: 'date', label: 'Date', formatter: defaultFormatters.date },
      { key: 'pp', label: 'PP', formatter: defaultFormatters.text },
      { key: 'client', label: 'Client', formatter: defaultFormatters.text },
      { key: 'service', label: 'Service', formatter: defaultFormatters.text },
      { key: 'amount', label: 'Amount', formatter: defaultFormatters.currency },
      { key: 'paymentType', label: 'Payment Type', formatter: defaultFormatters.text },
    ],
    operational: [
      { key: 'date', label: 'Date', formatter: defaultFormatters.date },
      { key: 'pp', label: 'PP', formatter: defaultFormatters.text },
      { key: 'employee', label: 'Employee', formatter: defaultFormatters.text },
      { key: 'washing', label: 'Washing', formatter: defaultFormatters.number },
      { key: 'ironing', label: 'Ironing', formatter: defaultFormatters.number },
      { key: 'delivery', label: 'Delivery', formatter: defaultFormatters.number },
      { key: 'reception', label: 'Reception', formatter: defaultFormatters.number },
    ],
    warehouse: [
      { key: 'date', label: 'Date', formatter: defaultFormatters.date },
      { key: 'pp', label: 'PP', formatter: defaultFormatters.text },
      { key: 'material', label: 'Material Name', formatter: defaultFormatters.text },
      { key: 'quantity', label: 'Quantity', formatter: defaultFormatters.number },
      { key: 'service', label: 'Service', formatter: defaultFormatters.text },
      { key: 'employee', label: 'Employee', formatter: defaultFormatters.text },
      { key: 'comment', label: 'Comment', formatter: defaultFormatters.text },
    ],
  };

  const columns = columnConfigs[tableType];
  const defaultFilename = filename || `${tableType}_report`;
  const sheetName =
    tableType === 'financial'
      ? 'Financial'
      : tableType === 'operational'
      ? 'Operational'
      : 'Warehouse';

  exportTableToExcel(data, columns, defaultFilename, sheetName);
};
