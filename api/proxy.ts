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

  // CoinGecko Pro API'si için ana URL (ücretsiz anahtar da bu adresi kullanır)
  const API_BASE_URL = 'https://pro-api.coingecko.com/api/v3';
  const fullUrl = `${API_BASE_URL}${endpoint}`;

  // Vercel'deki ortam değişkeninden API anahtarını al
  const apiKey = process.env.COINGECKO_API_KEY;

  if (!apiKey) {
      console.error("COINGECKO_API_KEY ortam değişkeni ayarlanmamış.");
      return res.status(500).json({ error: 'API Key is not configured on the server.' });
  }

  try {
    const response = await axios.get(fullUrl, {
      params: {
        ...queryParams,
        x_cg_pro_api_key: apiKey // CoinGecko, anahtarı bu parametreyle bekler
      },
      headers: {
        'Accept': 'application/json',
      }
    });

    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).json(response.data);

  } catch (error: any) {
    console.error(`Error fetching from CoinGecko: ${error.message}`);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to fetch data from CoinGecko API';
    res.status(status).json({ error: message });
  }
}