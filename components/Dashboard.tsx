import React, { useState, useEffect } from 'react';
import Watchlist from './feature/Watchlist.tsx';
import PortfolioSummary from './feature/PortfolioSummary.tsx';
import Portfolio from './feature/Portfolio.tsx';
import PortfolioAllocation from './feature/PortfolioAllocation.tsx';
import TransactionHistory from './feature/TransactionHistory.tsx';
import Trade from './feature/Trade.tsx';
import Market from './feature/Market.tsx';
import { User, PortfolioHolding, Coin } from '../types.ts';
import { getMarketData } from '../services/coinGeckoService.ts';

type DashboardTab = 'Market' | 'Portfolio' | 'History' | 'Trade';

interface DashboardProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
  onShowDetail: (coinId: string) => void;
  onGoToDeposit: () => void;
  marketCurrentPage: number;
  onMarketPageChange: (newPage: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onUserUpdate, onShowDetail, onGoToDeposit, marketCurrentPage, onMarketPageChange }) => {
  const [selectedCoinId, setSelectedCoinId] = useState<string>('bitcoin');
  const [activeTab, setActiveTab] = useState<DashboardTab>('Market');
  const [watchlist, setWatchlist] = useState<string[]>(['bitcoin', 'ethereum', 'solana', 'cardano']);

  const [marketData, setMarketData] = useState<Coin[]>([]);
  const [marketIsLoading, setMarketIsLoading] = useState<boolean>(true);
  const [marketError, setMarketError] = useState<string | null>(null);

  const [portfolioMetrics, setPortfolioMetrics] = useState<{
      totalPortfolioValue: number;
      changeAmount: number;
      changePercent: number;
      totalHoldingsValue: number;
      dynamicHoldings: PortfolioHolding[];
  }>({
      totalPortfolioValue: user.balance, changeAmount: 0, changePercent: 0, totalHoldingsValue: 0, dynamicHoldings: [],
  });

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setMarketError(null);
        const data = await getMarketData('usd', 250);
        if (Array.isArray(data)) {
            setMarketData(data);
        } else {
            throw new Error("Market data received in wrong format.");
        }
      } catch (error) {
        setMarketError("Could not fetch market data at this time.");
        setMarketData([]);
      } finally {
        setMarketIsLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  useEffect(() => {
    const validMarketData = Array.isArray(marketData) && marketData.length > 0;

    if (!validMarketData) {
      const emptyHoldings = (user.holdings || []).map(h => ({
        ...h, valueUsd: 0, currentPrice: 0, todaysChangePercent: 0, avgCost: 0, totalGainLoss: {amount: 0, percent: 0}
      }));
      setPortfolioMetrics({
        totalPortfolioValue: user.balance,
        totalHoldingsValue: 0,
        changeAmount: 0,
        changePercent: 0,
        dynamicHoldings: emptyHoldings,
      });
      return;
    }

    const calculatePortfolioMetrics = () => {
        if (!user.holdings || user.holdings.length === 0) {
            setPortfolioMetrics({
                totalPortfolioValue: user.balance, changeAmount: 0, changePercent: 0, totalHoldingsValue: 0, dynamicHoldings: [],
            });
            return;
        }

        const pricesMap = new Map<string, Coin>(marketData.map(coin => [coin.symbol.toUpperCase(), coin]));

        let newTotalHoldingsValue = 0;
        let totalHoldingsChange24h = 0;

        const dynamicHoldings: PortfolioHolding[] = user.holdings.map(holding => {
            const coinData = pricesMap.get(holding.symbol.toUpperCase());
            const currentPrice = coinData?.current_price ?? 0;
            const todaysChangePercent = coinData?.price_change_percentage_24h ?? 0;
            const priceChange24h = coinData?.price_change_24h ?? 0;

            const currentValue = holding.amount * currentPrice;
            newTotalHoldingsValue += currentValue;
            totalHoldingsChange24h += holding.amount * priceChange24h;
            
            const buyTransactions = user.transactions.filter(
                t => t.symbol === holding.symbol && (t.type === 'Buy' || t.type === 'Mt Profit')
            );
            
            const totalAmountBought = buyTransactions.reduce((sum, t) => sum + t.amountCoin, 0);
            const totalCostBasis = buyTransactions.reduce((sum, t) => sum + t.amountUsd, 0);
            const avgCost = totalAmountBought > 0 ? totalCostBasis / totalAmountBought : 0;
            
            const costOfCurrentHoldings = avgCost * holding.amount;
            const gainLossAmount = costOfCurrentHoldings > 0 ? currentValue - costOfCurrentHoldings : 0;
            const gainLossPercent = costOfCurrentHoldings > 0 ? (gainLossAmount / costOfCurrentHoldings) * 100 : 0;

            return {
                ...holding,
                valueUsd: currentValue,
                currentPrice,
                todaysChangePercent,
                avgCost,
                totalGainLoss: { amount: gainLossAmount, percent: gainLossPercent },
            };
        });

        const previousTotalHoldingsValue = newTotalHoldingsValue - totalHoldingsChange24h;
        const changePercent = previousTotalHoldingsValue > 0 ? (totalHoldingsChange24h / previousTotalHoldingsValue) * 100 : 0;

        setPortfolioMetrics({
            totalPortfolioValue: newTotalHoldingsValue + user.balance,
            changeAmount: totalHoldingsChange24h,
            changePercent,
            totalHoldingsValue: newTotalHoldingsValue,
            dynamicHoldings,
        });
    };

    calculatePortfolioMetrics();
  }, [marketData, user.holdings, user.balance, user.transactions]);


  const handleToggleWatchlist = (coinId: string) => {
    setWatchlist(prev => prev.includes(coinId) ? prev.filter(id => id !== coinId) : [...prev, coinId]);
  };
  
  const handleTradeSuccess = (updatedUser: User) => {
      onUserUpdate(updatedUser);
  }

  const handleGoToTrade = (symbolOrId: string) => {
      const coin = marketData.find(c => c.id === symbolOrId || c.symbol.toLowerCase() === symbolOrId.toLowerCase());
      if (coin) {
          setSelectedCoinId(coin.id);
          setActiveTab('Trade');
      } else {
          alert(`Could not find market data for ${symbolOrId}.`);
      }
  };
  
  const TabButton = ({ tabName }: { tabName: DashboardTab }) => (
    <button onClick={() => setActiveTab(tabName)} className={`px-4 py-2 font-semibold text-sm rounded-md transition-colors ${activeTab === tabName ? 'bg-primary text-background' : 'text-muted hover:bg-surface'}`}>
        {tabName}
    </button>
  );

  const watchlistData = marketData.filter(coin => watchlist.includes(coin.id));

  const renderTabContent = () => {
    switch (activeTab) {
        case 'Market':
            return <Market 
              coins={marketData} 
              isLoading={marketIsLoading} 
              error={marketError} 
              onGoToTrade={handleGoToTrade} 
              onShowDetail={onShowDetail} 
              watchlist={watchlist} 
              onToggleWatchlist={handleToggleWatchlist}
              currentPage={marketCurrentPage}
              onPageChange={onMarketPageChange}
            />;
        case 'Portfolio':
            return (
                <div className="space-y-8">
                    <PortfolioAllocation holdings={portfolioMetrics.dynamicHoldings} balance={user.balance} />
                    <Portfolio holdings={portfolioMetrics.dynamicHoldings} balance={user.balance} onGoToTrade={handleGoToTrade} />
                </div>
            );
        case 'History':
            return <TransactionHistory transactions={user.transactions}/>;
        case 'Trade':
            return <Trade coinId={selectedCoinId} user={user} onTradeSuccess={handleTradeSuccess} />;
        default:
            return null;
    }
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <PortfolioSummary onDepositClick={onGoToDeposit} balance={user.balance} metrics={portfolioMetrics} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
             <div className="bg-surface p-1 rounded-lg flex items-center space-x-2 border border-border-color w-full md:w-auto flex-wrap">
                <TabButton tabName="Market" /><TabButton tabName="Portfolio" /><TabButton tabName="History" /><TabButton tabName="Trade" />
            </div>
            {renderTabContent()}
        </div>
        <div className="lg:col-span-1">
            <Watchlist 
                coins={watchlistData} 
                isLoading={marketIsLoading}
                onToggleWatchlist={handleToggleWatchlist} 
                onGoToTrade={handleGoToTrade}
                onShowDetail={onShowDetail}
            />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;