
import { EodHistoricalData, EodRealTimeData, PriceDataPoint, CryptoData } from '../types.ts';

const API_KEY = '68232b06c02021.33904755';
const BASE_URL = 'https://eodhistoricaldata.com/api';

// Helper to add a delay
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * A wrapper around fetch that retries the request on failure with exponential backoff.
 * @param url The URL to fetch.
 * @param retries Number of retries.
 * @param backoff Initial backoff delay in ms.
 * @returns A Promise that resolves to the Response.
 */
async function fetchWithRetry(url: string, retries = 3, backoff = 300): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                // Throw an error for non-2xx responses to trigger a retry
                throw new Error(`API returned status ${response.status}: ${response.statusText}`);
            }
            return response;
        } catch (error) {
            if (i === retries - 1) {
                console.error(`Final fetch attempt for ${url} failed.`);
                throw error;
            }
            const delay = backoff * (2 ** i); // Exponential backoff
            console.warn(`Fetch attempt ${i + 1} for ${url} failed. Retrying in ${delay}ms...`);
            await wait(delay);
        }
    }
    // This line is technically unreachable due to the loop and throw, but satisfies TypeScript's need for a return path.
    throw new Error("Fetch failed after multiple retries");
}


// Helper to map API symbol to display name
export const getCryptoDetails = (symbol: string) => {
    const code = symbol.split('.')[0]; // e.g., BTC-USD
    switch(code) {
        case 'BTC-USD': return { name: 'Bitcoin', shortName: 'BTC' };
        case 'ETH-USD': return { name: 'Ethereum', shortName: 'ETH' };
        case 'USDT-USD': return { name: 'Tether', shortName: 'USDT' };
        case 'BNB-USD': return { name: 'Binance Coin', shortName: 'BNB' };
        case 'USDC-USD': return { name: 'USCoin', shortName: 'USDC' };
        case 'XRP-USD': return { name: 'XRP', shortName: 'XRP' };
        case 'LUNA-USD': return { name: 'Luna', shortName: 'LUNA' };
        case 'ADA-USD': return { name: 'Cardano', shortName: 'ADA' };
        case 'DOGE-USD': return { name: 'Dogecoin', shortName: 'DOGE' };
        case 'DOT-USD': return { name: 'Polkadot', shortName: 'DOT' };
        case 'CRO-USD': return { name: 'Crypto.com Chain', shortName: 'CRO' };
        case 'SOL-USD': return { name: 'Solana', shortName: 'SOL' };
        case 'SHIB-USD': return { name: 'Shiba Inu', shortName: 'SHIB' };
        case 'MATIC-USD': return { name: 'Polygon', shortName: 'MATIC' };
        case 'AVAX-USD': return { name: 'Avalanche', shortName: 'AVAX' };
        case 'DAI-USD': return { name: 'Dai', shortName: 'DAI' };
        case 'LTC-USD': return { name: 'Litecoin', shortName: 'LTC' };
        case 'LINK-USD': return { name: 'Chainlink', shortName: 'LINK' };
        case 'TRX-USD': return { name: 'TRON', shortName: 'TRX' };
        case 'UNI-USD': return { name: 'Uniswap', shortName: 'UNI' };
        case 'BCH-USD': return { name: 'Bitcoin Cash', shortName: 'BCH' };
        case 'ICP-USD': return { name: 'Internet Computer', shortName: 'ICP' };
        case 'ETC-USD': return { name: 'Ethereum Classic', shortName: 'ETC' };
        case 'XLM-USD': return { name: 'Stellar', shortName: 'XLM' };
        case 'NEAR-USD': return { name: 'NEAR Protocol', shortName: 'NEAR' };
        case 'ATOM-USD': return { name: 'Cosmos', shortName: 'ATOM' };
        case 'FIL-USD': return { name: 'Filecoin', shortName: 'FIL' };
        case 'TON-USD': return { name: 'Toncoin', shortName: 'TON' };
        case 'WIF-USD': return { name: 'dogwifhat', shortName: 'WIF' };
        case 'KAS-USD': return { name: 'Kaspa', shortName: 'KAS' };
        case 'RNDR-USD': return { name: 'Render', shortName: 'RNDR' };
        case 'TAO-USD': return { name: 'Bittensor', shortName: 'TAO' };
        case 'INJ-USD': return { name: 'Injective', shortName: 'INJ' };
        case 'GRT-USD': return { name: 'The Graph', shortName: 'GRT' };
        case 'OP-USD': return { name: 'Optimism', shortName: 'OP' };
        case 'ARB-USD': return { name: 'Arbitrum', shortName: 'ARB' };
        case 'VET-USD': return { name: 'VeChain', shortName: 'VET' };
        case 'HBAR-USD': return { name: 'Hedera', shortName: 'HBAR' };
        case 'APT-USD': return { name: 'Aptos', shortName: 'APT' };
        case 'SUI-USD': return { name: 'Sui', shortName: 'SUI' };
        case 'PEPE-USD': return { name: 'Pepe', shortName: 'PEPE' };
        case 'XMR-USD': return { name: 'Monero', shortName: 'XMR' };
        case 'SEI-USD': return { name: 'Sei', shortName: 'SEI' };
        case 'IMX-USD': return { name: 'Immutable', shortName: 'IMX' };
        case 'FET-USD': return { name: 'Fetch.ai', shortName: 'FET' };
        case 'STX-USD': return { name: 'Stacks', shortName: 'STX' };
        case 'RUNE-USD': return { name: 'THORChain', shortName: 'RUNE' };
        case 'AR-USD': return { name: 'Arweave', shortName: 'AR' };
        case 'BONK-USD': return { name: 'Bonk', shortName: 'BONK' };
        case 'TIA-USD': return { name: 'Celestia', shortName: 'TIA' };
        case 'MKR-USD': return { name: 'Maker', shortName: 'MKR' };
        case 'FLR-USD': return { name: 'Flare', shortName: 'FLR' };
        case 'AAVE-USD': return { name: 'Aave', shortName: 'AAVE' };
        case 'ALGO-USD': return { name: 'Algorand', shortName: 'ALGO' };
        case 'ENA-USD': return { name: 'Ethena', shortName: 'ENA' };
        case 'FTM-USD': return { name: 'Fantom', shortName: 'FTM' };
        case 'SAND-USD': return { name: 'The Sandbox', shortName: 'SAND' };
        case 'AXS-USD': return { name: 'Axie Infinity', shortName: 'AXS' };
        case 'BEAM-USD': return { name: 'Beam', shortName: 'BEAM' };
        case 'JASMY-USD': return { name: 'JasmyCoin', shortName: 'JASMY' };
        case 'THETA-USD': return { name: 'Theta Network', shortName: 'THETA' };
        default: return { name: code, shortName: code.split('-')[0] };
    }
};

