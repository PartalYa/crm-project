import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart as EBarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
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
]);

interface BarChartProps {
  data: { name: string; value: number }[];
  xField?: string;
  yField?: string;
  meta?: Record<string, { alias: string }>;
  style?: React.CSSProperties;
}

export default function BarChart({
  data,
  xField = 'name',
  yField = 'value',
  meta,
  style,
}: BarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current, undefined, { renderer: 'svg' });
    // Type-safe access for xField/yField
    const getX = (d: { name: string; value: number }) =>
      xField === 'name' ? d.name : d.value.toString();
    const getY = (d: { name: string; value: number }) =>
      yField === 'value' ? d.value : Number(d.name);
    const total = data.reduce((sum, d) => sum + getY(d), 0) || 1;
    chart.setOption({
      grid: { left: 80, right: 40, top: 40, bottom: 40 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        className: 'custom-echarts-tooltip',
        renderMode: 'html',
        formatter: (params: unknown) => {
          // ECharts tooltip param type is not exported, so we use unknown and cast
          const arr = Array.isArray(params) ? params : [params];
          const p = arr[0] as { name: string; value: number };
          const name = p.name;
          const value = p.value;
          const percent = ((value / total) * 100).toFixed(1);
          return `
            <div style="background:#000;border-radius:12px;padding:8px 16px;min-width:180px;display:flex;flex-direction:column;gap:10px;font-family:Roboto;">
              <div style="color:#fff;font-size:15px;">${
                meta?.[xField]?.alias || xField
              }: <span style='font-weight:600'>${name}</span></div>
              <div style="color:#fff;font-size:15px;">Orders: <span style='font-weight:600'>${value}</span></div>
              <div style="color:#fff;font-size:15px;">Share of Total: <span style='font-weight:600'>${percent}%</span></div>
            </div>
          `;
        },
        extraCssText: 'box-shadow: 0 4px 24px 0 #0000001a;font-family:Roboto;',
      },
      xAxis: {
        type: 'category',
        data: data.map(getX),
        axisLabel: { fontSize: 14, fontFamily: 'Roboto' },
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 14, fontFamily: 'Roboto' },
      },
      series: [
        {
          type: 'bar',
          data: data.map(getY),
          itemStyle: {
            color: '#83d780',
            borderRadius: [8, 8, 0, 0],
          },
          barWidth: 117,
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
  }, [data, xField, yField, meta]);
  return <div ref={chartRef} style={{ width: '100%', height: 674, ...style }} />;
}
