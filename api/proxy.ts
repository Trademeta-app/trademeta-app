// api/proxy.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { endpoint, ...queryParams } = req.query;

  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'Endpoint query parameter is required.' });
  }

  const API_BASE_URL = 'https://api.coingecko.com/api/v3';
  const fullUrl = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await axios.get(fullUrl, {
      params: queryParams,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // GELEN VERİYİ KONTROL ETME (EN ÖNEMLİ KISIM)
    if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
        // CoinGecko boş ama başarılı bir cevap döndürürse, bunu bir sunucu hatası olarak logla
        console.warn(`CoinGecko returned an empty but successful response for endpoint: ${endpoint}`);
        // İstemciye yine de boş dizi gönderilebilir, ama loglama önemlidir.
    }
    
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json(response.data);

  } catch (error: any) {
    console.error(`Error fetching from CoinGecko endpoint: ${endpoint}`, {
      axiosErrorMessage: error.message,
      axiosResponseStatus: error.response?.status,
      axiosResponseData: error.response?.data
    });

    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to fetch data from CoinGecko API';
    
    res.status(status).json({ error: message });
  }
}