export const getHistoricalData = async (symbol: string = 'BTC-USD.CC', period: 'd' | 'h' = 'd'): Promise<PriceDataPoint[]> => {
    try {
        const to = new Date();
        const from = new Date();
        
        let url;
        if (period === 'h') {
             from.setDate(from.getDate() - 60); // Max 60 days for hourly
             url = `${BASE_URL}/intraday/${symbol}?interval=1h&from=${Math.floor(from.getTime() / 1000)}&to=${Math.floor(to.getTime()/1000)}&api_token=${API_KEY}&fmt=json`;
        } else {
             from.setFullYear(from.getFullYear() - 5); // 5 years for daily
             url = `${BASE_URL}/eod/${symbol}?from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}&api_token=${API_KEY}&period=d&fmt=json`;
        }

        const response = await fetchWithRetry(url);
        const data: EodHistoricalData[] = await response.json();
        
        if (!Array.isArray(data)) {
            console.warn("Historical data response is not an array:", data);
            return [];
        }

        return data.map(d => ({
            date: d.date,
            price: d.close,
            volume: d.volume,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));
    } catch (error) {
        console.error("Failed to fetch historical data:", error instanceof Error ? error.message : String(error));
        // Return mock data on failure to allow UI to function
        const mockData: PriceDataPoint[] = [];
        let price = 50000;
        for (let i=365; i>0; i--) {
            price = price * (1 + (Math.random() - 0.48) * 0.1);
            mockData.push({
                date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
                price: price,
                volume: Math.random() * 1000000000,
                open: price * (1 - (Math.random() - 0.5) * 0.02),
                high: price * (1 + Math.random() * 0.03),
                low: price * (1 - Math.random() * 0.03),
                close: price,
            });
        }
        return mockData;
    }
};

export const MOCK_SUPPLIES: {[key: string]: {circulating: number, max?: number}} = {
    'BTC-USD': { circulating: 19716000, max: 21000000 },
    'ETH-USD': { circulating: 120070000 },
    'USDT-USD': { circulating: 112000000000 },
    'BNB-USD': { circulating: 147500000 },
    'USDC-USD': { circulating: 33000000000 },
    'XRP-USD': { circulating: 55600000000, max: 100000000000 },
    'LUNA-USD': { circulating: 5790000000000 },
    'ADA-USD': { circulating: 35700000000, max: 45000000000 },
    'DOGE-USD': { circulating: 144000000000 },
    'DOT-USD': { circulating: 1400000000 },
    'CRO-USD': { circulating: 26000000000, max: 30263000000 },
    'SOL-USD': { circulating: 462000000 },
    'SHIB-USD': { circulating: 589000000000000 },
    'MATIC-USD': { circulating: 9280000000, max: 10000000000 },
    'AVAX-USD': { circulating: 393000000, max: 720000000 },
    'DAI-USD': { circulating: 5340000000 },
    'LTC-USD': { circulating: 74000000, max: 84000000 },
    'LINK-USD': { circulating: 587000000, max: 1000000000 },
    'TRX-USD': { circulating: 87000000000 },
    'UNI-USD': { circulating: 753000000, max: 1000000000 },
    'BCH-USD': { circulating: 19700000, max: 21000000 },
    'ICP-USD': { circulating: 465000000 },
    'ETC-USD': { circulating: 147000000, max: 210700000 },
    'XLM-USD': { circulating: 29000000000, max: 50000000000 },
    'NEAR-USD': { circulating: 1000000000, max: 1180000000 },
    'ATOM-USD': { circulating: 390000000 },
    'FIL-USD': { circulating: 564000000, max: 1960000000 },
    'TON-USD': { circulating: 3470000000, max: 5100000000 },
    'WIF-USD': { circulating: 999000000, max: 999000000 },
    'KAS-USD': { circulating: 24000000000, max: 28700000000 },
    'RNDR-USD': { circulating: 388000000, max: 531000000 },
    'TAO-USD': { circulating: 6900000, max: 21000000 },
    'INJ-USD': { circulating: 93400000, max: 100000000 },
    'GRT-USD': { circulating: 9500000000, max: 10700000000 },
    'OP-USD': { circulating: 1100000000, max: 4290000000 },
    'ARB-USD': { circulating: 2900000000, max: 10000000000 },
    'VET-USD': { circulating: 72700000000, max: 86700000000 },
    'HBAR-USD': { circulating: 35700000000, max: 50000000000 },
    'APT-USD': { circulating: 425000000 },
    'SUI-USD': { circulating: 2300000000, max: 10000000000 },
    'PEPE-USD': { circulating: 420690000000000, max: 420690000000000 },
    'XMR-USD': { circulating: 18400000 },
    'SEI-USD': { circulating: 2800000000, max: 10000000000 },
    'IMX-USD': { circulating: 1500000000, max: 2000000000 },
    'FET-USD': { circulating: 862000000, max: 2600000000 },
    'STX-USD': { circulating: 1460000000 },
    'RUNE-USD': { circulating: 334000000, max: 500000000 },
    'AR-USD': { circulating: 65000000, max: 66000000 },
    'BONK-USD': { circulating: 65000000000000, max: 93000000000000 },
    'TIA-USD': { circulating: 192000000 },
    'MKR-USD': { circulating: 925000, max: 1000000 },
    'FLR-USD': { circulating: 42000000000 },
    'AAVE-USD': { circulating: 14800000, max: 16000000 },
    'ALGO-USD': { circulating: 8100000000, max: 10000000000 },
    'ENA-USD': { circulating: 1420000000, max: 15000000000 },
    'FTM-USD': { circulating: 2800000000, max: 3175000000 },
    'SAND-USD': { circulating: 2200000000, max: 3000000000 },
    'AXS-USD': { circulating: 146000000, max: 270000000 },
    'BEAM-USD': { circulating: 49000000000, max: 62000000000 },
    'JASMY-USD': { circulating: 49000000000, max: 50000000000 },
    'THETA-USD': { circulating: 1000000000, max: 1000000000 },
};

export const getRealTimePrices = async (symbols: string[]): Promise<CryptoData[]> => {
    if (symbols.length === 0) return [];
    try {
        const symbolString = symbols.join(',');
        const url = `${BASE_URL}/real-time/${symbolString}?api_token=${API_KEY}&fmt=json`;
        const response = await fetchWithRetry(url);
        
        const data: EodRealTimeData[] | EodRealTimeData = await response.json();
        
        const results = Array.isArray(data) ? data : [data];

        return results
            .filter(d => d && typeof d.close === 'number')
            .map((d) => {
                const sparklineBase = d.close / (1 + d.change_p / 100);
                const sparklineData = Array.from({ length: 30 }, (_, i) => {
                    const volatility = (Math.random() - 0.45) * 0.05;
                    const trend = (d.change_p / 100) * (i / 29);
                    return sparklineBase * (1 + trend + volatility);
                });
                sparklineData[29] = d.close;

                const shortCode = d.code.split('.')[0];
                const supplyInfo = MOCK_SUPPLIES[shortCode.replace('.CC','')] || { circulating: 1000000000, max: undefined };
                const marketCap = d.close * supplyInfo.circulating;
                
                return {
                    rank: 0, // Placeholder, will be set after sorting
                    symbol: d.code,
                    name: getCryptoDetails(d.code).name,
                    price: d.close,
                    change24h: d.change_p,
                    volume24h: d.volume,
                    marketCap: marketCap,
                    sparkline: sparklineData,
                    previousPrice: d.previousClose,
                    low24h: d.low,
                    high24h: d.high,
                    circulatingSupply: supplyInfo.circulating,
                    maxSupply: supplyInfo.max,
                }
            })
            .sort((a,b) => b.marketCap - a.marketCap)
            .map((d, index) => ({...d, rank: index + 1 }));

    } catch (error) {
        console.error("Failed to fetch real-time prices:", error instanceof Error ? error.message : String(error));
        return [];
    }
};
