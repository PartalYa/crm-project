import ArrowDown from '@assets/arrow-down-long.svg?react';
import Select from '../../../components/Select';
import { useState, useMemo } from 'react';
import DatePicker from '../../../components/DatePicker';
import * as echarts from 'echarts/core';
import BarChart from '../../../components/BarChart';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import { UniversalTransition, LabelLayout } from 'echarts/features';
import SimpleTable, { SimpleTableColumn } from '../../../components/SimpleTable';
import { faker } from '@faker-js/faker';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  SVGRenderer,
  UniversalTransition,
  LabelLayout,
]);

const mockPickupData = [
  {
    name: 'Point 1',
    value: 180,
  },
  {
    name: 'Point 2',
    value: 60,
  },
  {
    name: 'Point 3',
    value: 120,
  },
  {
    name: 'Point 4',
    value: 220,
  },
  {
    name: 'Point 5',
    value: 200,
  },
  {
    name: 'Point 6',
    value: 70,
  },
];

const mockReceiverData = [
  {
    name: 'Mary',
    value: 280,
  },
  {
    name: 'Jane',
    value: 30,
  },
  {
    name: 'Carol',
    value: 160,
  },
  {
    name: 'Alice',
    value: 120,
  },
  {
    name: 'Andrew',
    value: 220,
  },
  {
    name: 'John',
    value: 50,
  },
];

const mockServicesData = [
  {
    name: 'Dry Cleaning',
    value: 180,
  },
  {
    name: 'Laundry',
    value: 270,
  },
  {
    name: 'Repair',
    value: 120,
  },
  {
    name: 'Zipper Replacement',
    value: 400,
  },
  {
    name: 'Clothing Ironing',
    value: 200,
  },
  {
    name: 'Express Service',
    value: 70,
  },
];

type ChartRow = { name: string; value: number };

type ClientTableRow = {
  client: string;
  itemCount: number;
  orderCount: number;
  revenue: number;
};

const mockClientTableData: ClientTableRow[] = [
  {
    client: faker.person.fullName(),
    itemCount: 2,
    orderCount: 12,
    revenue: 1200,
  },
  {
    client: faker.person.fullName(),
    itemCount: 5,
    orderCount: 8,
    revenue: 950,
  },
  {
    client: faker.person.fullName(),
    itemCount: 3,
    orderCount: 5,
    revenue: 600,
  },
  {
    client: faker.person.fullName(),
    itemCount: 1,
    orderCount: 3,
    revenue: 300,
  },
  {
    client: faker.person.fullName(),
    itemCount: 2,
    orderCount: 12,
    revenue: 1200,
  },
  {
    client: faker.person.fullName(),
    itemCount: 5,
    orderCount: 8,
    revenue: 950,
  },
  {
    client: faker.person.fullName(),
    itemCount: 3,
    orderCount: 5,
    revenue: 600,
  },
  {
    client: faker.person.fullName(),
    itemCount: 1,
    orderCount: 3,
    revenue: 300,
  },
];

const clientTableColumns: SimpleTableColumn<ClientTableRow>[] = [
  { key: 'client', label: 'Client', width: 320 },
  { key: 'itemCount', label: 'Number of Items', width: 160 },
  { key: 'orderCount', label: 'Number of Orders', width: 180 },
  { key: 'revenue', label: 'Revenue', width: 160, render: (value: number) => `${value} USD` },
];

