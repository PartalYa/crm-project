import { faker } from '@faker-js/faker';
import { cityOptions, discountTypes } from './mockDropDowns';

export interface ClientData {
  id: string;
  code: string;
  name: string;
  cardNumber: string;
  debt: number;
  dsDiscount?: number;
  discount: string;
  address: string;
  factualAddress: string;
  phone: string;
  dateOfBirth?: string;
  age?: number;
  dateOfRegistration?: string;
  status?: 'active' | 'inactive' | 'suspended';
  isVip?: boolean; // VIP status
  city?: string; // Optional city field
  email?: string; // Optional email field
}

export function generateMockClient(index?: number): ClientData {
  const dateOfBirth = faker.date.birthdate({ min: 18, max: 80, mode: 'age' });
  const age = dateOfBirth ? new Date().getFullYear() - dateOfBirth.getFullYear() : undefined;
  const dateOfRegistration = faker.date.past({ years: 5 }); // Registration within the last 5 years

  return {
    id: faker.string.uuid(),
    code: faker.string.numeric(5) + '-' + faker.string.numeric(2),
    name: faker.person.fullName(),
    cardNumber: index === 0 ? '493769205' : faker.string.numeric(9),
    discount: faker.helpers.arrayElement(discountTypes).value,
    dsDiscount: faker.datatype.boolean() ? faker.number.int({ min: 0, max: 50 }) : 0,
    debt: faker.number.int({ min: 0, max: 1000 }),
    address: `${faker.location.street()}, ${faker.number.int({
      min: 1,
      max: 200,
    })}`,
    factualAddress: `${faker.location.street()} ${faker.number.int({
      min: 1,
      max: 200,
    })}`,
    phone: faker.phone.number({
      style: 'international',
    }),
    dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : undefined,
    age: age,
    dateOfRegistration: dateOfRegistration
      ? dateOfRegistration.toISOString().split('T')[0]
      : undefined,
    status: faker.helpers.arrayElement(['active', 'inactive', 'suspended']),
    isVip: faker.datatype.boolean(),
    city: faker.helpers.arrayElement(cityOptions).value, // Optional city field
    email: faker.internet.email(), // Optional email field
  };
}

export function generateMockClients(count: number): ClientData[] {
  return Array.from({ length: count }, (_, index) => generateMockClient(index));
}

export const mockClients = generateMockClients(10000);
