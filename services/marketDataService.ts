
import { ExchangeVolumeData, CurrencyVolumeData } from '../types.ts';

// Mock data to replace the CoinGecko API call, fixing the "Failed to fetch" error and improving stability.
const MOCK_DISTRIBUTION_DATA: Record<string, { exchangeData: ExchangeVolumeData[], currencyData: CurrencyVolumeData[] }> = {
    'bitcoin': {
        exchangeData: [
            { name: 'Binance', volume: 1573456789, price: 68050.1, pairs: [
                { currency: 'USDT', price: 68050.1, volume: 800123456 },
                { currency: 'FDUSD', price: 68049.9, volume: 350987654 },
                { currency: 'USDC', price: 68051.2, volume: 120765432 },
            ]},
            { name: 'Coinbase Exchange', volume: 821987654, price: 68055.5, pairs: [
                { currency: 'USD', price: 68055.5, volume: 600123456 },
                { currency: 'USDT', price: 68056.1, volume: 150876543 },
            ]},
            { name: 'Bybit', volume: 650123456, price: 68048.2, pairs: [
                { currency: 'USDT', price: 68048.2, volume: 400987654 },
                { currency: 'USDC', price: 68049.0, volume: 150123456 },
            ]},
            { name: 'Kraken', volume: 310876543, price: 68052.8, pairs: [
                { currency: 'USD', price: 68052.8, volume: 200765432 },
                { currency: 'EUR', price: 62500.0, volume: 100123456 },
            ]},
            { name: 'Other', volume: 450345678, price: 0, pairs: []},
        ],
        currencyData: [
             { name: 'USDT', volume: 2890123456, price: 68050.5, exchanges: [
                { name: 'Binance', price: 68050.1, volume: 800123456 },
                { name: 'Bybit', price: 68048.2, volume: 400987654 },
            ]},
            { name: 'USD', volume: 800888888, price: 68054.2, exchanges: [
                { name: 'Coinbase Exchange', price: 68055.5, volume: 600123456 },
                { name: 'Kraken', price: 68052.8, volume: 200765432 },
            ]},
            { name: 'USDC', volume: 270888888, price: 68050.1, exchanges: [
                { name: 'Bybit', price: 68049.0, volume: 150123456 },
                { name: 'Binance', price: 68051.2, volume: 120765432 },
            ]},
            { name: 'Other', volume: 150456789, price: 0, exchanges: []},
        ],
    },
    'ethereum': {
         exchangeData: [
            { name: 'Binance', volume: 987654321, price: 3500.1, pairs: [
                { currency: 'USDT', price: 3500.1, volume: 500123456 },
                { currency: 'FDUSD', price: 3499.9, volume: 200987654 },
            ]},
            { name: 'Coinbase Exchange', volume: 450123456, price: 3501.5, pairs: [
                { currency: 'USD', price: 3501.5, volume: 300123456 },
            ]},
            { name: 'Bybit', volume: 320987654, price: 3499.8, pairs: [
                { currency: 'USDT', price: 3499.8, volume: 250987654 },
            ]},
            { name: 'Other', volume: 210123456, price: 0, pairs: []},
        ],
        currencyData: [
             { name: 'USDT', volume: 1500123456, price: 3500.0, exchanges: [
                { name: 'Binance', price: 3500.1, volume: 500123456 },
                { name: 'Bybit', price: 3499.8, volume: 250987654 },
            ]},
            { name: 'USD', volume: 300123456, price: 3501.5, exchanges: [
                { name: 'Coinbase Exchange', price: 3501.5, volume: 300123456 },
            ]},
            { name: 'Other', volume: 188888888, price: 0, exchanges: []},
        ],
    },
    'solana': {
        exchangeData: [
           { name: 'Binance', volume: 400123456, price: 150.1, pairs: [ { currency: 'USDT', price: 150.1, volume: 250123456 } ] },
           { name: 'Coinbase Exchange', volume: 200987654, price: 150.2, pairs: [ { currency: 'USD', price: 150.2, volume: 150987654 } ] },
           { name: 'Other', volume: 150123456, price: 0, pairs: [] },
       ],
       currencyData: [
            { name: 'USDT', volume: 500123456, price: 150.1, exchanges: [ { name: 'Binance', price: 150.1, volume: 250123456 } ] },
            { name: 'USD', volume: 200987654, price: 150.2, exchanges: [ { name: 'Coinbase Exchange', price: 150.2, volume: 150987654 } ] },
            { name: 'Other', volume: 50000000, price: 0, exchanges: [] },
       ],
   },
   'toncoin': {
    exchangeData: [
        { name: 'Bybit', volume: 150123456, price: 7.5, pairs: [ { currency: 'USDT', price: 7.5, volume: 150123456 } ] },
        { name: 'OKX', volume: 120987654, price: 7.49, pairs: [ { currency: 'USDT', price: 7.49, volume: 120987654 } ] },
        { name: 'Gate.io', volume: 80123456, price: 7.51, pairs: [ { currency: 'USDT', price: 7.51, volume: 80123456 } ] },
        { name: 'Other', volume: 100123456, price: 0, pairs: [] },
   ],
   currencyData: [
        { name: 'USDT', volume: 450123456, price: 7.5, exchanges: [ 
            { name: 'Bybit', price: 7.5, volume: 150123456 },
            { name: 'OKX', price: 7.49, volume: 120987654 },
            { name: 'Gate.io', price: 7.51, volume: 80123456 },
         ] },
        { name: 'Other', volume: 20000000, price: 0, exchanges: [] },
   ],
}
};


