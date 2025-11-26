import { useState, useMemo } from 'react';
import DatePicker from '../../../components/DatePicker';
import Select from '../../../components/Select';
import SimpleTable, { SimpleTableColumn } from '../../../components/SimpleTable';

interface PointTableRow {
  point: string;
  incoming: number;
  inProgress: number;
  outgoing: number;
  delayed: number;
}

const mockBranchTableData: PointTableRow[] = [
  { point: 'Point #1', incoming: 245, inProgress: 32, outgoing: 198, delayed: 15 },
  { point: 'Point #2', incoming: 189, inProgress: 28, outgoing: 156, delayed: 5 },
  { point: 'Point #3', incoming: 167, inProgress: 19, outgoing: 142, delayed: 6 },
  { point: 'Point #4', incoming: 134, inProgress: 22, outgoing: 108, delayed: 4 },
  { point: 'Point #5', incoming: 98, inProgress: 15, outgoing: 79, delayed: 4 },
];

const branchTableColumns: SimpleTableColumn<PointTableRow>[] = [
  { key: 'point', label: 'Reception Point', width: 340 },
  { key: 'incoming', label: 'Incoming', width: 167, render: (value: number) => `${value}` },
  {
    key: 'inProgress',
    label: 'In Progress',
    width: 167,
    render: (value: number) => `${value}`,
  },
  { key: 'outgoing', label: 'Outgoing', width: 167, render: (value: number) => `${value}` },
  { key: 'delayed', label: 'Delayed', width: 167, render: (value: number) => `${value}` },
];

export default function OrderStatuses() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [datePeriod, setDatePeriod] = useState<[string, string] | string>();

  // Dynamic data based on filters
  const filteredBranchData = useMemo(() => {
    let data = [...mockBranchTableData];

    // Filter by selected type/point
    if (selectedType !== 'all') {
      const pointMap = {
        point1: 'Point #1',
        point2: 'Point #2',
        point3: 'Point #3',
        point4: 'Point #4',
        point5: 'Point #5',
      };
      const pointName = pointMap[selectedType as keyof typeof pointMap];
      if (pointName) {
        data = data.filter((item) => item.point === pointName);
      }
    }

    // Apply period multiplier
    const periodMultiplier = selectedPeriod === 'day' ? 1 : selectedPeriod === 'week' ? 7 : 30;

    return data.map((item) => ({
      ...item,
      incoming: Math.floor(item.incoming * periodMultiplier * (0.8 + Math.random() * 0.4)),
      inProgress: Math.floor(item.inProgress * periodMultiplier * (0.5 + Math.random() * 1.0)),
      outgoing: Math.floor(item.outgoing * periodMultiplier * (0.7 + Math.random() * 0.6)),
      delayed: Math.floor(item.delayed * periodMultiplier * (0.3 + Math.random() * 1.4)),
    }));
  }, [selectedType, selectedPeriod]);

  return (
    <div className="flex-1 flex flex-col gap-2 shrink-0">
      <div className="bg-white rounded-[10px] flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <Select
            placeholder="Type"
            options={[
              { label: 'All Points', value: 'all' },
              { label: 'Point #1', value: 'point1' },
              { label: 'Point #2', value: 'point2' },
              { label: 'Point #3', value: 'point3' },
              { label: 'Point #4', value: 'point4' },
              { label: 'Point #5', value: 'point5' },
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
        </div>{' '}
        <SimpleTable
          columns={branchTableColumns}
          data={filteredBranchData}
          rowHeight={50}
          noHeaderStyle
          height={300}
        />
      </div>
    </div>
  );
}
