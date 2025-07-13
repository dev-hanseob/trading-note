'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';

interface Props {
  data: { time: string; value: number }[];
}

interface ChartDataPoint {
  date: string;
  value: number;
  formattedDate: string;
  profit?: number;
  profitPercent?: number;
}

export default function SeedChartRecharts({ data }: Props) {
  // 데이터 가공
  const chartData: ChartDataPoint[] = data.map((item, index) => {
    const date = new Date(item.time);
    const baseValue = data[0]?.value || 0;
    const profit = item.value - baseValue;
    const profitPercent = baseValue > 0 ? ((profit / baseValue) * 100) : 0;
    
    return {
      date: item.time,
      value: item.value,
      formattedDate: `${date.getMonth() + 1}/${date.getDate()}`,
      profit,
      profitPercent
    };
  });

  const baseValue = data[0]?.value || 0;
  const currentValue = data[data.length - 1]?.value || 0;
  const isProfit = currentValue >= baseValue;

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.date);
      const dateStr = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
      
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-4 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {dateStr}
          </p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">시드: </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {data.value.toLocaleString()}원
              </span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">변화: </span>
              <span className={`font-semibold ${data.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {data.profit >= 0 ? '+' : ''}{data.profit.toLocaleString()}원
              </span>
              <span className={`ml-1 text-xs ${data.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                ({data.profit >= 0 ? '+' : ''}{data.profitPercent.toFixed(2)}%)
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // X축 포맷터
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Y축 포맷터
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <div className="w-full h-72 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          {/* 그라데이션 정의 */}
          <defs>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          {/* 격자 */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            className="dark:stroke-gray-600"
            vertical={false}
          />
          
          {/* X축 */}
          <XAxis 
            dataKey="date"
            tickFormatter={formatXAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            interval="preserveStartEnd"
          />
          
          {/* Y축 */}
          <YAxis 
            tickFormatter={formatYAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            width={60}
          />
          
          {/* 툴팁 */}
          <Tooltip content={<CustomTooltip />} />
          
          {/* 시작 시드 기준선 */}
          <ReferenceLine 
            y={baseValue} 
            stroke="#9ca3af" 
            strokeDasharray="5 5"
            label={{ value: "시작 시드", position: "insideTopRight", fontSize: 11, fill: '#6b7280' }}
          />
          
          {/* 메인 영역 차트 */}
          <Area
            type="monotone"
            dataKey="value"
            stroke={isProfit ? "#10b981" : currentValue === baseValue ? "#10b981" : "#ef4444"}
            strokeWidth={3}
            fill={`url(#color${isProfit ? 'Profit' : currentValue === baseValue ? 'Neutral' : 'Loss'})`}
            dot={false}
            activeDot={{ 
              r: 6, 
              stroke: isProfit ? "#10b981" : "#ef4444",
              strokeWidth: 2,
              fill: "#ffffff"
            }}
            animationDuration={2000}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* 범례 */}
      <div className="flex justify-center mt-4 space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
          <span className="text-gray-600 dark:text-gray-400">시작 시드</span>
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isProfit ? 'bg-emerald-500' : currentValue === baseValue ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          <span className="text-gray-600 dark:text-gray-400">현재 시드</span>
        </div>
      </div>
    </div>
  );
}
