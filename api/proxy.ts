// api/proxy.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // --- ADIM 1: Gelen isteği logla ---
  console.log("--- PROXY FUNCTION STARTED ---");
  const { endpoint, ...queryParams } = req.query;
  console.log("Received endpoint:", endpoint);
  console.log("Received query params:", queryParams);

  if (!endpoint || typeof endpoint !== 'string') {
    console.error("Endpoint is missing or invalid.");
    return res.status(400).json({ error: 'Endpoint query parameter is required.' });
  }

  const API_BASE_URL = 'https://api.coingecko.com/api/v3';
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  
  // --- ADIM 2: CoinGecko'ya hangi URL'yi sorduğumuzu logla ---
  console.log("--> Requesting URL from CoinGecko:", fullUrl);

  try {
    const response = await axios.get(fullUrl, {
      params: queryParams,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // --- ADIM 3: CoinGecko'dan gelen cevabın tamamını logla (EN ÖNEMLİ KISIM) ---
    console.log("<-- Received successful response from CoinGecko. Status:", response.status);
    console.log("<-- Data received:", JSON.stringify(response.data, null, 2));

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // --- ADIM 4: React uygulamamıza ne gönderdiğimizi logla ---
    console.log("--- Sending data back to client. PROXY FUNCTION ENDED. ---");
    res.status(200).json(response.data);

  } catch (error: any) {
    // --- ADIM 5: Hata olursa, hatanın tüm detaylarını logla ---
    console.error("!!! ERROR caught in proxy function !!!");
    console.error("Error Message:", error.message);
    if (error.response) {
      console.error("CoinGecko Response Status:", error.response.status);
      console.error("CoinGecko Response Data:", JSON.stringify(error.response.data, null, 2));
    }
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to fetch data from CoinGecko API';
    
    res.status(status).json({ error: message });
  }
}