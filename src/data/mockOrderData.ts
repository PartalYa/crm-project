import { faker } from '@faker-js/faker';
import { warehouses } from './mockDropDowns';

export interface OrderData {
  id: string;
  orderNumber: string;
  receiver: string;
  status: 1 | 2 | 3;
  warehouse: string;
  company: string;
  client: string;
  createdDate: Date;
  updatedDate: Date;
  amount: number;
  priceList: string;
  items: number;
  weight: number;
  isOutbound: boolean;
  hasPhotos: boolean;
  tag: string;
  notes?: string;
}

const typeOptions = ['reception', 'delivery', 'pickup', 'return'] as const;

export function generateMockOrder(index?: number): OrderData {
  const createdDate = faker.date.between({
    from: '2024-01-01',
    to: new Date(),
  });

  const updatedDate = faker.date.between({
    from: createdDate,
    to: new Date(),
  });
  if (index === 0) {
    console.log('creating at index 0');
  }
  return {
    id: faker.string.uuid(),
    orderNumber: `${faker.number.int({ min: 10000, max: 99999 })}-${faker.number.int({
      min: 10,
      max: 99,
    })}`,
    tag: index === 0 ? '00053857195' : faker.string.numeric(11),
    receiver: faker.person.fullName(),
    status: faker.helpers.arrayElement([1, 2, 3]), // 1: pending, 2: processing, 3: completed
    company: `${faker.company.name()}`,
    warehouse: faker.helpers.arrayElement(warehouses).label,
    client: faker.person.fullName(),
    createdDate,
    updatedDate,
    amount: faker.number.float({ min: 100, max: 50000, fractionDigits: 2 }),
    priceList: faker.helpers.arrayElement(['Retail', 'Wholesale', 'VIP']),
    items: faker.number.int({ min: 1, max: 20 }),
    weight: faker.number.float({ min: 0.1, max: 100, fractionDigits: 2 }),
    isOutbound: faker.datatype.boolean(),
    hasPhotos: faker.datatype.boolean(),
    notes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
  };
}

export function generateMockOrders(count: number): OrderData[] {
  return Array.from({ length: count }, (_, i) => generateMockOrder(i));
}

// Pre-generate large dataset for testing
export const mockOrders = generateMockOrders(10000);
