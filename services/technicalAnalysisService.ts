import { PriceDataPoint, TechnicalSignal } from '../types.ts';

// Calculates Simple Moving Average (SMA)
const calculateSMA = (prices: number[], period: number): number[] => {
    if (prices.length < period) return [];
    const sma: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
        const sum = prices.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
        sma.push(sum / period);
    }
    return sma;
};

// Calculates Relative Strength Index (RSI)
const calculateRSI = (prices: number[], period: number = 14): number[] => {
    if (prices.length < period + 1) return [];
    
    const rsi: number[] = [];
    let gains = 0;
    let losses = 0;

    // Initial average gain/loss
    for (let i = 1; i <= period; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) {
            gains += change;
        } else {
            losses -= change;
        }
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;

    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));

    // Subsequent RSI values
    for (let i = period + 1; i < prices.length; i++) {
        const change = prices[i] - prices[i-1];
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? -change : 0;
        
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
        
        rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
    }
    
    return rsi;
};

// Generates a trading signal based on historical data
export const generateSignal = (historicalData: PriceDataPoint[]): TechnicalSignal | null => {
    if (historicalData.length < 200) {
        return null; // Not enough data for a reliable signal
    }

    const closePrices = historicalData.map(d => d.price);
    
    // RSI
    const rsiValues = calculateRSI(closePrices, 14);
    const lastRsi = rsiValues[rsiValues.length - 1];
    let rsiSentiment: 'Overbought' | 'Oversold' | 'Neutral' = 'Neutral';
    if (lastRsi > 70) rsiSentiment = 'Overbought';
    if (lastRsi < 30) rsiSentiment = 'Oversold';
    
    // Moving Averages
    const sma50Values = calculateSMA(closePrices, 50);
    const sma200Values = calculateSMA(closePrices, 200);
    if(sma50Values.length === 0 || sma200Values.length === 0) return null;

    const lastSma50 = sma50Values[sma50Values.length - 1];
    const prevSma50 = sma50Values[sma50Values.length - 2];
    const lastSma200 = sma200Values[sma200Values.length - 1];
    const prevSma200 = sma200Values[sma200Values.length - 2];

    let maSentiment: 'Golden Cross' | 'Death Cross' | 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
    if (prevSma50 <= prevSma200 && lastSma50 > lastSma200) {
        maSentiment = 'Golden Cross';
    } else if (prevSma50 >= prevSma200 && lastSma50 < lastSma200) {
        maSentiment = 'Death Cross';
    } else if (lastSma50 > lastSma200) {
        maSentiment = 'Bullish';
    } else {
        maSentiment = 'Bearish';
    }
    
    // Summary Logic
    let score = 0;
    if (rsiSentiment === 'Oversold') score += 2;
    if (rsiSentiment === 'Overbought') score -= 2;
    if (maSentiment === 'Golden Cross') score += 2;
    if (maSentiment === 'Death Cross') score -= 2;
    if (maSentiment === 'Bullish') score += 1;
    if (maSentiment === 'Bearish') score -= 1;
    
    let recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell' = 'Hold';
    if (score >= 3) recommendation = 'Strong Buy';
    else if (score === 2) recommendation = 'Buy';
    else if (score === -2) recommendation = 'Sell';
    else if (score <= -3) recommendation = 'Strong Sell';
    
    const confidence = Math.min(Math.abs(score) / 4, 1);
    
    let summaryText = `Based on technical indicators, the current outlook is ${recommendation}. `;
    summaryText += `The RSI is at ${lastRsi.toFixed(2)}, indicating a ${rsiSentiment.toLowerCase()} condition. `;
    summaryText += `The 50-day moving average is currently ${maSentiment === 'Bullish' || maSentiment === 'Golden Cross' ? 'above' : 'below'} the 200-day moving average, suggesting a ${maSentiment.toLowerCase()} trend.`;


    return {
        rsi: {
            value: lastRsi,
            sentiment: rsiSentiment
        },
        movingAverages: {
            sma50: lastSma50,
            sma200: lastSma200,
            sentiment: maSentiment
        },
        summary: {
            recommendation,
            confidence,
            text: summaryText
        }
    };
};
