
import React from 'react';
import Card from '../shared/Card.tsx';
import { DepositIcon } from '../shared/Icons.tsx';
import { Holding } from '../../types.ts';

interface PortfolioSummaryProps {
    onDepositClick: () => void;
    balance: number;
    metrics: {
        totalPortfolioValue: number;
        changeAmount: number;
        changePercent: number;
        totalHoldingsValue: number;
    };
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ onDepositClick, balance, metrics }) => {
    const { totalPortfolioValue, changeAmount, changePercent, totalHoldingsValue } = metrics;
    const isPnlPositive = changeAmount >= 0;

    return (
        <Card className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left Section: Total Value */}
            <div className="md:col-span-1">
                <p className="text-muted text-sm">Total Portfolio Value</p>
                <p className="text-3xl font-bold text-white">${totalPortfolioValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                <div className={`text-sm font-semibold mt-1 ${isPnlPositive ? 'text-success' : 'text-danger'}`}>
                    <span>{isPnlPositive ? '+' : ''}${Math.abs(changeAmount).toFixed(2)}</span>
                    <span className="ml-2">({isPnlPositive ? '+' : ''}{changePercent.toFixed(2)}%)</span>
                    <span className="text-muted ml-2">(Today's Change)</span>
                </div>
            </div>
            
            {/* Middle Section: Breakdown */}
            <div className="md:col-span-1 md:border-l md:border-r border-border-color md:px-6 space-y-3">
                 <div>
                    <p className="text-muted text-sm">Crypto Value</p>
                    <p className="text-lg font-semibold text-white">${totalHoldingsValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </div>
                 <div>
                    <p className="text-muted text-sm">Available Cash</p>
                    <p className="text-lg font-semibold text-white">${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </div>
            </div>

            {/* Right Section: Actions */}
            <div className="md:col-span-1 flex justify-center items-center">
                 <button
                    onClick={onDepositClick}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-success text-white font-bold py-3 px-6 rounded-md hover:bg-green-600 transition-colors"
                >
                    <DepositIcon className="w-5 h-5" />
                    <span>Make a Deposit</span>
                </button>
            </div>
        </Card>
    );
};

export default PortfolioSummary;