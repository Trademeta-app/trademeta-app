// --- src/pages/feature/Watchlist.tsx --- (REVISED AND SIMPLIFIED)

import React from 'react';
import Card from '../shared/Card.tsx';
import { StarIcon } from '../shared/Icons.tsx';
import { Coin } from '../../types.ts';

interface CryptoRowProps {
    item: Coin;
    onGoToTrade: (id: string) => void;
    onShowDetail: (id: string) => void;
    onRemove: (id: string) => void;
}

const CryptoRow: React.FC<CryptoRowProps> = ({ item, onGoToTrade, onShowDetail, onRemove }) => {
  const isPositive = (item.price_change_percentage_24h ?? 0) >= 0;

  return (
    <tr 
        className="border-b border-border-color last:border-b-0 hover:bg-surface/50 transition-colors duration-200 cursor-pointer"
        onClick={() => onShowDetail(item.id)}
    >
      <td className="p-3 text-center">
        <button
            onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
            className="p-1"
            aria-label="Remove from watchlist"
        >
            <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400 transition-colors hover:text-muted hover:fill-transparent" />
        </button>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-3">
          <img src={item.image} alt={item.name} className="w-6 h-6" />
          <div>
            <p className="font-semibold text-white">{item.name}</p>
            <p className="text-sm text-muted">{item.symbol.toUpperCase()}</p>
          </div>
        </div>
      </td>
      <td className="p-3 text-white font-mono text-right">
        ${item.current_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: item.current_price > 1 ? 2 : 8})}
      </td>
      <td className="p-3 font-mono text-right">
        <span className={isPositive ? 'text-success' : 'text-danger'}>
          {isPositive ? '+' : ''}{(item.price_change_percentage_24h ?? 0).toFixed(2)}%
        </span>
      </td>
      <td className="p-3 text-right">
        <button 
          onClick={(e) => { e.stopPropagation(); onGoToTrade(item.id); }}
          className="bg-primary text-background font-semibold text-xs py-1 px-3 rounded-md hover:bg-primary-focus transition-colors"
        >
          Trade
        </button>
      </td>
    </tr>
  );
};

interface WatchlistProps {
    coins: Coin[];
    isLoading: boolean;
    onGoToTrade: (id: string) => void;
    onShowDetail: (id: string) => void;
    onToggleWatchlist: (id: string) => void;
}

const Watchlist: React.FC<WatchlistProps> = ({ coins, isLoading, onGoToTrade, onShowDetail, onToggleWatchlist }) => {
  return (
    <Card className="h-full">
      <h2 className="text-xl font-bold text-white mb-4">Watchlist</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-full min-h-96">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : coins.length === 0 ? (
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
                    {coins.map(item => (
                        <CryptoRow 
                            key={item.id} 
                            item={item} 
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