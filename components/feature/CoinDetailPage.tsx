import React, { useState, useEffect, useRef } from 'react';
import AdvancedPriceChart from '../charts/AdvancedPriceChart.tsx';
import { getCoinDetails } from '../../services/coinGeckoService.ts';
import { CoinDetail } from '../../types.ts';

interface CoinDetailPageProps {
    coinId: string;
    onBack: () => void;
}

// Bu yardımcı fonksiyon, bir coin sembolünü en olası TradingView sembolüne dönüştürür.
const getBestTradingViewSymbol = (symbol: string): string => {
    const upperSymbol = symbol.toUpperCase();

    // 1. ÖNCELİK: Karşılaştığımız özel durumlar için kesin kurallar
    const overrides: { [key: string]: string } = {
        'STETH': 'OKX:STETHUSD',     // YENİ EKLENEN KURAL
        'HYPE': 'PYTH:HYPEUSD',       
        'USDE': 'POLONIEX:USDEUSDT', 
        'WBETH': 'BINANCE:WBETHUSDT'
    };
    if (overrides[upperSymbol]) {
        return overrides[upperSymbol];
    }

    // 2. ÖNCELİK: Stabilcoinleri tanıma ve USD paritesiyle eşleştirme
    const stablecoins = ['USDT', 'USDC', 'DAI', 'TUSD', 'BUSD']; 
    if (stablecoins.includes(upperSymbol)) {
        return `COINBASE:${upperSymbol}USD`;
    }

    // 3. ÖNCELİK: En büyük kripto paralar için en temiz grafikler
    if (upperSymbol === 'BTC' || upperSymbol === 'ETH') {
        return `COINBASE:${upperSymbol}USD`;
    }

    // 4. ÖNCELİK (Varsayılan): Diğer tüm coin'ler için en geniş listeye sahip olan Binance'i dene
    return `BINANCE:${upperSymbol}USDT`;
};


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
    const [coinData, setCoinData] = useState<CoinDetail | null>(null);
    const [activeSymbol, setActiveSymbol] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [animationClass, setAnimationClass] = useState('');
    const prevPriceRef = useRef<number>();

    useEffect(() => {
        if (!coinId) return;

        const fetchAssetData = async () => {
            setIsLoading(true);
            setActiveSymbol(null);
            try {
                setError(null); 
                const data = await getCoinDetails(coinId);
                setCoinData(data);
                
                const bestSymbol = getBestTradingViewSymbol(data.symbol);
                setActiveSymbol(bestSymbol);

            } catch (err) {
                console.error("Failed to fetch asset data:", err);
                setError("Could not fetch coin details.");
                setCoinData(null);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchAssetData();
    }, [coinId]);

    // Fiyat flaş animasyonu
    useEffect(() => {
        if (coinData?.market_data?.current_price?.usd) {
            const currentPrice = coinData.market_data.current_price.usd;
            if (prevPriceRef.current !== undefined && prevPriceRef.current !== currentPrice) {
                setAnimationClass(currentPrice > prevPriceRef.current ? 'animate-flash-green' : 'animate-flash-red');
                const timer = setTimeout(() => setAnimationClass(''), 1500);
                return () => clearTimeout(timer);
            }
            prevPriceRef.current = currentPrice;
        }
    }, [coinData]);

    if (isLoading || !coinData) {
        return (
            <div className="p-8">
                <button onClick={onBack} className="text-sm text-primary hover:underline mb-4">&larr; Back to Market</button>
                <div className="bg-surface border border-border-color rounded-lg p-6 min-h-[600px] flex items-center justify-center">
                    {isLoading ? (
                         <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                         <p className="text-danger">{error || 'Data not found.'}</p>
                    )}
                </div>
            </div>
        );
    }

    const priceData = coinData.market_data;
    const isPositive = (priceData.price_change_percentage_24h ?? 0) >= 0;
    
    return (
        <div className="p-8 space-y-8">
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
                            <span className={`ml-3 text-lg font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>{isPositive ? '▲' : '▼'} {(priceData.price_change_percentage_24h ?? 0).toFixed(2)}%</span>
                        </div>
                    </div>
                </div>
                 <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 border-t border-border-color pt-4">
                    <StatItem label="MARKET CAP" value={formatLargeNumber(priceData.market_cap.usd)} />
                    <StatItem label="24H LOW / 24H HIGH" value={`${formatLargeNumber(priceData.low_24h.usd)} / ${formatLargeNumber(priceData.high_24h.usd)}`} />
                    <StatItem label="VOLUME (24H)" value={formatLargeNumber(priceData.total_volume.usd)} />
                    <StatItem label="CIRCULATING SUPPLY" value={formatLargeNumber(coinData.market_data.circulating_supply, '')} />
                </div>
            </div>

            {activeSymbol ? (
                 <AdvancedPriceChart symbol={activeSymbol} />
            ) : (
                 <div className="h-[500px] bg-surface border border-border-color rounded-lg flex items-center justify-center">
                     <p className="text-muted">A live chart is not available for this asset.</p>
                </div>
            )}
        </div>
    );
};

export default CoinDetailPage;