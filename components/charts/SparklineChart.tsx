
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineChartProps {
  data: number[];
  color: string;
}

const SparklineChart: React.FC<SparklineChartProps> = ({ data, color }) => {
  const chartData = data.map((value, index) => ({ name: index, value }));
  const min = Math.min(...data);
  const max = Math.max(...data);

  return (
    <div style={{ width: '100px', height: '40px' }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <defs>
            <linearGradient id={`sparkline-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SparklineChart;