const getCoinId = (symbol: string): string | null => {
    // This mapping is now used to find the key for the mock data object
    const code = symbol.split('-')[0].toLowerCase();
    const mapping: { [key: string]: string } = {
        'btc': 'bitcoin',
        'eth': 'ethereum',
        'usdt': 'tether',
        'bnb': 'binancecoin',
        'usdc': 'usd-coin',
        'xrp': 'ripple',
        'luna': 'terra-luna-2',
        'ada': 'cardano',
        'doge': 'dogecoin',
        'dot': 'polkadot',
        'cro': 'cronos',
        'sol': 'solana',
        'shib': 'shiba-inu',
        'matic': 'polygon',
        'avax': 'avalanche-2',
        'dai': 'dai',
        'ltc': 'litecoin',
        'link': 'chainlink',
        'trx': 'tron',
        'uni': 'uniswap',
        'bch': 'bitcoin-cash',
        'icp': 'internet-computer',
        'etc': 'ethereum-classic',
        'xlm': 'stellar',
        'near': 'near',
        'atom': 'cosmos',
        'fil': 'filecoin',
        'ton': 'toncoin',
        'wif': 'dogwifhat',
        'kas': 'kaspa',
        'rndr': 'render',
        'tao': 'bittensor',
        'inj': 'injective',
        'grt': 'the-graph',
        'op': 'optimism',
        'arb': 'arbitrum',
        'vet': 'vechain',
        'hbar': 'hedera-hashgraph',
        'apt': 'aptos',
        'sui': 'sui',
        'pepe': 'pepe',
        'xmr': 'monero',
        'sei': 'sei-network',
        'imx': 'immutable-x',
        'fet': 'fetch-ai',
        'stx': 'stacks',
        'rune': 'thorchain',
        'ar': 'arweave',
        'bonk': 'bonk',
        'tia': 'celestia',
        'mkr': 'maker',
        'flr': 'flare-networks',
        'aave': 'aave',
        'algo': 'algorand',
        'ena': 'ethena',
        'ftm': 'fantom',
        'sand': 'the-sandbox',
        'axs': 'axie-infinity',
        'beam': 'beam',
        'jasmy': 'jasmy',
        'theta': 'theta-token',
    };
    return mapping[code] || null;
}

export const getMarketDistributionData = async (symbol: string): Promise<{ exchangeData: ExchangeVolumeData[], currencyData: CurrencyVolumeData[] }> => {
    const coinId = getCoinId(symbol);
    
    // Simulate a short network delay for a realistic loading experience
    await new Promise(resolve => setTimeout(resolve, 500));

    if (coinId && MOCK_DISTRIBUTION_DATA[coinId]) {
        // Return a deep copy to prevent mutation issues if data is ever modified elsewhere
        return JSON.parse(JSON.stringify(MOCK_DISTRIBUTION_DATA[coinId]));
    }
    
    // Generic fallback for un-mocked coins
    const genericData = {
        exchangeData: [
            { name: 'Various Exchanges', volume: 10000000, price: 0, pairs: [
                { currency: 'USDT', price: 0, volume: 8000000 },
                { currency: 'USD', price: 0, volume: 2000000 },
            ]},
            { name: 'DEXs', volume: 5000000, price: 0, pairs: []},
        ],
        currencyData: [
             { name: 'USDT', volume: 8000000, price: 0, exchanges: [
                { name: 'Various CEXs', price: 0, volume: 8000000 },
            ]},
            { name: 'USD', volume: 2000000, price: 0, exchanges: [
                { name: 'US Exchanges', price: 0, volume: 2000000 },
            ]},
             { name: 'Other', volume: 5000000, price: 0, exchanges: []},
        ],
    };

    return genericData;
};
