import React from 'react';
import Card from '../shared/Card.tsx';
import { Transaction, TransactionType } from '../../types.ts';

// getTypePill fonksiyonunu güncelleyerek "Mt Profit" ve "Adjustment" tiplerini de ekliyoruz
const getTypePill = (type: TransactionType) => {
    switch(type) {
        case 'Buy':
            return <span className="px-2 py-1 text-xs font-bold rounded-full bg-success/20 text-success">{type}</span>;
        case 'Sell':
            return <span className="px-2 py-1 text-xs font-bold rounded-full bg-danger/20 text-danger">{type}</span>;
        case 'Deposit':
            return <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400">{type}</span>;
        case 'Mt Profit':
            return <span className="px-2 py-1 text-xs font-bold rounded-full bg-yellow-500/20 text-yellow-400">{type}</span>;
        case 'Adjustment':
            return <span className="px-2 py-1 text-xs font-bold rounded-full bg-purple-500/20 text-purple-400">{type}</span>;
        default:
            return <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-500/20 text-gray-400">{type}</span>;
    }
}

interface TransactionHistoryProps {
    transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
    // Tarih formatlama için yardımcı fonksiyon
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            // Tarihi daha okunabilir bir formata çeviriyoruz
            return new Date(dateString).toLocaleString();
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Sayı formatlama için yardımcı fonksiyon
    const formatNumber = (num?: number, digits: number = 2) => {
        if (typeof num !== 'number' || isNaN(num)) {
            return '-';
        }
        return num.toFixed(digits);
    };

    // Para birimi formatlama için yardımcı fonksiyon
    const formatCurrency = (num?: number) => {
        if (typeof num !== 'number' || isNaN(num)) {
            return '$-';
        }
        return `$${num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    };

    return (
        <Card>
            <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-border-color">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-muted">Date</th>
                            <th className="p-3 text-sm font-semibold text-muted">Type</th>
                            <th className="p-3 text-sm font-semibold text-muted">Asset</th>
                            <th className="p-3 text-sm font-semibold text-muted text-right">Amount</th>
                            <th className="p-3 text-sm font-semibold text-muted text-right">Value (USD)</th>
                            <th className="p-3 text-sm font-semibold text-muted">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => (
                            <tr key={tx.id} className="border-b border-border-color last:border-b-0 hover:bg-surface/50">
                                {/* GÜVENLİK KONTROLLERİ EKLENDİ */}
                                <td className="p-3 text-muted text-xs">{formatDate(tx.date)}</td>
                                <td className="p-3">{getTypePill(tx.type)}</td>
                                <td className="p-3 text-white">{tx.asset || 'N/A'}</td>
                                <td className="p-3 text-white font-mono text-right">
                                    {formatNumber(tx.amountCoin, 6)} {tx.symbol && tx.symbol !== 'USD' ? tx.symbol.toUpperCase() : ''}
                                </td>
                                <td className="p-3 text-white font-mono text-right">{formatCurrency(tx.amountUsd)}</td>
                                <td className="p-3 text-muted text-xs">
                                    {tx.orderType || (tx.targetAddress ? `To: ${tx.targetAddress.substring(0, 10)}...` : 'N/A')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {transactions.length === 0 && (
                    <p className="text-center text-muted p-6">No transactions found.</p>
                )}
            </div>
        </Card>
    );
};

export default TransactionHistory;