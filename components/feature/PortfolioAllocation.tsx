
import React from 'react';
import Card from '../shared/Card.tsx';
import DonutChart from '../charts/DonutChart.tsx';
import { Holding } from '../../types.ts';

interface PortfolioAllocationProps {
  holdings: Holding[];
  balance: number;
}

const COLORS = ['#58A6FF', '#1F6FEB', '#3FB950', '#FBBF24', '#F85149', '#8B949E', '#E6007A', '#F3BA2F'];

const PortfolioAllocation: React.FC<PortfolioAllocationProps> = ({ holdings, balance }) => {
  const chartData = [
    ...holdings.map(h => ({ name: h.symbol.split('-')[0], value: h.valueUsd })),
    { name: 'Cash', value: balance }
  ].filter(item => item.value > 0.01); // Filter out dust values

  const Legend = () => (
    <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mt-4">
      {chartData.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2 text-sm text-muted">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
          <span>{entry.name}</span>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <h3 className="text-xl font-bold text-white mb-4">Portfolio Allocation</h3>
      {chartData.length > 0 ? (
        <>
          <DonutChart data={chartData} />
          <Legend />
        </>
      ) : (
        <div className="h-[350px] flex items-center justify-center text-muted">
            Your portfolio is empty.
        </div>
      )}
    </Card>
  );
};

export default PortfolioAllocation;
