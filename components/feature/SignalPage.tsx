import React, { useState, useEffect } from 'react';
import Card from '../shared/Card.tsx';
import RsiGauge from '../shared/Gauge.tsx';
import { getHistoricalData, getCryptoDetails } from '../../services/eodService.ts';
import { generateSignal } from '../../services/technicalAnalysisService.ts';
import { PriceDataPoint, TechnicalSignal } from '../../types.ts';
import { getCoinIcon, LogoIcon } from '../shared/Icons.tsx';

interface SignalPageProps {
  symbol: string;
  onBack: () => void;
}

const SignalPage: React.FC<SignalPageProps> = ({ symbol, onBack }) => {
  const [signal, setSignal] = useState<TechnicalSignal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { name, shortName } = getCryptoDetails(symbol);

  useEffect(() => {
    const fetchAndAnalyze = async () => {
      setIsLoading(true);
      try {
        const historyData: PriceDataPoint[] = await getHistoricalData(symbol);
        if (historyData.length > 0) {
          const generatedSignal = generateSignal(historyData);
          setSignal(generatedSignal);
        } else {
            setSignal(null);
        }
      } catch (error) {
        console.error("Failed to generate signal:", error);
        setSignal(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndAnalyze();
  }, [symbol]);

  const RecommendationPill: React.FC<{ rec: TechnicalSignal['summary']['recommendation'] }> = ({ rec }) => {
    const colors = {
      'Strong Buy': 'bg-success',
      'Buy': 'bg-green-600',
      'Hold': 'bg-gray-500',
      'Sell': 'bg-red-600',
      'Strong Sell': 'bg-danger'
    };
    return <span className={`px-4 py-2 text-lg font-bold rounded-full text-white ${colors[rec]}`}>{rec}</span>;
  };
  
  const SentimentPill: React.FC<{ sentiment: string, isPositive: boolean, isNegative: boolean }> = ({ sentiment, isPositive, isNegative }) => {
      const color = isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-primary';
      return <span className={`font-bold ${color}`}>{sentiment}</span>
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted">Analyzing market data...</p>
        </div>
      );
    }

    if (!signal) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-danger text-lg">Could not generate a signal.</p>
          <p className="mt-2 text-muted">Not enough historical data available for {name}.</p>
        </div>
      );
    }
    
    const maSentiment = signal.movingAverages.sentiment;
    const isMaPositive = maSentiment === 'Bullish' || maSentiment === 'Golden Cross';
    const isMaNegative = maSentiment === 'Bearish' || maSentiment === 'Death Cross';

    return (
      <div className="space-y-8">
        <Card className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Technical Summary</h2>
            <RecommendationPill rec={signal.summary.recommendation} />
            <p className="text-muted mt-4 max-w-2xl mx-auto">{signal.summary.text}</p>
        </Card>
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <h3 className="text-xl font-bold text-white mb-4 text-center">Relative Strength Index (RSI)</h3>
                <RsiGauge value={signal.rsi.value} />
                <div className="text-center mt-4">
                    <p>Current Sentiment: <span className={`font-bold ${signal.rsi.sentiment === 'Overbought' ? 'text-danger' : signal.rsi.sentiment === 'Oversold' ? 'text-success' : 'text-muted'}`}>{signal.rsi.sentiment}</span></p>
                </div>
            </Card>
            <Card>
                <h3 className="text-xl font-bold text-white mb-4 text-center">Moving Averages</h3>
                <div className="space-y-4 mt-8">
                     <div className="flex justify-between items-baseline">
                        <span className="text-muted">50-Day SMA</span>
                        <span className="font-mono text-white text-2xl">${signal.movingAverages.sma50.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                     </div>
                     <div className="flex justify-between items-baseline">
                        <span className="text-muted">200-Day SMA</span>
                        <span className="font-mono text-white text-2xl">${signal.movingAverages.sma200.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                     </div>
                      <div className="border-t border-border-color my-4"></div>
                     <div className="text-center mt-4">
                        <p>Trend Status: <SentimentPill sentiment={maSentiment} isPositive={isMaPositive} isNegative={isMaNegative} /></p>
                     </div>
                </div>
            </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
            {getCoinIcon(symbol) || <LogoIcon className="w-12 h-12 text-muted" />}
            <div>
                <h1 className="text-3xl font-bold text-white">Trading Signal for {name} ({shortName})</h1>
                <p className="text-muted">Real-time technical analysis summary.</p>
            </div>
        </div>
        <button onClick={onBack} className="bg-primary text-background font-bold py-2 px-4 rounded-md hover:bg-primary-focus transition-colors">
            &larr; Back to Market
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default SignalPage;
