
import React from 'react';
import Card from '../shared/Card.tsx';
import { PortfolioHolding } from '../../types.ts';
import { getCoinIcon } from '../shared/Icons.tsx';

interface PortfolioProps {
    holdings: PortfolioHolding[];
    balance: number;
    onGoToTrade: (symbol: string) => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ holdings, balance, onGoToTrade }) => {

    const TotalGL = ({ amount, percent }: { amount: number; percent: number }) => {
        const isPositive = amount >= 0;
        const colorClass = isPositive ? 'text-success' : 'text-danger';

        return (
            <div className="flex flex-col items-end">
                <span className={colorClass}>
                    {isPositive ? '+' : '-'}${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-xs ${colorClass}`}>
                    ({isPositive ? '+' : ''}{percent.toFixed(2)}%)
                </span>
            </div>
        );
    };

    return (
        <Card className="p-0">
            <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-1">Portfolio Holdings <span className="text-base font-normal text-muted">{holdings.length} stocks</span></h2>
                <p className="text-muted">Cash Balance: ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-t border-border-color bg-surface/50">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-muted w-16">ICON</th>
                            <th className="p-3 text-sm font-semibold text-muted">SYMBOL</th>
                            <th className="p-3 text-sm font-semibold text-muted">NAME</th>
                            <th className="p-3 text-sm font-semibold text-muted text-right">CURRENT PRICE</th>
                            <th className="p-3 text-sm font-semibold text-muted text-right">TODAY'S CHANGE (%)</th>
                            <th className="p-3 text-sm font-semibold text-muted text-right">AVG. COST</th>
                            <th className="p-3 text-sm font-semibold text-muted text-right">QTY</th>
                            <th className="p-3 text-sm font-semibold text-muted text-right">TOTAL VALUE</th>
                            <th className="p-3 text-sm font-semibold text-muted text-right">TOTAL G/L</th>
                            <th className="p-3 text-sm font-semibold text-muted text-center">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {holdings.map(holding => (
                            <tr key={holding.symbol} className="border-b border-border-color last:border-b-0 hover:bg-background/50">
                                <td className="p-3">{getCoinIcon(holding.symbol, 6)}</td>
                                <td className="p-3 font-mono text-white">{holding.symbol.split('-')[0]}</td>
                                <td className="p-3 text-white">{holding.name}</td>
                                <td className="p-3 text-white font-mono text-right">${holding.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                                <td className={`p-3 font-mono text-right ${holding.todaysChangePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {holding.todaysChangePercent >= 0 ? '+' : ''}{holding.todaysChangePercent.toFixed(2)}%
                                </td>
                                <td className="p-3 text-white font-mono text-right">${holding.avgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="p-3 text-white font-mono text-right">{holding.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                                <td className="p-3 text-white font-mono text-right">${holding.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="p-3 text-white font-mono text-right">
                                    <TotalGL amount={holding.totalGainLoss.amount} percent={holding.totalGainLoss.percent} />
                                </td>
                                <td className="p-3 text-center">
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={() => onGoToTrade(holding.symbol)}
                                            className="bg-primary text-background font-semibold text-xs py-1 px-3 rounded-md hover:bg-primary-focus transition-colors"
                                        >
                                            Buy
                                        </button>
                                        <button
                                            onClick={() => onGoToTrade(holding.symbol)}
                                            className="bg-orange-500 text-white font-semibold text-xs py-1 px-3 rounded-md hover:bg-orange-600 transition-colors"
                                        >
                                            Sell
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {holdings.length === 0 && (
                    <p className="text-center text-muted p-6">You do not have any holdings.</p>
                )}
            </div>
        </Card>
    );
};

export default Portfolio;
