import { useState, useMemo } from 'react';
import DatePicker from '../../../components/DatePicker';
import DoubleBarChart, { DoubleBarChartData } from '../../../components/DoubleBarChart';

const doubleBarData: DoubleBarChartData[] = [
  { x: 'Branch #1', repeat: 38, redo: 6 },
  { x: 'Branch #2', repeat: 42, redo: 7 },
  { x: 'Branch #3', repeat: 31, redo: 4 },
  { x: 'Branch #4', repeat: 29, redo: 5 },
  { x: 'Branch #5', repeat: 45, redo: 8 },
  { x: 'Branch #6', repeat: 33, redo: 6 },
];

export default function RepeatClients() {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [datePeriod, setDatePeriod] = useState<[string, string] | string>();

  // Dynamic stats based on period
  const repeatClientsStats = useMemo(() => {
    const periodMultiplier = selectedPeriod === 'day' ? 1 : selectedPeriod === 'week' ? 7 : 30;

    return {
      count: Math.floor(218 * periodMultiplier * (0.8 + Math.random() * 0.4)),
      percentage: selectedPeriod === 'day' ? 21 : selectedPeriod === 'week' ? 18 : 24,
      redoCount: Math.floor(36 * periodMultiplier * (0.5 + Math.random() * 1.0)),
      redoPercentage: selectedPeriod === 'day' ? 1.8 : selectedPeriod === 'week' ? 2.1 : 1.5,
    };
  }, [selectedPeriod]);

  // Dynamic chart data based on period
  const chartData = useMemo(() => {
    const periodMultiplier = selectedPeriod === 'day' ? 1 : selectedPeriod === 'week' ? 7 : 30;

    return doubleBarData.map((item) => ({
      ...item,
      repeat: Math.floor(item.repeat * periodMultiplier * (0.7 + Math.random() * 0.6)),
      redo: Math.floor(item.redo * periodMultiplier * (0.5 + Math.random() * 1.0)),
    }));
  }, [selectedPeriod]);

  return (
    <div className="flex-1 flex flex-col gap-2 shrink-0">
      {' '}
      <div className="flex items-center gap-2 w-full">
        <div className="bg-white rounded-[10px] flex flex-col gap-2 px-6 py-4 h-[87px] w-[237px]">
          <span className="font-medium text-base leading-[17px]">Repeat Clients</span>
          <div className="flex items-center gap-2">
            <span className="text-md font-bold leading-[21px]">{repeatClientsStats.count}</span>
            <div className="h-[30px] px-1 rounded-[6px] bg-green-tag flex items-center gap-1 w-fit">
              <span className="text-md leading-[30px] font-bold">
                {repeatClientsStats.percentage}%
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[10px] flex flex-col gap-2 px-6 py-4 h-[87px] w-[237px]">
          <span className="font-medium text-base leading-[17px]">Redos</span>
          <div className="flex items-center gap-2">
            <span className="text-md font-bold leading-[21px]">{repeatClientsStats.redoCount}</span>
            <div className="h-[30px] px-1 rounded-[6px] bg-green-tag flex items-center gap-1 w-fit">
              <span className="text-md leading-[30px] font-bold">
                {repeatClientsStats.redoPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-[10px] flex flex-col gap-6 p-6">
        <div className="flex items-center justify-end">
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
        <DoubleBarChart data={chartData} style={{ height: 682 }} />
      </div>
    </div>
  );
}
