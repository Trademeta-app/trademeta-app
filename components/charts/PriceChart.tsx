import React from 'react';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PriceDataPoint } from '../../types.ts';

interface PriceChartProps {
  data: PriceDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border border-border-color p-3 rounded-lg shadow-xl">
                <p className="label text-sm text-muted">{`Date : ${label}`}</p>
                <p className="intro text-base font-bold text-primary">{`Price : $${payload[0].value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</p>
                 <p className="intro text-sm text-muted">{`Volume : ${Number(payload[1].value).toLocaleString()}`}</p>
            </div>
        );
    }
    return null;
};

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  return (
    <div className="h-96 w-full">
      <ResponsiveContainer>
        <ComposedChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#58A6FF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#58A6FF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#8B949E' }} 
            axisLine={{ stroke: '#30363D' }} 
            tickLine={{ stroke: '#30363D' }}
            tickFormatter={(str) => {
                const date = new Date(str);
                return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
            }}
          />
          <YAxis 
            yAxisId="left"
            orientation="left"
            tick={{ fill: '#8B949E' }} 
            axisLine={{ stroke: '#30363D' }} 
            tickLine={{ stroke: '#30363D' }} 
            tickFormatter={(value) => `$${(Number(value)/1000).toFixed(0)}k`}
            domain={['dataMin - 1000', 'dataMax + 1000']}
          />
           <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#8B949E' }}
            axisLine={{ stroke: '#30363D' }}
            tickLine={{ stroke: '#30363D' }}
            tickFormatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area yAxisId="left" type="monotone" dataKey="price" stroke="#58A6FF" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
          <Bar yAxisId="right" dataKey="volume" fill="#30363D" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;