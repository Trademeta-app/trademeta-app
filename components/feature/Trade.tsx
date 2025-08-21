import React, { useState, useEffect, useCallback } from 'react';
import { User, OrderType, TransactionType, CoinDetail } from '../../types';
import { getCoinDetails } from '../../services/coinGeckoService'; // Canlı veri için servisimiz
import Card from '../shared/Card';

interface TradeProps {
  coinId: string; // DEĞİŞİKLİK: 'selectedSymbol' yerine 'coinId' kullanıyoruz
  user: User;
  onTradeSuccess: (updatedUser: User) => void;
}

const Trade: React.FC<TradeProps> = ({ coinId, user, onTradeSuccess }) => {
  // --- STATE TANIMLAMALARI ---
  const [tradeType, setTradeType] = useState<'Buy' | 'Sell'>('Buy');
  const [orderType, setOrderType] = useState<OrderType>('Market');
  const [coinData, setCoinData] = useState<CoinDetail | null>(null);
  
  // Girdi alanlarının değerlerini string olarak tutmak, kullanıcı "0." gibi değerler girdiğinde daha iyi bir deneyim sunar
  const [amountCoin, setAmountCoin] = useState(''); // Üstteki input (BTC, ETH miktarı)
  const [amountUsd, setAmountUsd] = useState(''); // Alttaki input (USD tutarı)

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- VERİ ÇEKME ---
  useEffect(() => {
    console.log('Trade bileşenine gelen coinId:', coinId); 
    const fetchCoinData = async () => {
      if (!coinId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCoinDetails(coinId);
        setCoinData(data);
      } catch (err) {
        setError('Coin verileri alınamadı.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoinData();
    // Her 30 saniyede bir fiyatı güncelle
    const interval = setInterval(fetchCoinData, 30000);
    return () => clearInterval(interval);
  }, [coinId]);

  // --- HESAPLAMA MANTIKLARI ---
  const marketPrice = coinData?.market_data?.current_price?.usd ?? 0;

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
      setAmountCoin(coinValue.toFixed(8)); // Kripto için daha fazla ondalık basamak
    } else {
      setAmountCoin('');
    }
  };

  // --- İŞLEM GERÇEKLEŞTİRME ---
  const handleTrade = () => {
    if (!coinData || marketPrice <= 0) {
        alert("Piyasa fiyatı alınamadığı için işlem yapılamıyor.");
        return;
    }

    const coinAmountNum = parseFloat(amountCoin);
    const usdAmountNum = parseFloat(amountUsd);

    if (isNaN(coinAmountNum) || isNaN(usdAmountNum) || coinAmountNum <= 0) {
        alert("Lütfen geçerli bir miktar girin.");
        return;
    }

    let updatedUser = { ...user };
    const newTransaction = {
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      type: tradeType as TransactionType,
      orderType: orderType,
      asset: coinData.name,
      symbol: coinData.symbol.toUpperCase(), // `btc` -> `BTC`
      amountCoin: coinAmountNum,
      amountUsd: usdAmountNum,
      pricePerCoin: marketPrice,
      status: 'Completed' as 'Completed',
    };

    if (tradeType === 'Buy') {
      if (user.balance < usdAmountNum) {
        alert("Yetersiz bakiye.");
        return;
      }
      updatedUser.balance -= usdAmountNum;
      
      const existingHoldingIndex = user.holdings.findIndex(h => h.symbol === coinData.symbol.toUpperCase());
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

    } else { // Sell
      const holding = user.holdings.find(h => h.symbol === coinData.symbol.toUpperCase());
      if (!holding || holding.amount < coinAmountNum) {
        alert("Yetersiz coin miktarı.");
        return;
      }
      updatedUser.balance += usdAmountNum;
      holding.amount -= coinAmountNum;
    }

    updatedUser.transactions = [newTransaction, ...user.transactions];
    onTradeSuccess(updatedUser);
    
    // İşlem sonrası inputları temizle
    setAmountCoin('');
    setAmountUsd('');
    alert(`${tradeType} işlemi başarılı!`);
  };

  // --- DİNAMİK UI ELEMANLARI ---
  const currentCoinHolding = user.holdings.find(h => h.symbol === coinData?.symbol.toUpperCase())?.amount ?? 0;
  const availableAmount = tradeType === 'Buy' ? user.balance : currentCoinHolding;
  const availableUnit = tradeType === 'Buy' ? 'USD' : coinData?.symbol.toUpperCase();
  
  const isButtonDisabled = isLoading || marketPrice <= 0 || parseFloat(amountCoin) <= 0;

  if (isLoading) return <div>Trade paneli yükleniyor...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          Trade {coinData?.name} ({coinData?.symbol.toUpperCase()})
        </h3>

        {/* Al/Sat Butonları */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-background rounded-md">
          <button onClick={() => setTradeType('Buy')} className={`py-2 px-4 rounded-md font-semibold text-sm ${tradeType === 'Buy' ? 'bg-success text-white' : 'text-muted hover:bg-surface'}`}>Buy</button>
          <button onClick={() => setTradeType('Sell')} className={`py-2 px-4 rounded-md font-semibold text-sm ${tradeType === 'Sell' ? 'bg-danger text-white' : 'text-muted hover:bg-surface'}`}>Sell</button>
        </div>

        {/* Market/Limit Butonları */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-background rounded-md">
          <button onClick={() => setOrderType('Market')} className={`py-2 px-4 rounded-md font-semibold text-sm ${orderType === 'Market' ? 'bg-primary text-background' : 'text-muted hover:bg-surface'}`}>Market</button>
          <button onClick={() => setOrderType('Limit')} className={`py-2 px-4 rounded-md font-semibold text-sm ${orderType === 'Limit' ? 'bg-primary/20 text-primary cursor-not-allowed' : 'text-muted hover:bg-surface'}`} disabled>Limit</button>
        </div>
        
        {/* Girdi Alanları */}
        <div className="space-y-4">
          <div className="text-sm text-muted flex justify-between">
            <span>Available:</span>
            <span>{availableAmount.toFixed(tradeType === 'Buy' ? 2 : 8)} {availableUnit}</span>
          </div>
          <div className="relative">
            <input type="number" placeholder="0.000000" className="w-full bg-background border border-border-color rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary text-white" value={amountCoin} onChange={handleCoinAmountChange} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted font-semibold">{coinData?.symbol.toUpperCase()}</span>
          </div>

          <div className="text-center text-muted"><button className="p-1 hover:text-primary">&UpArrowDownArrow;</button></div>

          <div className="relative">
            <input type="number" placeholder="0.00" className="w-full bg-background border border-border-color rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary text-white" value={amountUsd} onChange={handleUsdAmountChange}/>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted font-semibold">USD</span>
          </div>

          <div className="text-sm text-muted text-center">Market Price: ~${marketPrice.toLocaleString()}</div>

          <button onClick={handleTrade} disabled={isButtonDisabled} className={`w-full py-3 rounded-md font-bold text-background transition-colors ${isButtonDisabled ? 'bg-muted cursor-not-allowed' : (tradeType === 'Buy' ? 'bg-success hover:bg-green-600' : 'bg-danger hover:bg-red-600')}`}>
            Market {tradeType} {coinData?.symbol.toUpperCase()}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default Trade;