import { useState, useMemo } from 'react';
import DatePicker from '../../../components/DatePicker';
import Select from '../../../components/Select';
import SimpleTable, { SimpleTableColumn } from '../../../components/SimpleTable';
import InfoIcon from '@assets/info.svg?react';
import LineChart from '../../../components/LineChart';

interface BranchTableRow {
  branch: string;
  incoming: number;
  outgoing: number;
  revenue: number;
  avgReceipt: number;
  qnty: number;
}

const branchTableColumns: SimpleTableColumn<BranchTableRow>[] = [
  { key: 'branch', label: 'Branch', width: 344 },
  { key: 'incoming', label: 'Received', width: 133 },
  {
    key: 'outgoing',
    label: 'Written Off',
    width: 133,
    render: (value: number) => (
      <div className="flex items-center justify-between w-full h-full">
        {`${value}`}
        <InfoIcon className="w-4 h-4" title="More about write-offs" />
      </div>
    ),
  },
  { key: 'revenue', label: 'Revenue', width: 133, render: (value: number) => `${value}` },
  {
    key: 'avgReceipt',
    label: 'Average Receipt',
    width: 133,
    render: (value: number) => `${value}`,
  },
  { key: 'qnty', label: 'Number of Orders', width: 157 },
];

const mockBranchTableData: BranchTableRow[] = [
  {
    branch: 'Branch #1',
    incoming: 120,
    outgoing: 30,
    revenue: 15000,
    avgReceipt: 125,
    qnty: 100,
  },
  {
    branch: 'Branch #2',
    incoming: 200,
    outgoing: 50,
    revenue: 30000,
    avgReceipt: 150,
    qnty: 200,
  },
  {
    branch: 'Branch #3',
    incoming: 180,
    outgoing: 40,
    revenue: 25000,
    avgReceipt: 140,
    qnty: 180,
  },
];

// Mock 28.04.25 to 31.05.25
function generateDateList(startIso = '2025-04-28', endIso = '2025-05-31'): string[] {
  const list: string[] = [];
  const cur = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  while (cur <= end) {
    const dd = String(cur.getDate()).padStart(2, '0');
    const mm = String(cur.getMonth() + 1).padStart(2, '0');
    const yy = String(cur.getFullYear()).slice(-2);
    list.push(`${dd}.${mm}.${yy}`);
    cur.setDate(cur.getDate() + 1);
  }
  return list;
}

const dateList = generateDateList();

const branchColors = ['#542098', '#83d780', '#1459a6'];

const allBranchSeries = [
  {
    branch: 'branch1',
    color: branchColors[0],
    data: dateList.map((date, i) => ({
      date,
      incoming: 1000 + i * 20 + (i % 5 === 0 ? 200 : 0),
      outgoing: 400 + i * 10 + (i % 7 === 0 ? 100 : 0),
      revenue: 3000 + i * 30 + (i % 3 === 0 ? 150 : 0),
    })),
  },
  {
    branch: 'branch2',
    color: branchColors[1],
    data: dateList.map((date, i) => ({
      date,
      incoming: 900 + i * 18 + (i % 4 === 0 ? 120 : 0),
      outgoing: 350 + i * 12 + (i % 6 === 0 ? 80 : 0),
      revenue: 2800 + i * 25 + (i % 2 === 0 ? 100 : 0),
    })),
  },
  {
    branch: 'branch3',
    color: branchColors[2],
    data: dateList.map((date, i) => ({
      date,
      incoming: 800 + i * 15 + (i % 3 === 0 ? 90 : 0),
      outgoing: 300 + i * 8 + (i % 5 === 0 ? 60 : 0),
      revenue: 2500 + i * 20 + (i % 4 === 0 ? 80 : 0),
    })),
  },
];

export default function FinancialAnalysis() {
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [datePeriod, setDatePeriod] = useState<string | [string, string]>();
  const [showAllBranches, setShowAllBranches] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('branch1');
  // Dynamic table data based on period
  const branchTableData = useMemo(() => {
    const periodMultiplier = selectedPeriod === 'day' ? 1 : selectedPeriod === 'week' ? 7 : 30;

    return mockBranchTableData.map((branch) => ({
      ...branch,
      incoming: Math.floor(branch.incoming * periodMultiplier * (0.8 + Math.random() * 0.4)),
      outgoing: Math.floor(branch.outgoing * periodMultiplier * (0.7 + Math.random() * 0.6)),
      revenue: Math.floor(branch.revenue * periodMultiplier * (0.9 + Math.random() * 0.2)),
      avgReceipt: Math.floor(branch.avgReceipt * (0.9 + Math.random() * 0.2)),
      qnty: Math.floor(branch.qnty * periodMultiplier * (0.8 + Math.random() * 0.4)),
    }));
  }, [selectedPeriod]);

  // Dynamic chart data based on period and date selection
  const dynamicBranchSeries = useMemo(() => {
    const periodMultiplier = selectedPeriod === 'day' ? 0.3 : selectedPeriod === 'week' ? 0.7 : 1;
    const dateMultiplier = datePeriod ? 1.2 : 1; // Boost values when custom date is selected

    return allBranchSeries.map((series) => ({
      ...series,
      data: series.data.map((point) => ({
        ...point,
        incoming: Math.floor(
          point.incoming * periodMultiplier * dateMultiplier * (0.8 + Math.random() * 0.1),
        ),
        outgoing: Math.floor(
          point.outgoing * periodMultiplier * dateMultiplier * (0.7 + Math.random() * 0.3),
        ),
        revenue: Math.floor(
          point.revenue * periodMultiplier * dateMultiplier * (0.9 + Math.random() * 0.2),
        ),
      })),
    }));
  }, [selectedPeriod, datePeriod]);

  return (
    <div className="flex-1 flex flex-col gap-2 shrink-0">
      <div className="bg-white rounded-[10px] flex flex-col gap-4 p-6">
        {' '}
        <SimpleTable
          columns={branchTableColumns}
          data={branchTableData}
          rowHeight={50}
          noHeaderStyle
          height={300}
        />
      </div>
      <div className="bg-white rounded-[10px] flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <Select
            placeholder="Branch"
            options={[
              { label: 'All Branches', value: 'all' },
              { label: 'Branch #1', value: 'branch1' },
              { label: 'Branch #2', value: 'branch2' },
              { label: 'Branch #3', value: 'branch3' },
            ]}
            value={showAllBranches ? 'all' : selectedBranch}
            onChange={(value) => {
              if (value === 'all') setShowAllBranches(true);
              else {
                setShowAllBranches(false);
                setSelectedBranch(value);
              }
            }}
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
        <LineChart
          series={
            showAllBranches
              ? dynamicBranchSeries
              : dynamicBranchSeries.filter((s) => s.branch === selectedBranch)
          }
          showLegend={false}
          style={{ height: 674 }}
        />
      </div>
    </div>
  );
}
