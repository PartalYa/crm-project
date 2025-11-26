import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { LineChart as ELineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import { UniversalTransition, LabelLayout } from 'echarts/features';

// Register required ECharts components
// (do this only once in your app, but safe to repeat)
echarts.use([
  ELineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  SVGRenderer,
  UniversalTransition,
  LabelLayout,
  LegendComponent,
]);

export interface BranchLineChartSeries {
  branch: string;
  color?: string;
  data: Array<{
    date: string; // 'YYYY-MM-DD' or 'DD.MM.YY'
    incoming: number;
    outgoing: number;
    revenue: number;
  }>;
}

interface LineChartProps {
  series: BranchLineChartSeries[];
  style?: React.CSSProperties;
  showLegend?: boolean;
}

export default function LineChart({ series, style, showLegend = true }: LineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current, undefined, { renderer: 'svg' });
    // Collect all dates for x axis
    const allDates = Array.from(new Set(series.flatMap((s) => s.data.map((d) => d.date)))).sort();
    // Build series for ECharts
    const chartSeries = series.map((s) => ({
      name: s.branch,
      type: 'line',
      showSymbol: true,
      symbol: 'circle',
      symbolSize: 8,
      smooth: false,
      lineStyle: { width: 2, color: s.color },
      itemStyle: { color: s.color },
      data: allDates.map((date) => {
        const found = s.data.find((d) => d.date === date);
        return found ? found.incoming - found.outgoing : null;
      }),
    }));
    chart.setOption({
      grid: { left: 80, right: 40, top: 40, bottom: 40 },
      legend: showLegend
        ? {
            data: series.map((s) => s.branch),
            top: 0,
            icon: 'circle',
            itemWidth: 12,
            itemHeight: 12,
            textStyle: { fontSize: 15, fontFamily: 'Roboto' },
          }
        : undefined,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        className: 'custom-echarts-tooltip',
        renderMode: 'html',
        formatter: (params: any) => {
          // params: { seriesName, data, dataIndex, ... }
          const branch = params.seriesName;
          const idx = params.dataIndex;
          const s = series.find((s) => s.branch === branch);
          const d = s?.data[idx];
          if (!d) return '';
          return `
            <div style="background:#000;border-radius:12px;padding:8px 16px;min-width:180px;display:flex;flex-direction:column;gap:10px;font-family:Roboto;">
              <div style="color:#fff;font-size:15px;">Branch: <span style='font-weight:600'>${branch}</span></div>
              <div style="color:#fff;font-size:15px;">Date: <span style='font-weight:600'>${
                d.date
              }</span></div>
              <div style="color:#fff;font-size:15px;">Incoming: <span style='font-weight:600'>${d.incoming.toLocaleString()}</span></div>
              <div style="color:#fff;font-size:15px;">Outgoing: <span style='font-weight:600'>${d.outgoing.toLocaleString()}</span></div>
              <div style="color:#fff;font-size:15px;">Revenue: <span style='font-weight:600'>${d.revenue.toLocaleString()}</span></div>
            </div>
          `;
        },
        extraCssText: 'box-shadow: 0 4px 24px 0 #0000001a;font-family:Roboto;',
      },
      xAxis: {
        type: 'category',
        data: allDates,
        axisLabel: { fontSize: 14, fontFamily: 'Roboto' },
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 14, fontFamily: 'Roboto' },
        nameGap: 40,
        nameTextStyle: { fontSize: 15, fontWeight: 500, fontFamily: 'Roboto' },
      },
      series: chartSeries,
      animation: true,
    });
    const resize = () => chart.resize();
    window.addEventListener('resize', resize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', resize);
    };
  }, [series, showLegend]);
  return <div ref={chartRef} style={{ width: '100%', height: 400, ...style }} />;
}
