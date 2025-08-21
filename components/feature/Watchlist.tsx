
import React, { useState, useEffect } from 'react';
import Card from '../shared/Card.tsx';
import { getRealTimePrices } from '../../services/cryptoService.ts';
import { getCoinIcon, StarIcon } from '../shared/Icons.tsx';
import { CryptoData } from '../../types.ts';

interface CryptoRowProps {
    item: CryptoData;
    onSelect: (symbol: string) => void;
    onGoToTrade: (symbol: string) => void;
    onShowDetail: (symbol: string) => void;
    onRemove: (symbol: string) => void;
}

const CryptoRow: React.FC<CryptoRowProps> = ({ item, onSelect, onGoToTrade, onShowDetail, onRemove }) => {
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (item.previousPrice === undefined) return;

    if (item.price > item.previousPrice) {
      setAnimationClass('animate-flash-green');
    } else if (item.price < item.previousPrice) {
      setAnimationClass('animate-flash-red');
    }
    
    const timer = setTimeout(() => setAnimationClass(''), 1500);
    return () => clearTimeout(timer);
  }, [item.price, item.previousPrice]);
  
  const isPositive = item.change24h >= 0;

  return (
    <tr 
        className={`border-b border-border-color last:border-b-0 hover:bg-surface/50 transition-colors duration-200 cursor-pointer ${animationClass}`}
        onClick={() => onShowDetail(item.symbol)}
    >
      <td className="p-3 text-center">
        <button
            onClick={(e) => { e.stopPropagation(); onRemove(item.symbol); }}
            className="p-1"
            aria-label="Remove from watchlist"
        >
            <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400 transition-colors hover:text-muted hover:fill-transparent" />
        </button>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-3">
          {getCoinIcon(item.symbol)}
          <div>
            <p className="font-semibold text-white">{item.name}</p>
            <p className="text-sm text-muted">{item.symbol.split('-')[0]}</p>
          </div>
        </div>
      </td>
      <td className="p-3 text-white font-mono text-right">
        ${item.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
      </td>
      <td className="p-3 font-mono text-right">
        <span className={isPositive ? 'text-success' : 'text-danger'}>
          {isPositive ? '+' : ''}{item.change24h.toFixed(2)}%
        </span>
      </td>
      <td className="p-3 text-right">
        <button 
          onClick={(e) => { e.stopPropagation(); onGoToTrade(item.symbol); }}
          className="bg-primary text-background font-semibold text-xs py-1 px-3 rounded-md hover:bg-primary-focus transition-colors"
        >
          Trade
        </button>
      </td>
    </tr>
  );
};


interface WatchlistProps {
    selectedSymbol: string;
    onSelect: (symbol: string) => void;
    onGoToTrade: (symbol: string) => void;
    onShowDetail: (symbol: string) => void;
    watchlistSymbols: string[];
    onToggleWatchlist: (symbol: string) => void;
}

const Watchlist: React.FC<WatchlistProps> = ({ selectedSymbol, onSelect, onGoToTrade, onShowDetail, watchlistSymbols, onToggleWatchlist }) => {
    const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (watchlistSymbols.length === 0) {
                setCryptoData([]);
                setIsLoading(false);
                return;
            }
            try {
                const prices = await getRealTimePrices(watchlistSymbols);
                if (prices.length > 0) {
                     setCryptoData(currentData => {
                        const newPricesMap = new Map(prices.map(p => [p.symbol, p]));
                        const updatedData = watchlistSymbols
                            .map(symbol => newPricesMap.get(symbol))
                            .filter((item): item is CryptoData => !!item);

                        return updatedData.map(newItem => {
                             const oldItem = currentData.find(d => d.symbol === newItem.symbol);
                             return { ...newItem, previousPrice: oldItem ? oldItem.price : newItem.price };
                        });
                    });
                } else {
                    setCryptoData([]);
                }
            } catch (error) {
                console.error("Error fetching market data", error);
                setCryptoData([]);
            } finally {
                setIsLoading(false);
            }
        };

        setIsLoading(true);
        fetchData(); // Initial fetch
        const intervalId = setInterval(fetchData, 5000); // Poll every 5 seconds

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [watchlistSymbols]);

  return (
    <Card className="h-full">
      <h2 className="text-xl font-bold text-white mb-4">Watchlist</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-full min-h-96">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : watchlistSymbols.length === 0 ? (
        <div className="flex justify-center items-center h-full min-h-96">
            <div className="text-center text-muted">
                <StarIcon className="w-10 h-10 mx-auto mb-2" />
                <p>Your watchlist is empty.</p>
                <p className="text-sm">Add coins from the Market tab.</p>
            </div>
        </div>
      ) : (
        <div className="overflow-y-auto">
            <table className="w-full text-left">
                <thead className="border-b border-border-color">
                    <tr>
                        <th className="p-3 text-sm font-semibold text-muted text-center" title="Remove from Watchlist"><StarIcon className="w-4 h-4 inline-block"/></th>
                        <th className="p-3 text-sm font-semibold text-muted">Asset</th>
                        <th className="p-3 text-sm font-semibold text-muted text-right">Price</th>
                        <th className="p-3 text-sm font-semibold text-muted text-right">24h %</th>
                        <th className="p-3 text-sm font-semibold text-muted text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {cryptoData.map(item => (
                        <CryptoRow 
                            key={item.symbol} 
                            item={item} 
                            onSelect={onSelect}
                            onGoToTrade={onGoToTrade}
                            onShowDetail={onShowDetail}
                            onRemove={onToggleWatchlist}
                        />
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </Card>
  );
};

export default Watchlist;