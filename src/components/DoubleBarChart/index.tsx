import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart as EBarChart } from 'echarts/charts';
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

echarts.use([
  EBarChart,
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

export interface DoubleBarChartData {
  x: string;
  repeat: number;
  redo: number;
}

interface DoubleBarChartProps {
  data: DoubleBarChartData[];
  style?: React.CSSProperties;
}

export default function DoubleBarChart({ data, style }: DoubleBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current, undefined, { renderer: 'svg' });
    chart.setOption({
      grid: { left: 60, right: 40, top: 40, bottom: 40 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        className: 'custom-echarts-tooltip',
        renderMode: 'html',
        formatter: (params: any) => {
          const repeat = params.find((p: any) => p.seriesName === 'Repeat Clients');
          const redo = params.find((p: any) => p.seriesName === 'Redos');
          return `
            <div style="background:#000;border-radius:12px;padding:8px 16px;min-width:180px;display:flex;flex-direction:column;gap:10px;font-family:Roboto;">
              <div style="color:#fff;font-size:15px;">Branch: <span style='font-weight:600'>${params[0].name}</span></div>
              <div style="color:#fff;font-size:15px;">Repeat Clients: <span style='font-weight:600'>${repeat?.value}</span></div>
              <div style="color:#fff;font-size:15px;">Redos: <span style='font-weight:600'>${redo?.value}</span></div>
            </div>
          `;
        },
        extraCssText: 'box-shadow: 0 4px 24px 0 #0000001a;font-family:Roboto;',
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.x),
        axisLabel: { fontSize: 14, fontFamily: 'Roboto' },
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 14, fontFamily: 'Roboto' },
      },
      series: [
        {
          name: 'Repeat Clients',
          type: 'bar',
          data: data.map((d) => d.repeat),
          itemStyle: {
            color: '#1459a6',
            borderRadius: [8, 8, 0, 0],
          },
          barWidth: 40,
        },
        {
          name: 'Redos',
          type: 'bar',
          data: data.map((d) => d.redo),
          itemStyle: {
            color: '#83d780',
            borderRadius: [8, 8, 0, 0],
          },
          barWidth: 40,
        },
      ],
      animation: true,
    });
    const resize = () => chart.resize();
    window.addEventListener('resize', resize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', resize);
    };
  }, [data]);
  return <div ref={chartRef} style={{ width: '100%', height: 340, ...style }} />;
}
