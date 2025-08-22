export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum DepositMethod {
  CRYPTO = 'Crypto',
  BANK = 'Bank Transfer',
}

export enum DepositStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

// --- CoinGecko API Types ---
export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null | {
    times: number;
    currency: string;
    percentage: number;
  };
  last_updated: string;
}

export interface CoinDetail extends Coin {
  description: {
    en: string;
  };
  links: {
    homepage: string[];
  };
  market_data: {
    total_supply: number;
    max_supply: number;
    circulating_supply: number;
  };
}


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  balance: number;
  holdings: Holding[];
  transactions: Transaction[];
  // --- YENİ EKLENEN ALANLAR ---
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: DepositMethod;
  status: DepositStatus;
  date: string;
}

export interface CryptoData {
  rank: number;
  name:string;
  symbol: string;
  price: number;
  previousPrice?: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  sparkline: number[];
  low24h: number;
  high24h: number;
  circulatingSupply: number;
  maxSupply?: number;
}

export interface EodHistoricalData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    adjusted_close: number;
    volume: number;
}

export interface EodRealTimeData {
    code: string;
    timestamp: number;
    gmtoffset: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    previousClose: number;
    change: number;
    change_p: number;
}

export interface PriceDataPoint {
  date: string;
  price: number;
  volume: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

export interface Holding {
    symbol: string;
    name: string;
    amount: number;
    valueUsd: number;
}

export interface PortfolioHolding extends Holding {
    currentPrice: number;
    todaysChangePercent: number;
    avgCost: number;
    totalGainLoss: {
        amount: number;
        percent: number;
    };
}

export type TransactionType = 'Buy' | 'Sell' | 'Deposit' | 'Adjustment' | 'Mt Profit';
export type OrderType = 'Market' | 'Limit';

export interface Transaction {
    id: string;
    date: string;
    type: TransactionType;
    orderType?: OrderType;
    asset: string;
    symbol: string;
    amountCoin: number;
    amountUsd: number;
    pricePerCoin: number;
    status: 'Completed' | 'Pending';
    targetAddress?: string;
}

export interface TechnicalSignal {
  rsi: {
    value: number;
    sentiment: 'Overbought' | 'Oversold' | 'Neutral';
  };
  movingAverages: {
    sma50: number;
    sma200: number;
    sentiment: 'Golden Cross' | 'Death Cross' | 'Bullish' | 'Bearish' | 'Neutral';
  };
  summary: {
    recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
    confidence: number;
    text: string;
  };
}


export interface ExchangeVolumeData {
    name: string;
    volume: number;
    price: number;
    pairs: {
        currency: string;
        price: number;
        volume: number;
    }[];
}

export interface CurrencyVolumeData {
    name: string;
    volume: number;
    price: number;
    exchanges: {
        name: string;
        price: number;
        volume: number;
    }[];
}


export interface NewsArticle {
  title: string;
  url: string;
}

export interface AiNews {
  summary: string;
  articles: NewsArticle[];
}