export default function GeneralReport() {
  const [selectedType, setSelectedType] = useState('pickup');
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [datePeriod, setDatePeriod] = useState<string | [string, string]>();
  const [selectedWarehouse, setSelectedWarehouse] = useState('warehouse1');
  const chartData: {
    data: ChartRow[];
    xField: keyof ChartRow;
    yField: keyof ChartRow;
    meta: Record<string, { alias: string }>;
  } = useMemo(() => {
    const baseData: {
      data: ChartRow[];
      xField: keyof ChartRow;
      yField: keyof ChartRow;
      meta: Record<string, { alias: string }>;
    } = {
      data: [],
      xField: 'name',
      yField: 'value',
      meta: {
        name: { alias: 'Name' },
        value: { alias: 'Orders' },
      },
    };

    // Apply period multiplier
    const periodMultiplier = selectedPeriod === 'day' ? 1 : selectedPeriod === 'week' ? 7 : 30;

    switch (selectedType) {
      case 'pickup':
        baseData.data = mockPickupData.map((item) => ({
          ...item,
          value: Math.floor(item.value * periodMultiplier * (0.8 + Math.random() * 0.4)),
        }));
        baseData.meta = {
          name: { alias: 'Pickup Point' },
          value: { alias: 'Orders' },
        };
        break;
      case 'receiver':
        baseData.data = mockReceiverData.map((item) => ({
          ...item,
          value: Math.floor(item.value * periodMultiplier * (0.7 + Math.random() * 0.6)),
        }));
        baseData.meta = {
          name: { alias: 'Receiver' },
          value: { alias: 'Orders' },
        };
        break;
      case 'services':
        baseData.data = mockServicesData.map((item) => ({
          ...item,
          value: Math.floor(item.value * periodMultiplier * (0.9 + Math.random() * 0.2)),
        }));
        baseData.meta = {
          name: { alias: 'Service Name' },
          value: { alias: 'Orders' },
        };
        break;
      default:
        baseData.data = mockPickupData.map((item) => ({
          ...item,
          value: Math.floor(item.value * periodMultiplier),
        }));
    }

    return baseData;
  }, [selectedType, selectedPeriod]);

  // Dynamic stats based on selections
  const totalOrders = useMemo(() => {
    const baseOrders = 20300;
    const periodMultiplier = selectedPeriod === 'day' ? 1 : selectedPeriod === 'week' ? 7 : 30;
    return Math.floor(baseOrders * periodMultiplier * (0.8 + Math.random() * 0.4));
  }, [selectedPeriod]);

  const leadingPoint = useMemo(() => {
    const points = ['Point #1', 'Point #2', 'Point #3', 'Point #4'];
    const index = selectedPeriod === 'day' ? 0 : selectedPeriod === 'week' ? 1 : 2;
    return points[index];
  }, [selectedPeriod]);

  const topService = useMemo(() => {
    const services = ['Ironing', 'Dry Cleaning', 'Laundry', 'Repair'];
    const index = selectedPeriod === 'day' ? 0 : selectedPeriod === 'week' ? 1 : 2;
    return services[index];
  }, [selectedPeriod]);

  // Dynamic client table data based on warehouse selection
  const filteredClientData = useMemo(() => {
    if (selectedWarehouse === 'point1') {
      return mockClientTableData.map((client) => ({
        ...client,
        revenue: Math.floor(client.revenue * 1.2),
        orderCount: Math.floor(client.orderCount * 1.1),
      }));
    } else if (selectedWarehouse === 'point2') {
      return mockClientTableData.map((client) => ({
        ...client,
        revenue: Math.floor(client.revenue * 0.9),
        orderCount: Math.floor(client.orderCount * 0.8),
      }));
    } else if (selectedWarehouse === 'point3') {
      return mockClientTableData.map((client) => ({
        ...client,
        revenue: Math.floor(client.revenue * 1.1),
        orderCount: Math.floor(client.orderCount * 1.2),
      }));
    }
    return mockClientTableData;
  }, [selectedWarehouse]);

  return (
    <div className="flex-1 flex flex-col gap-2 shrink-0">
      {' '}
      <div className="flex items-center gap-2 w-full">
        <div className="bg-white rounded-[10px] flex flex-col flex-1 gap-2 px-6 py-4 h-[87px]">
          <span className="font-medium text-base leading-[17px]">Total Orders</span>
          <span className="text-md font-bold leading-[21px]">{totalOrders.toLocaleString()}</span>
        </div>
        <div className="bg-white rounded-[10px] flex flex-col flex-1 gap-2 px-6 py-4 h-[87px]">
          <span className="font-medium text-base leading-[17px]">Leading Point</span>
          <span className="text-md font-bold leading-[21px]">{leadingPoint}</span>
        </div>
        <div className="bg-white rounded-[10px] flex flex-col flex-1 gap-2 px-6 py-4 h-[87px]">
          <span className="font-medium text-base leading-[17px]">Top Service</span>
          <span className="text-md font-bold leading-[21px]">{topService}</span>
        </div>
        <div className="bg-white rounded-[10px] flex flex-col flex-1 gap-2 px-6 py-4 h-[87px]">
          <span className="font-medium text-base leading-[17px]">Progress</span>
          <div className="h-[30px] px-1 rounded-[6px] bg-red-tag flex items-center gap-1 w-fit">
            <ArrowDown className="w-4 h-4" />
            <span className="text-md leading-[30px] font-bold">5,3 %</span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-[10px] flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <Select
            placeholder="Type"
            options={[
              { label: 'Pickup Point', value: 'pickup' },
              { label: 'Receiver', value: 'receiver' },
              { label: 'Services', value: 'services' },
            ]}
            value={selectedType}
            onChange={(value) => setSelectedType(value)}
            wrapperClassName="w-[255px]"
          />
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-lg border border-gray gap-1 text-base h-10">
              <button
                name="day"
                className={`font-secondary uppercase leading-[16px] text-black font-semibold tracking-widest py-2 px-4 transition-[.2s] rounded-[6px] ${
                  selectedPeriod === 'day'
                    ? 'bg-black text-white'
                    : 'bg-transparent hover:bg-green-accent'
                }`}
                onClick={() => setSelectedPeriod('day')}
              >
                1 Day
              </button>
              <button
                name="week"
                className={`font-secondary uppercase leading-[16px] text-black font-semibold tracking-widest py-2 px-4 transition-[.2s] rounded-[6px] ${
                  selectedPeriod === 'week'
                    ? 'bg-black text-white'
                    : 'bg-transparent hover:bg-green-accent'
                }`}
                onClick={() => setSelectedPeriod('week')}
              >
                1 Week
              </button>
              <button
                name="month"
                className={`font-secondary uppercase leading-[16px] text-black font-semibold tracking-widest py-2 px-4 transition-[.2s] rounded-[6px] ${
                  selectedPeriod === 'month'
                    ? 'bg-black text-white'
                    : 'bg-transparent hover:bg-green-accent'
                }`}
                onClick={() => setSelectedPeriod('month')}
              >
                1 Month
              </button>
            </div>
            <DatePicker
              variant="icon"
              value={datePeriod}
              isRange
              onChange={(date) => setDatePeriod(date)}
            />
          </div>
        </div>
        <BarChart
          data={chartData.data}
          xField={chartData.xField}
          yField={chartData.yField}
          meta={chartData.meta}
          style={{ height: '674px' }}
        />
      </div>
      <div className="bg-white rounded-[10px] flex flex-col gap-4 p-6">
        <Select
          placeholder="Pickup Point"
          options={[
            { label: 'Point #1', value: 'point1' },
            { label: 'Point #2', value: 'point2' },
            { label: 'Point #3', value: 'point3' },
          ]}
          wrapperClassName="w-[255px]"
          value={selectedWarehouse}
          onChange={(value) => setSelectedWarehouse(value)}
        />
        <SimpleTable
          columns={clientTableColumns}
          data={filteredClientData}
          rowHeight={50}
          noHeaderStyle
          height={300}
        />
      </div>
    </div>
  );
}
