
import React, { useState, useCallback, useEffect } from 'react';
import Card from '../shared/Card.tsx';
import { BotIcon, SendIcon } from '../shared/Icons.tsx';
import { getAiMarketAnalysis } from '../../services/geminiService.ts';
import { getCryptoDetails } from '../../services/eodService.ts';
import { PriceDataPoint } from '../../types.ts';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface AiAnalystProps {
    marketData: PriceDataPoint[];
    selectedSymbol: string;
}

const AiAnalyst: React.FC<AiAnalystProps> = ({ marketData, selectedSymbol }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const shortName = getCryptoDetails(selectedSymbol).shortName;

  useEffect(() => {
    setMessages([
      { sender: 'ai', text: `Welcome to Aether-Intellect. Ask me about the current market trends for ${shortName}.` }
    ]);
    setInput('');
  }, [shortName]);


  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    
    if (marketData.length === 0) {
        const errorMessage: Message = { sender: 'ai', text: "I can't analyze the market without historical data. Please wait for it to load." };
        setMessages(prev => [...prev, userMessage, errorMessage]);
        return;
    }

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getAiMarketAnalysis(input, marketData);
      const aiMessage: Message = { sender: 'ai', text: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { sender: 'ai', text: "I'm having trouble connecting right now. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, marketData]);

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <BotIcon className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-white">AI Market Analyst</h2>
      </div>
      <div className="flex-grow bg-background p-4 rounded-md overflow-y-auto mb-4 h-64">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center"><BotIcon className="w-5 h-5 text-background" /></div>}
              <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'ai' ? 'bg-surface' : 'bg-primary text-background'}`}>
                 <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
               <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center"><BotIcon className="w-5 h-5 text-background" /></div>
              <div className="max-w-md p-3 rounded-lg bg-surface">
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-muted rounded-full animate-pulse"></span>
                    <span className="w-2 h-2 bg-muted rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-2 h-2 bg-muted rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={marketData.length > 0 ? `Ask about ${shortName} trends...` : "Loading market data..."}
          className="flex-grow bg-surface border border-border-color rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          disabled={isLoading || marketData.length === 0}
        />
        <button type="submit" className="bg-primary text-background p-2.5 rounded-md hover:bg-primary-focus disabled:bg-muted disabled:cursor-not-allowed transition-colors" disabled={isLoading || marketData.length === 0}>
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </Card>
  );
};

export default AiAnalyst;