
import { GoogleGenAI } from "@google/genai";
import { PriceDataPoint, AiNews } from '../types.ts';

if (!process.env.API_KEY) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "GEMINI_API_KEY_PLACEHOLDER" });

const systemInstruction = `You are 'Aether-Intellect', an expert financial analyst specializing in cryptocurrency markets. 
You provide insightful, data-driven analysis based on the information provided. 
Your tone should be professional, objective, and informative. 
When asked about market trends, refer to patterns like moving averages, support/resistance levels, and volume indicators.
You MUST NOT give any financial advice or make price predictions. Your goal is to analyze past data and identify trends.
When you receive market data in the prompt, use it as the primary source for your analysis. Keep your answers concise and to the point.`;

export const getAiMarketAnalysis = async (userQuery: string, marketData: PriceDataPoint[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "The AI Analyst is currently offline. The API key is not configured.";
  }
  try {
    const model = "gemini-2.5-flash";
    const marketDataContext = `Historical price data (last 30 days): \n${marketData.map(d => `Date: ${d.date}, Price: $${d.price.toFixed(2)}`).join('\n')}`;
    
    const fullPrompt = `${marketDataContext}\n\nUser Question: ${userQuery}`;

    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching AI analysis:", error);
    return "Sorry, I encountered an error while analyzing the market data. Please try again later.";
  }
};

export const getAiNewsSummary = async (coinName: string): Promise<AiNews> => {
  const defaultResponse = { summary: 'Could not fetch news at this time.', articles: [] };
  if (!process.env.API_KEY) {
    return defaultResponse;
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find and summarize in a single paragraph the top 3-4 most recent and significant news articles about ${coinName}. Focus on market-moving information, partnerships, and technological updates.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const summary = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const articles = groundingChunks.map((chunk: any) => ({
        title: chunk.web?.title || 'Untitled Article',
        url: chunk.web?.uri || '#',
    })).filter((article, index, self) => 
        index === self.findIndex((a) => a.url === article.url)
    );

    return { summary, articles };

  } catch (error) {
    console.error(`Error fetching news for ${coinName}:`, error);
    return defaultResponse;
  }
};