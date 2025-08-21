
import React, { useState, useEffect } from 'react';
import Card from '../shared/Card.tsx';
import { getAiNewsSummary } from '../../services/geminiService.ts';
import { AiNews } from '../../types.ts';
import { getCryptoDetails } from '../../services/cryptoService.ts';
import { NewsIcon } from '../shared/Icons.tsx';

interface CoinNewsProps {
    symbol: string;
}

const CoinNews: React.FC<CoinNewsProps> = ({ symbol }) => {
    const [news, setNews] = useState<AiNews | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { name } = getCryptoDetails(symbol);

    useEffect(() => {
        const fetchNews = async () => {
            setIsLoading(true);
            const newsData = await getAiNewsSummary(name);
            setNews(newsData);
            setIsLoading(false);
        };
        fetchNews();
    }, [name]);
    
    return (
        <Card>
            <div className="flex items-center gap-3 mb-4">
                <NewsIcon className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-white">Latest News for {name}</h3>
            </div>
            {isLoading ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-border-color rounded w-full"></div>
                    <div className="h-4 bg-border-color rounded w-5/6"></div>
                    <div className="h-4 bg-border-color rounded w-3/4"></div>
                </div>
            ) : !news || !news.summary || news.articles.length === 0 ? (
                <p className="text-muted">Could not retrieve news at this time.</p>
            ) : (
                <div>
                    <p className="text-muted mb-4">{news.summary}</p>
                    <h4 className="font-semibold text-white mb-2">Sources:</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {news.articles.map((article, index) => (
                            <li key={index}>
                                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-focus underline text-sm">
                                    {article.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    );
};

export default CoinNews;