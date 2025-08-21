import React, { useState, useEffect } from 'react';
import Watchlist from './feature/Watchlist.tsx';
import PortfolioSummary from './feature/PortfolioSummary.tsx';
import Portfolio from './feature/Portfolio.tsx';
import PortfolioAllocation from './feature/PortfolioAllocation.tsx';
import TransactionHistory from './feature/TransactionHistory.tsx';
import Trade from './feature/Trade.tsx';
import Market from './feature/Market.tsx';
// DEĞİŞİKLİK: Yeni tipleri ve servisi import ediyoruz
import { User, PortfolioHolding, Coin } from '../types.ts';
import { getMarketData } from '../services/coinGeckoService.ts'; // Yeni servis

type DashboardTab = 'Market' | 'Portfolio' | 'History' | 'Trade';

interface DashboardProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
  // DEĞİŞİKLİK: Prop'un adını ve tipini güncelliyoruz
  onShowDetail: (coinId: string) => void;
  onGoToDeposit: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onUserUpdate, onShowDetail, onGoToDeposit }) => {
  // DEĞİŞİKLİK: State'leri yeni coinId formatına göre güncelliyoruz
  const [selectedCoinId, setSelectedCoinId] = useState<string>('bitcoin');
  const [activeTab, setActiveTab] = useState<DashboardTab>('Market');
  const [watchlist, setWatchlist] = useState<string[]>(['bitcoin', 'ethereum', 'solana', 'cardano']);
  
  const [portfolioMetrics, setPortfolioMetrics] = useState<{
      totalPortfolioValue: number;
      changeAmount: number; // 24 saatlik değişim
      changePercent: number; // 24 saatlik yüzde
      totalHoldingsValue: number;
      dynamicHoldings: PortfolioHolding[];
  }>({
      totalPortfolioValue: user.balance,
      changeAmount: 0,
      changePercent: 0,
      totalHoldingsValue: 0,
      dynamicHoldings: [],
  });

  // DEĞİŞİKLİK: Portföy hesaplama mantığını tamamen CoinGecko API'sine göre yeniden yazdık
  useEffect(() => {
    const calculatePortfolioMetrics = async () => {
        if (!user.holdings || user.holdings.length === 0) {
            setPortfolioMetrics(prev => ({ ...prev, totalPortfolioValue: user.balance, totalHoldingsValue: 0, dynamicHoldings: [] }));
            return;
        }

        // 1. Portföydeki coinlerin ID'lerini topla (örn: 'BTC-USD' -> 'bitcoin')
        // Not: Bu haritalama projenizdeki holding.symbol formatına bağlıdır.
        const holdingIdMap = new Map(user.holdings.map(h => [h.symbol, h.symbol.split('-')[0].toLowerCase()]));
        
        // 2. CoinGecko'dan tüm portföy coinleri için tek bir API isteği ile güncel verileri al
        const marketData = await getMarketData('usd', 250); // Pazardaki ilk 250 coini al
        const pricesMap = new Map<string, Coin>(marketData.map(coin => [coin.id, coin]));

        let newTotalHoldingsValue = 0;
        let totalHoldingsChange24h = 0;

        const dynamicHoldings: PortfolioHolding[] = user.holdings.map(holding => {
            const coinId = holdingIdMap.get(holding.symbol);
            if (!coinId) return { ...holding, valueUsd: holding.valueUsd, currentPrice: 0, todaysChangePercent: 0, avgCost: 0, totalGainLoss: { amount: 0, percent: 0 } };

            const coinData = pricesMap.get(coinId);
            const currentPrice = coinData?.current_price ?? (holding.amount > 0 ? holding.valueUsd / holding.amount : 0);
            const todaysChangePercent = coinData?.price_change_percentage_24h ?? 0;
            
            const currentValue = holding.amount * currentPrice;
            newTotalHoldingsValue += currentValue;
            
            // 24 saatlik değişimi hesapla
            const priceChange24h = coinData?.price_change_24h ?? 0;
            totalHoldingsChange24h += holding.amount * priceChange24h;

            // Ortalama maliyet ve kar/zarar hesaplaması (bu kısım aynı kalabilir)
            const buyTransactions = user.transactions.filter(t => t.symbol === holding.symbol && t.type === 'Buy');
            const totalAmountBought = buyTransactions.reduce((sum, t) => sum + t.amountCoin, 0);
            const totalCostBasis = buyTransactions.reduce((sum, t) => sum + t.amountUsd, 0);
            const avgCost = totalAmountBought > 0 ? totalCostBasis / totalAmountBought : 0;
            const costOfCurrentHoldings = avgCost * holding.amount;
            const gainLossAmount = currentValue - costOfCurrentHoldings;
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
    const intervalId = setInterval(calculatePortfolioMetrics, 60000); // API limitleri için 60 saniyeye çıkarıldı

    return () => clearInterval(intervalId);
  }, [user.holdings, user.balance, user.transactions]);


  const handleToggleWatchlist = (coinId: string) => {
    setWatchlist(prev => prev.includes(coinId) ? prev.filter(id => id !== coinId) : [...prev, coinId]);
  };
  
  const handleTradeSuccess = (updatedUser: User) => {
      onUserUpdate(updatedUser);
  }

  const handleGoToTrade = (coinId: string) => {
    setSelectedCoinId(coinId);
    setActiveTab('Trade');
  };
  
  const TabButton = ({ tabName }: { tabName: DashboardTab }) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 font-semibold text-sm rounded-md transition-colors ${activeTab === tabName ? 'bg-primary text-background' : 'text-muted hover:bg-surface'}`}
    >
        {tabName}
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
        case 'Market':
            // DEĞİŞİKLİK: Props'ları yeni coinId formatına uygun hale getirdik
            return <Market onGoToTrade={handleGoToTrade} onShowDetail={onShowDetail} watchlist={watchlist} onToggleWatchlist={handleToggleWatchlist} />;
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
                <TabButton tabName="Market" />
                <TabButton tabName="Portfolio" />
                <TabButton tabName="History" />
                <TabButton tabName="Trade" />
            </div>
            {renderTabContent()}
        </div>
        <div className="lg:col-span-1">
            {/* ÖNEMLİ NOT: Watchlist.tsx bileşeninin de coinId ile çalışması için güncellenmesi gerekebilir. */}
            <Watchlist selectedSymbol={selectedCoinId} onSelect={setSelectedCoinId} onGoToTrade={handleGoToTrade} onShowDetail={onShowDetail} watchlistSymbols={watchlist} onToggleWatchlist={handleToggleWatchlist} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;