// api/proxy.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { endpoint, ...queryParams } = req.query;

  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'Endpoint query parameter is required and must be a string.' });
  }

  const API_BASE_URL = 'https://api.coingecko.com/api/v3';
  const fullUrl = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await axios.get(fullUrl, {
      params: queryParams,
      // CoinGecko'nun bot olmadığımızı anlaması için bir User-Agent eklemek iyi bir pratiktir
      headers: {
        'User-Agent': 'TrademetaApp/1.0.0'
      }
    });
    
    // Vercel'in önbellekleme ayarları
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    
    res.status(200).json(response.data);

  } catch (error: any) {
    // Hata ayıklama için hatayı sunucu loglarına yazdır
    console.error(`Error fetching from CoinGecko endpoint: ${endpoint}`, {
      axiosError: error.message,
      axiosResponse: error.response?.data
    });

    // İstemciye daha anlamlı bir hata mesajı gönder
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to fetch data from CoinGecko API';
    
    res.status(status).json({ error: message });
  }
}