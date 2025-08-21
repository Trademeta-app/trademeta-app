import React, { useState } from 'react';
import Card from '../shared/Card.tsx';
import DonutChart from '../charts/DonutChart.tsx';
import { CurrencyVolumeData } from '../../types.ts';

interface PricePerCurrencyProps {
    data: CurrencyVolumeData[];
    isLoading: boolean;
}

const formatVolume = (volume: number): string => {
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)} M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)} K`;
    return `$${volume.toFixed(2)}`;
};

const PricePerCurrency: React.FC<PricePerCurrencyProps> = ({ data, isLoading }) => {
    const [showMore, setShowMore] = useState<Record<string, boolean>>({});
    const chartData = data.map(d => ({ name: d.name, value: d.volume }));
    
    if (isLoading) {
        return <Card className="h-[450px] flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </Card>
    }
    
    const toggleShowMore = (currencyName: string) => {
        setShowMore(prev => ({ ...prev, [currencyName]: !prev[currencyName]}));
    }

    return (
        <Card>
            <h3 className="text-xl font-bold text-white mb-2">Price per Currency</h3>
            <DonutChart data={chartData} />
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-border-color">
                        <tr>
                            <th className="p-2 font-semibold text-muted">CURRENCY</th>
                            <th className="p-2 font-semibold text-muted text-right">24H VOLUME</th>
                            <th className="p-2 font-semibold text-muted text-right">PRICE (USD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(currency => (
                           <React.Fragment key={currency.name}>
                             <tr className="border-b border-border-color font-semibold">
                                <td className="p-2 text-white">{currency.name}</td>
                                <td className="p-2 text-white text-right font-mono">{formatVolume(currency.volume)}</td>
                                <td className="p-2 text-primary text-right font-mono">${currency.price > 0 ? currency.price.toLocaleString(undefined, {minimumFractionDigits: 2}) : 'N/A'}</td>
                             </tr>
                             {currency.exchanges.slice(0, showMore[currency.name] ? currency.exchanges.length : 3).map(exchange => (
                                <tr key={`${currency.name}-${exchange.name}`} className="border-b border-border-color/50">
                                    <td className="pl-6 pr-2 py-1 text-muted">{exchange.name}</td>
                                    <td className="p-1 text-muted text-right font-mono">{formatVolume(exchange.volume)}</td>
                                    <td className="p-1 text-muted text-right font-mono">${exchange.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                </tr>
                             ))}
                             {currency.exchanges.length > 3 && (
                                <tr><td colSpan={3} className="text-center text-xs text-primary pt-1 cursor-pointer" onClick={() => toggleShowMore(currency.name)}>{showMore[currency.name] ? 'Show less' : 'Show more'}</td></tr>
                             )}
                           </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default PricePerCurrency;