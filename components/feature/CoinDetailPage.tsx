import React, { useState, useEffect, useRef } from 'react';
import AdvancedPriceChart from '../charts/AdvancedPriceChart.tsx';
// DEĞİŞİKLİK: Yeni servislerimizi ve tiplerimizi import ediyoruz
import { getCoinDetails } from '../../services/coinGeckoService.ts';
import { CoinDetail } from '../../types.ts';
import { getCoinIcon } from '../shared/Icons.tsx';

// DEĞİŞİKLİK: Props'ları güncelliyoruz. Artık 'symbol' yerine CoinGecko'nun 'coinId'sini alacağız.
interface CoinDetailPageProps {
    coinId: string;
    onBack: () => void;
}

const formatLargeNumber = (num?: number, prefix = '$'): string => {
    if (num === undefined || num === null) return `${prefix} -`;
    if (Math.abs(num) >= 1e12) return `${prefix}${(num / 1e12).toFixed(2)} T`;
    if (Math.abs(num) >= 1e9) return `${prefix}${(num / 1e9).toFixed(2)} B`;
    if (Math.abs(num) >= 1e6) return `${prefix}${(num / 1e6).toFixed(2)} M`;
    return `${prefix}${num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
};

const StatItem = ({ label, value }: { label: string; value: string }) => (
    <div>
        <div className="text-sm text-muted">{label}</div>
        <div className="text-base font-semibold text-white">{value}</div>
    </div>
);

const CoinDetailPage: React.FC<CoinDetailPageProps> = ({ coinId, onBack }) => {
    // DEĞİŞİKLİK: State'leri yeni veri yapımıza göre güncelliyoruz
    const [coinData, setCoinData] = useState<CoinDetail | null>(null);
    const [tradingViewSymbol, setTradingViewSymbol] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [animationClass, setAnimationClass] = useState('');
    const prevPriceRef = useRef<number>();

    useEffect(() => {
        if (!coinId) return;

        const fetchAssetData = async () => {
            try {
                // Her yeni istekte eski hataları temizle
                setError(null); 
                const data = await getCoinDetails(coinId);
                setCoinData(data);

                // --- EN ÖNEMLİ KISIM: TradingView Sembolünü Oluşturma ---
                // CoinGecko'dan gelen kısa sembolü (btc, eth) alıp TradingView formatına çeviriyoruz.
                // Genellikle BINANCE veya COINBASE borsaları ve USDT/USD pariteleri en iyi sonucu verir.
                const symbol = data.symbol.toUpperCase();
                setTradingViewSymbol(`BINANCE:${symbol}USDT`);

            } catch (error) {
                console.error("Failed to fetch asset data:", error);
                setError("Coin detayları alınamadı veya bu coin için bir grafik bulunamadı.");
            } finally {
                // Sadece ilk yüklemede loading state'ini kapatıyoruz.
                if (isLoading) {
                    setIsLoading(false);
                }
            }
        };
        
        setIsLoading(true);
        fetchAssetData();
        
        const intervalId = setInterval(fetchAssetData, 30000); // Poll every 30 seconds

        return () => clearInterval(intervalId);
    }, [coinId]);

    // Fiyat flaş animasyonu için useEffect
    useEffect(() => {
        if (coinData?.market_data?.current_price?.usd) {
            const currentPrice = coinData.market_data.current_price.usd;

            if (prevPriceRef.current !== undefined) {
                if (currentPrice > prevPriceRef.current) {
                    setAnimationClass('animate-flash-green');
                } else if (currentPrice < prevPriceRef.current) {
                    setAnimationClass('animate-flash-red');
                }
            }
            prevPriceRef.current = currentPrice;

            const timer = setTimeout(() => setAnimationClass(''), 1500);
            return () => clearTimeout(timer);
        }
    }, [coinData]);


    const handleTradeAction = (type: 'Buy' | 'Sell') => {
        alert(`Simulating ${type} action for ${coinData?.name}.`);
    }

    if (isLoading) {
        // Eski 'Header' içindeki iskelet yükleyiciyi ana bileşene taşıdık
        return (
            <div className="p-8 space-y-8 animate-pulse">
                <div className="h-6 w-32 bg-border-color rounded mb-4"></div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-border-color"></div>
                    <div><div className="h-7 w-48 bg-border-color rounded"></div></div>
                </div>
                <div className="h-10 w-64 bg-border-color rounded mb-2"></div>
                <div className="h-6 w-32 bg-border-color rounded"></div>
                <div className="h-96 w-full bg-border-color rounded-lg mt-8"></div> {/* Grafik için iskelet */}
            </div>
        );
    }
    
    if (error || !coinData) {
         return (
             <div className="p-8 text-center">
                 <button onClick={onBack} className="text-sm text-primary hover:underline mb-4">&larr; Back to Market</button>
                 <div className="text-danger mt-4">{error || 'Veri bulunamadı.'}</div>
             </div>
         )
    }

    // DEĞİŞİKLİK: Tüm veri alanlarını yeni 'coinData' state'inden alıyoruz.
    const priceData = coinData.market_data;
    const isPositive = priceData.price_change_percentage_24h >= 0;
    
    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <button onClick={onBack} className="text-sm text-primary hover:underline mb-4">&larr; Back to Market</button>
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <img src={coinData.image.large} alt={coinData.name} className="w-12 h-12"/>
                            <h1 className="text-3xl font-bold text-white">{coinData.name} ({coinData.symbol.toUpperCase()})</h1>
                        </div>
                        <div className={`p-1 rounded-lg ${animationClass} inline-block`}>
                            <span className="text-4xl font-bold text-white">${priceData.current_price.usd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: priceData.current_price.usd > 1 ? 2 : 8})}</span>
                            <span className={`ml-3 text-lg font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>{isPositive ? '▲' : '▼'} {priceData.price_change_percentage_24h.toFixed(2)}%</span>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <input type="number" placeholder="Amount" className="bg-surface border border-border-color rounded-md px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-primary"/>
                         <button onClick={() => handleTradeAction('Buy')} className="bg-success text-white font-bold py-2 px-6 rounded-md hover:bg-green-600 transition-colors">Buy</button>
                         <button onClick={() => handleTradeAction('Sell')} className="bg-danger text-white font-bold py-2 px-6 rounded-md hover:bg-red-600 transition-colors">Sell</button>
                    </div>
                </div>
                 <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 border-t border-border-color pt-4">
                    <StatItem label="MARKET CAP" value={formatLargeNumber(priceData.market_cap.usd)} />
                    <StatItem label="24H LOW / 24H HIGH" value={`${formatLargeNumber(priceData.low_24h.usd)} / ${formatLargeNumber(priceData.high_24h.usd)}`} />
                    <StatItem label="VOLUME (24H)" value={formatLargeNumber(priceData.total_volume.usd)} />
                    <StatItem label="CIRCULATING SUPPLY" value={formatLargeNumber(coinData.market_data.circulating_supply, '')} />
                </div>
            </div>

            {/* DEĞİŞİKLİK: Grafik bileşenine oluşturduğumuz yeni ve geçerli sembolü gönderiyoruz. */}
            {tradingViewSymbol && <AdvancedPriceChart symbol={tradingViewSymbol} />}
        </div>
    );
};

export default CoinDetailPage;