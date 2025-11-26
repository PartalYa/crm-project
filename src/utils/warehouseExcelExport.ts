import * as XLSX from 'xlsx';

// This is a demo export function for presentation purposes
// Can be easily removed later by deleting this file and removing the button from WarehousePage

// Types for warehouse page data
interface RemainsTableRow {
  material: string;
  left: number;
  unit: string;
  minimum: number;
  status: 'pass' | 'warning' | 'danger';
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

interface ExportData {
  nomenclature: string;
  unit: string;
  materialWarehouse: {
    initialBalance: number;
    income: number;
    finalBalance: number;
  };
  householdGoods: {
    initialBalance: number;
    income: number;
    finalBalance: number;
  };
  total: {
    initialBalance: number;
    income: number;
    finalBalance: number;
  };
}

// Transform warehouse data into export format
const generateExportData = (
  remainsData: RemainsTableRow[],
  accountingData: AccountingTableRow[],
  lossesData: AccountingLossesTableRow[],
): ExportData[] => {
  // Create a map of materials from accounting data
  const materialIncomeMap = new Map<string, number>();
  accountingData.forEach((item) => {
    const existing = materialIncomeMap.get(item.material) || 0;
    materialIncomeMap.set(item.material, existing + item.quantity);
  });

  // Create a map of losses from losses data
  const materialLossesMap = new Map<string, number>();
  lossesData.forEach((item) => {
    const existing = materialLossesMap.get(item.material) || 0;
    materialLossesMap.set(item.material, existing + item.quantity);
  });

  // Get all unique materials
  const allMaterials = new Set<string>();
  remainsData.forEach((item) => allMaterials.add(item.material));
  accountingData.forEach((item) => allMaterials.add(item.material));
  lossesData.forEach((item) => allMaterials.add(item.material));

  return Array.from(allMaterials).map((material) => {
    const remainsItem = remainsData.find((item) => item.material === material);
    const income = materialIncomeMap.get(material) || 0;
    const losses = materialLossesMap.get(material) || 0;
    const finalBalance = remainsItem?.left || 0;
    const initialBalance = Math.max(0, finalBalance + losses - income);

    // Categorize materials (simple logic - can be enhanced)
    const isMaterial =
      material.toLowerCase().includes('chemistry') ||
      material.toLowerCase().includes('hangers') ||
      material.toLowerCase().includes('napkins');

    const materialWarehouse = isMaterial
      ? {
          initialBalance,
          income,
          finalBalance,
        }
      : {
          initialBalance: 0,
          income: 0,
          finalBalance: 0,
        };

    const householdGoods = !isMaterial
      ? {
          initialBalance,
          income,
          finalBalance,
        }
      : {
          initialBalance: 0,
          income: 0,
          finalBalance: 0,
        };

    return {
      nomenclature: material,
      unit: remainsItem?.unit || 'pcs',
      materialWarehouse,
      householdGoods,
      total: {
        initialBalance,
        income,
        finalBalance,
      },
    };
  });
};

export const exportWarehouseToExcel = (
  remainsData: RemainsTableRow[],
  accountingData: AccountingTableRow[],
  lossesData: AccountingLossesTableRow[],
) => {
  const data = generateExportData(remainsData, accountingData, lossesData);
  // Create worksheet data with structured headers
  const worksheetData = [
    // Main header row (categories)
    [
      'Nomenclature',
      'Unit',
      'Material Warehouse',
      '',
      '', // 3 columns for this category
      'Household Goods',
      '',
      '', // 3 columns for this category
      'Total',
      '',
      '', // 3 columns for this category
    ],
    [
      '',
      '',
      'Quantity',
      '',
      '', // 3 columns for Material Warehouse
      'Quantity',
      '',
      '', // 3 columns for Household Goods
      'Quantity',
      '',
      '', // 3 columns for Total
    ],
    // Sub-header row (specific columns)
    [
      '',
      '', // Empty cells under Nomenclature and Unit
      'initial balance',
      'income',
      'final balance',
      'initial balance',
      'income',
      'final balance',
      'initial balance',
      'income',
      'final balance',
    ],
    // Data rows
    ...data.map((item) => [
      item.nomenclature,
      item.unit,
      item.materialWarehouse.initialBalance,
      item.materialWarehouse.income,
      item.materialWarehouse.finalBalance,
      item.householdGoods.initialBalance,
      item.householdGoods.income,
      item.householdGoods.finalBalance,
      item.total.initialBalance,
      item.total.income,
      item.total.finalBalance,
    ]),
  ];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set up merges for the main header categories
  const merges = [
    // Merge "Nomenclature" across rows 1-3
    { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } },
    // Merge "Unit" across rows 1-3
    { s: { r: 0, c: 1 }, e: { r: 2, c: 1 } },
    // Merge "Material Warehouse" across columns 2-4
    { s: { r: 0, c: 2 }, e: { r: 0, c: 4 } }, // Merge "Household Goods" across columns 5-7
    { s: { r: 0, c: 5 }, e: { r: 0, c: 7 } },
    // Merge "Total" across columns 8-10
    { s: { r: 0, c: 8 }, e: { r: 0, c: 10 } },
    // Merge "Quantity" under Material Warehouse
    { s: { r: 1, c: 2 }, e: { r: 1, c: 4 } },
    // Merge "Quantity" under Household Goods
    { s: { r: 1, c: 5 }, e: { r: 1, c: 7 } },
    // Merge "Quantity" under Total
    { s: { r: 1, c: 8 }, e: { r: 1, c: 10 } },
  ];
  worksheet['!merges'] = merges;

  // Style the headers
  const headerStyle = {
    font: { bold: true },
    alignment: { horizontal: 'center', vertical: 'center' },
    fill: { fgColor: { rgb: 'E6E6FA' } },
  };

  const subHeaderStyle = {
    font: { bold: true },
    alignment: { horizontal: 'center', vertical: 'center' },
    fill: { fgColor: { rgb: 'F0F8FF' } },
  };

  // Apply styles to main headers (row 1)
  ['A1', 'B1', 'C1', 'F1', 'I1'].forEach((cell) => {
    if (!worksheet[cell]) worksheet[cell] = {};
    worksheet[cell].s = headerStyle;
  });

  // Apply styles to sub-headers (row 2)
  ['C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2', 'J2', 'K2'].forEach((cell) => {
    if (!worksheet[cell]) worksheet[cell] = {};
    worksheet[cell].s = subHeaderStyle;
  });

  // Set column widths
  const columnWidths = [
    { wch: 25 }, // Nomenclature
    { wch: 6 }, // Unit
    { wch: 15 }, // Material Warehouse - initial balance
    { wch: 12 }, // Material Warehouse - income
    { wch: 15 }, // Material Warehouse - final balance
    { wch: 15 }, // Household Goods - initial balance
    { wch: 12 }, // Household Goods - income
    { wch: 15 }, // Household Goods - final balance
    { wch: 15 }, // Total - initial balance
    { wch: 12 }, // Total - income
    { wch: 15 }, // Total - final balance
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Warehouse');
  // Generate filename to match popup display
  const filename = `warehouse_export_${new Date().toISOString().slice(0, 10)}.xls`;

  // Write and download file
  XLSX.writeFile(workbook, filename, { bookType: 'xls' });

  console.log(`Excel file exported: ${filename}`);
};
