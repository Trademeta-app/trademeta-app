import React, { useState } from 'react';
import { Coin } from '../../types.ts';
import { StarIcon } from '../shared/Icons.tsx';
import Card from '../shared/Card.tsx'; // Card importunu ekledim

const ITEMS_PER_PAGE = 20;

interface MarketProps {
    coins: Coin[];
    isLoading: boolean;
    error: string | null;
    onGoToTrade: (id: string) => void;
    onShowDetail: (id: string) => void;
    watchlist: string[];
    onToggleWatchlist: (id: string) => void;
}

const formatLargeNumber = (num?: number): string => {
    if (typeof num !== 'number') return '$-';
    if (Math.abs(num) >= 1e12) return `$${(num / 1e12).toFixed(2)} T`;
    if (Math.abs(num) >= 1e9) return `$${(num / 1e9).toFixed(2)} B`;
    if (Math.abs(num) >= 1e6) return `$${(num / 1e6).toFixed(2)} M`;
    return `$${num.toLocaleString()}`;
};

const Market: React.FC<MarketProps> = ({ coins, isLoading, error, onGoToTrade, onShowDetail, watchlist, onToggleWatchlist }) => {
    const [currentPage, setCurrentPage] = useState(1);
    
    // GÜVENLİK KONTROLÜ: Gelen 'coins' verisinin bir dizi olduğundan emin oluyoruz.
    const validCoins = Array.isArray(coins) ? coins : [];

    const totalPages = validCoins.length > 0 ? Math.ceil(validCoins.length / ITEMS_PER_PAGE) : 1;
    const paginatedData = validCoins.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    
    if (isLoading) {
        return (
            <div className="bg-surface border border-border-color rounded-lg p-6 min-h-[500px] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
             <div className="bg-surface border border-border-color rounded-lg p-6 min-h-[500px] flex items-center justify-center">
                <p className="text-danger">{error}</p>
            </div>
        );
    }

    return (
        <Card>
            <div className="p-6 flex justify-between items-center flex-wrap gap-4 border-b border-border-color">
                <div>
                    <h2 className="text-xl font-bold text-white">{validCoins.length} Kripto Para</h2>
                    <p className="text-sm text-muted">Sayfa {currentPage} / {totalPages}</p>
                </div>
                 <div className="flex gap-2">
                    <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-4 py-2 bg-background border border-border-color text-sm font-semibold text-white rounded-md transition-colors hover:bg-border-color disabled:opacity-50 disabled:cursor-not-allowed">Önceki</button>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-4 py-2 bg-background border border-border-color text-sm font-semibold text-white rounded-md transition-colors hover:bg-border-color disabled:opacity-50 disabled:cursor-not-allowed">Sonraki</button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="p-3 text-sm font-semibold text-muted text-center w-12"><StarIcon className="w-4 h-4 inline-block"/></th>
                            <th className="p-3 text-sm font-semibold text-muted">#</th>
                            <th className="p-3 text-sm font-semibold text-muted">İsim</th>
                            <th className="p-3 text-sm font-semibold text-muted text-right">Fiyat</th>
                            <th className="p-3 text-sm font-semibold text-muted text-right">24s %</th>
                            <th className="p-3 text-sm font-semibold text-muted text-right">Piyasa Değeri</th>
                            <th className="p-3 text-sm font-semibold text-muted text-right">Hacim (24s)</th>
                            <th className="p-3 text-sm font-semibold text-muted text-center">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(coin => {
                            // GÜVENLİK KONTROLÜ: Değerlerin var olup olmadığını kontrol ederek varsayılan değerler atıyoruz.
                            const change24h = coin?.price_change_percentage_24h ?? 0;
                            const isPositive = change24h >= 0;
                            const isInWatchlist = watchlist.includes(coin?.id);

                            return (
                                <tr key={coin?.id || Math.random()} className="border-b border-border-color last:border-b-0 hover:bg-surface/50 transition-colors duration-200 cursor-pointer" onClick={() => coin?.id && onShowDetail(coin.id)}>
                                    <td className="p-3 text-center"><button onClick={(e) => { e.stopPropagation(); coin?.id && onToggleWatchlist(coin.id); }} className="p-1"><StarIcon className={`w-5 h-5 transition-colors ${isInWatchlist ? 'text-yellow-400 fill-yellow-400' : 'text-muted hover:text-yellow-400'}`}/></button></td>
                                    <td className="p-3 font-mono text-white text-sm">{coin?.market_cap_rank ?? 'N/A'}</td>
                                    <td className="p-3"><div className="flex items-center gap-3"><img src={coin?.image} alt={coin?.name} className="w-6 h-6"/><div><p className="font-semibold text-white">{coin?.name ?? 'Unknown'}</p><p className="text-sm text-muted">{(coin?.symbol ?? '').toUpperCase()}</p></div></div></td>
                                    <td className="p-3 text-white font-mono text-right">${(coin?.current_price ?? 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: (coin?.current_price ?? 0) > 1 ? 2 : 8})}</td>
                                    <td className={`p-3 font-mono text-right ${isPositive ? 'text-success' : 'text-danger'}`}>{isPositive ? '+' : ''}{change24h.toFixed(2)}%</td>
                                    <td className="p-3 text-white font-mono text-right">{formatLargeNumber(coin?.market_cap)}</td>
                                    <td className="p-3 text-white font-mono text-right">{formatLargeNumber(coin?.total_volume)}</td>
                                    <td className="p-3 text-center"><button onClick={(e) => { e.stopPropagation(); coin?.id && onGoToTrade(coin.id)}} className="bg-primary text-background font-bold text-xs py-1.5 px-4 rounded-md hover:bg-primary-focus transition-colors">Trade</button></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default Market;