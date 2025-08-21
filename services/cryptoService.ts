
import { PriceDataPoint, CryptoData } from '../types.ts';

// As per the prompt, using the 20 specified cryptocurrencies.
const SPECIFIED_COINS = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
    { id: 'ripple', symbol: 'XRP', name: 'Ripple' },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
    { id: 'solana', symbol: 'SOL', name: 'Solana' },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
    { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
    { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin' },
    { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
    { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
    { id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash' },
    { id: 'stellar', symbol: 'XLM', name: 'Stellar' },
    { id: 'uniswap', symbol: 'UNI', name: 'Uniswap' },
    { id: 'aave', symbol: 'AAVE', name: 'Aave' },
    { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos' },
    { id: 'tezos', symbol: 'XTZ', name: 'Tezos' },
    { id: 'tron', symbol: 'TRX', name: 'Tron' },
    { id: 'eos', symbol: 'EOS', name: 'EOS' },
    { id: 'monero', symbol: 'XMR', name: 'Monero' },
    { id: 'vechain', symbol: 'VET', name: 'VeChain' }
];

// In-memory store for previous prices to allow for UI animations
let cachedData: CryptoData[] | null = null;

// Use the user-provided realistic data as a baseline for our mock service.
const REALISTIC_MOCK_DATA = {
    "bitcoin": { "usd": 68542, "usd_market_cap": 1350987114321.12, "usd_24h_vol": 24531123456.78, "usd_24h_change": -1.25345, "last_updated_at": 1755602192 },
    "ethereum": { "usd": 3588.1, "usd_market_cap": 431123456789.01, "usd_24h_vol": 15123456789.12, "usd_24h_change": 0.89765, "last_updated_at": 1755602192 },
    "ripple": { "usd": 0.5234, "usd_market_cap": 28987654321.98, "usd_24h_vol": 1234567890.12, "usd_24h_change": -2.15432, "last_updated_at": 1755602192 },
    "cardano": { "usd": 0.4567, "usd_market_cap": 16234567890.45, "usd_24h_vol": 456789012.34, "usd_24h_change": 1.78901, "last_updated_at": 1755602192 },
    "solana": { "usd": 150.75, "usd_market_cap": 69876543210.87, "usd_24h_vol": 2345678901.23, "usd_24h_change": 3.45678, "last_updated_at": 1755602192 },
    "dogecoin": { "usd": 0.1588, "usd_market_cap": 22876543210.65, "usd_24h_vol": 987654321.09, "usd_24h_change": -0.54321, "last_updated_at": 1755602192 },
    "polkadot": { "usd": 7.15, "usd_market_cap": 9987654321.43, "usd_24h_vol": 234567890.12, "usd_24h_change": 2.12345, "last_updated_at": 1755602192 },
    "binancecoin": { "usd": 605.2, "usd_market_cap": 89123456789.54, "usd_24h_vol": 1876543210.98, "usd_24h_change": -0.98765, "last_updated_at": 1755602192 },
    "chainlink": { "usd": 17.85, "usd_market_cap": 10543210987.65, "usd_24h_vol": 567890123.45, "usd_24h_change": 4.56789, "last_updated_at": 1755602192 },
    "litecoin": { "usd": 85.4, "usd_market_cap": 6345678901.23, "usd_24h_vol": 432109876.54, "usd_24h_change": 0.12345, "last_updated_at": 1755602192 },
    "bitcoin-cash": { "usd": 480.5, "usd_market_cap": 9456789012.34, "usd_24h_vol": 321098765.43, "usd_24h_change": -1.87654, "last_updated_at": 1755602192 },
    "stellar": { "usd": 0.112, "usd_market_cap": 3210987654.32, "usd_24h_vol": 87654321.09, "usd_24h_change": 1.23456, "last_updated_at": 1755602192 },
    "uniswap": { "usd": 10.25, "usd_market_cap": 7654321098.76, "usd_24h_vol": 210987654.32, "usd_24h_change": 5.4321, "last_updated_at": 1755602192 },
    "aave": { "usd": 95.8, "usd_market_cap": 1423456789.01, "usd_24h_vol": 98765432.1, "usd_24h_change": 3.21098, "last_updated_at": 1755602192 },
    "cosmos": { "usd": 8.5, "usd_market_cap": 3321098765.43, "usd_24h_vol": 123456789.01, "usd_24h_change": 0.98765, "last_updated_at": 1755602192 },
    "tezos": { "usd": 0.98, "usd_market_cap": 954321098.76, "usd_24h_vol": 45678901.23, "usd_24h_change": -0.87654, "last_updated_at": 1755602192 },
    "tron": { "usd": 0.12, "usd_market_cap": 10432109876.54, "usd_24h_vol": 345678901.23, "usd_24h_change": 0.12345, "last_updated_at": 1755602192 },
    "eos": { "usd": 0.85, "usd_market_cap": 921098765.43, "usd_24h_vol": 234567890.12, "usd_24h_change": -2.34567, "last_updated_at": 1755602192 },
    "monero": { "usd": 140.2, "usd_market_cap": 2587654321.09, "usd_24h_vol": 76543210.98, "usd_24h_change": 0.56789, "last_updated_at": 1755602192 },
    "vechain": { "usd": 0.035, "usd_market_cap": 2876543210.98, "usd_24h_vol": 54321098.76, "usd_24h_change": 1.98765, "last_updated_at": 1755602192 }
};

export const getCryptoDetails = (symbol: string) => {
    const code = symbol.split('-')[0].toUpperCase();
    const coinData = SPECIFIED_COINS.find(c => c.symbol === code);
    return { 
        name: coinData?.name || code, 
        shortName: code 
    };
};

export const getHistoricalData = async (symbol: string): Promise<PriceDataPoint[]> => {
    // This can remain a mock as the user only specified changing the real-time data
    const prices = await getRealTimePrices([symbol]);
    const basePrice = prices.length > 0 ? prices[0].price : 50000;

    const mockData: PriceDataPoint[] = [];
    let price = basePrice;
    for (let i = 365 * 2; i > 0; i--) {
        price = price / (1 + (Math.random() - 0.49) * 0.05); // Work backwards from current price
        const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
        mockData.push({
            date: date,
            price: price,
            volume: Math.random() * 1000000000,
            open: price * (1 - (Math.random() - 0.5) * 0.02),
            high: price * (1 + Math.random() * 0.03),
            low: price * (1 - Math.random() * 0.03),
            close: price,
        });
    }
    return new Promise(resolve => setTimeout(() => resolve(mockData), 300));
};


export const getRealTimePrices = async (symbols?: string[]): Promise<CryptoData[]> => {
    try {
        const data = REALISTIC_MOCK_DATA;

        const transformedData = SPECIFIED_COINS.map((coinInfo): CryptoData | null => {
            const apiData = data[coinInfo.id as keyof typeof data];
            if (!apiData) return null;

            // Add a small fluctuation to the realistic data to make the UI feel live
            const price = apiData.usd * (1 + (Math.random() - 0.5) * 0.001); // +/- 0.05% fluctuation
            const change24h = apiData.usd_24h_change;
            const marketCap = apiData.usd_market_cap;
            
            // Generate a mock sparkline
            const sparklineData = Array.from({ length: 30 }, (_, i) => {
                const volatility = (Math.random() - 0.45) * 0.05; // -2.5% to +2.5% volatility
                const trend = (change24h / 100) * (i / 29);
                return price / (1 + change24h / 100) * (1 + trend + volatility);
            });
            sparklineData[29] = price; // Ensure the last point is the current price

            return {
                rank: 0, // Will be set after sorting
                symbol: `${coinInfo.symbol}-USD`,
                name: coinInfo.name,
                price: price,
                previousPrice: cachedData?.find(c => c.symbol === `${coinInfo.symbol}-USD`)?.price,
                change24h: change24h,
                volume24h: apiData.usd_24h_vol,
                marketCap: marketCap,
                sparkline: sparklineData,
                low24h: price * (1 - Math.abs(change24h/200) - 0.02),
                high24h: price * (1 + Math.abs(change24h/200) + 0.02),
                circulatingSupply: marketCap && price ? marketCap / price : 0,
                maxSupply: undefined,
            };
        }).filter((c): c is CryptoData => c !== null);
        
        // Sort by market cap and assign rank
        const sortedData = transformedData
            .sort((a, b) => b.marketCap - a.marketCap)
            .map((coin, index) => ({ ...coin, rank: index + 1 }));
        
        // Ensure previousPrice has a value for the animation on first load
        sortedData.forEach(coin => {
            if (coin.previousPrice === undefined) {
                coin.previousPrice = coin.price / (1 + coin.change24h / 100);
            }
        });

        cachedData = JSON.parse(JSON.stringify(sortedData)); // Update cache for next comparison

        if (symbols && symbols.length > 0) {
            return sortedData.filter(coin => symbols.includes(coin.symbol));
        }
        return sortedData;

    } catch (error) {
        console.error("Error processing mock real-time prices:", error);
        return [];
    }
};
