import React from 'react';
import Card from '../shared/Card.tsx';
import DonutChart from '../charts/DonutChart.tsx';
import { ExchangeVolumeData } from '../../types.ts';

interface PricePerExchangeProps {
    data: ExchangeVolumeData[];
    isLoading: boolean;
}

const formatVolume = (volume: number): string => {
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)} M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)} K`;
    return `$${volume.toFixed(2)}`;
};

const formatPairVolume = (volume: number): string => {
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)} M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)} K`;
    return volume.toString();
}

const PricePerExchange: React.FC<PricePerExchangeProps> = ({ data, isLoading }) => {
    const chartData = data.map(d => ({ name: d.name, value: d.volume }));
    
    if (isLoading) {
        return <Card className="h-[450px] flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </Card>
    }

    return (
        <Card>
            <h3 className="text-xl font-bold text-white mb-2">Price per Exchange</h3>
            <DonutChart data={chartData} />
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-border-color">
                        <tr>
                            <th className="p-2 font-semibold text-muted">EXCHANGE</th>
                            <th className="p-2 font-semibold text-muted text-right">24H VOLUME</th>
                            <th className="p-2 font-semibold text-muted text-right">PRICE (USD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(exchange => (
                           <React.Fragment key={exchange.name}>
                             <tr className="border-b border-border-color font-semibold">
                                <td className="p-2 text-white">{exchange.name}</td>
                                <td className="p-2 text-white text-right font-mono">{formatVolume(exchange.volume)}</td>
                                <td className="p-2 text-primary text-right font-mono">${exchange.price > 0 ? exchange.price.toLocaleString(undefined, {minimumFractionDigits: 2}) : 'N/A'}</td>
                             </tr>
                             {exchange.pairs.slice(0,3).map(pair => (
                                <tr key={`${exchange.name}-${pair.currency}`} className="border-b border-border-color/50">
                                    <td className="pl-6 pr-2 py-1 text-muted">{pair.currency}</td>
                                    <td className="p-1 text-muted text-right font-mono">{formatPairVolume(pair.volume)}</td>
                                    <td className="p-1 text-muted text-right font-mono">{pair.price.toLocaleString(undefined, { maximumFractionDigits: pair.price > 1 ? 2 : 8})}</td>
                                </tr>
                             ))}
                           </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default PricePerExchange;