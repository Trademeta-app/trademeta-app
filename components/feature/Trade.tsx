import React, { useState, useEffect } from 'react';
import { User, OrderType, TransactionType, CoinDetail } from '../../types';
import { getCoinDetails } from '../../services/coinGeckoService';
import Card from '../shared/Card';

interface TradeProps {
  coinId: string;
  user: User;
  onTradeSuccess: (updatedUser: User) => void;
}

const Trade: React.FC<TradeProps> = ({ coinId, user, onTradeSuccess }) => {
  const [tradeType, setTradeType] = useState<'Buy' | 'Sell'>('Buy');
  const [orderType, setOrderType] = useState<OrderType>('Market');
  const [coinData, setCoinData] = useState<CoinDetail | null>(null);
  
  const [amountCoin, setAmountCoin] = useState('');
  const [amountUsd, setAmountUsd] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoinData = async () => {
      if (!coinId) {
        setIsLoading(false);
        setError("No coin selected.");
        return;
      };
      setIsLoading(true);
      setError(null);
      setCoinData(null);
      try {
        const data = await getCoinDetails(coinId);
        setCoinData(data);
      } catch (err) {
        setError('Coin data could not be fetched.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoinData();
    const interval = setInterval(fetchCoinData, 30000);
    return () => clearInterval(interval);
  }, [coinId]);

  const marketPrice = coinData?.market_data?.current_price?.usd ?? 0;
  const coinSymbol = coinData?.symbol?.toUpperCase() ?? 'COIN';
  const coinName = coinData?.name ?? 'Crypto';

  const handleCoinAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const coinValue = e.target.value;
    setAmountCoin(coinValue);
    if (marketPrice > 0 && coinValue) {
      const usdValue = parseFloat(coinValue) * marketPrice;
      setAmountUsd(usdValue.toFixed(2));
    } else {
      setAmountUsd('');
    }
  };

  const handleUsdAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const usdValue = e.target.value;
    setAmountUsd(usdValue);
    if (marketPrice > 0 && usdValue) {
      const coinValue = parseFloat(usdValue) / marketPrice;
      setAmountCoin(coinValue.toFixed(8));
    } else {
      setAmountCoin('');
    }
  };

  const handleTrade = () => {
    if (!coinData || marketPrice <= 0) {
        alert("Market price is unavailable, trade cannot be executed.");
        return;
    }

    const coinAmountNum = parseFloat(amountCoin);
    const usdAmountNum = parseFloat(amountUsd);

    if (isNaN(coinAmountNum) || isNaN(usdAmountNum) || coinAmountNum <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    const updatedUser = JSON.parse(JSON.stringify(user));
    
    const newTransaction = {
      id: new Date().toISOString() + Math.random(),
      date: new Date().toISOString(),
      type: tradeType as TransactionType,
      orderType: orderType,
      asset: coinData.name,
      symbol: coinData.symbol.toUpperCase(),
      amountCoin: coinAmountNum,
      amountUsd: usdAmountNum,
      pricePerCoin: marketPrice,
      status: 'Completed' as 'Completed',
    };

    if (tradeType === 'Buy') {
      if (updatedUser.balance < usdAmountNum) {
        alert("Insufficient balance.");
        return;
      }
      updatedUser.balance -= usdAmountNum;
      
      const existingHoldingIndex = updatedUser.holdings.findIndex((h: { symbol: string; }) => h.symbol === coinData.symbol.toUpperCase());
      if (existingHoldingIndex > -1) {
        updatedUser.holdings[existingHoldingIndex].amount += coinAmountNum;
        updatedUser.holdings[existingHoldingIndex].valueUsd += usdAmountNum;
      } else {
        updatedUser.holdings.push({
            name: coinData.name,
            symbol: coinData.symbol.toUpperCase(),
            amount: coinAmountNum,
            valueUsd: usdAmountNum,
        });
      }

    } else {
      const holding = updatedUser.holdings.find((h: { symbol: string; }) => h.symbol === coinData.symbol.toUpperCase());
      if (!holding || holding.amount < coinAmountNum) {
        alert("Insufficient coin balance.");
        return;
      }
      updatedUser.balance += usdAmountNum;
      holding.amount -= coinAmountNum;
      if (holding.amount < 0.000001) {
          updatedUser.holdings = updatedUser.holdings.filter((h: { symbol: string; }) => h.symbol !== coinData.symbol.toUpperCase());
      }
    }

    updatedUser.transactions.unshift(newTransaction);
    onTradeSuccess(updatedUser);
    
    setAmountCoin('');
    setAmountUsd('');
    alert(`${tradeType} order successful!`);
  };

  const currentCoinHolding = user.holdings.find(h => h.symbol === coinSymbol)?.amount ?? 0;
  const availableAmount = tradeType === 'Buy' ? user.balance : currentCoinHolding;
  const availableUnit = tradeType === 'Buy' ? 'USD' : coinSymbol;
  
  const isButtonDisabled = isLoading || marketPrice <= 0 || parseFloat(amountCoin) <= 0;

  if (isLoading) return <Card><div className="p-6 text-center">Loading trade panel...</div></Card>;
  if (error) return <Card><div className="p-6 text-center text-danger">{error}</div></Card>;

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          Trade {coinName} ({coinSymbol})
        </h3>
        
        <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-background rounded-md">
          <button onClick={() => setTradeType('Buy')} className={`py-2 px-4 rounded-md font-semibold text-sm ${tradeType === 'Buy' ? 'bg-success text-white' : 'text-muted hover:bg-surface'}`}>Buy</button>
          <button onClick={() => setTradeType('Sell')} className={`py-2 px-4 rounded-md font-semibold text-sm ${tradeType === 'Sell' ? 'bg-danger text-white' : 'text-muted hover:bg-surface'}`}>Sell</button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-background rounded-md">
          <button onClick={() => setOrderType('Market')} className={`py-2 px-4 rounded-md font-semibold text-sm ${orderType === 'Market' ? 'bg-primary text-background' : 'text-muted hover:bg-surface'}`}>Market</button>
          <button className={`py-2 px-4 rounded-md font-semibold text-sm text-muted cursor-not-allowed`} disabled>Limit</button>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm text-muted flex justify-between">
            <span>Available:</span>
            <span>{availableAmount.toFixed(tradeType === 'Buy' ? 2 : 8)} {availableUnit}</span>
          </div>
          <div className="relative">
            <input type="number" placeholder="0.000000" className="w-full bg-background border border-border-color rounded-md p-3 text-white" value={amountCoin} onChange={handleCoinAmountChange} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted font-semibold">{coinSymbol}</span>
          </div>

          <div className="text-center text-muted"><button className="p-1 hover:text-primary">&UpArrowDownArrow;</button></div>

          <div className="relative">
            <input type="number" placeholder="0.00" className="w-full bg-background border border-border-color rounded-md p-3 text-white" value={amountUsd} onChange={handleUsdAmountChange}/>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted font-semibold">USD</span>
          </div>

          <div className="text-sm text-muted text-center">Market Price: ~${marketPrice.toLocaleString()}</div>

          <button onClick={handleTrade} disabled={isButtonDisabled} className={`w-full py-3 rounded-md font-bold text-background transition-colors ${isButtonDisabled ? 'bg-muted cursor-not-allowed' : (tradeType === 'Buy' ? 'bg-success hover:bg-green-600' : 'bg-danger hover:bg-red-600')}`}>
            Market {tradeType} {coinSymbol}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default Trade;