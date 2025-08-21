import axios from 'axios';
import { Coin, CoinDetail, PriceDataPoint } from '../types'; 

// Canlı ve geliştirme ortamları için API adresini dinamik olarak belirle
const getApiBaseUrl = () => {
  // Bu kod, Vercel'de (veya Netlify'da) çalıştığında,
  // Vercel tarafından otomatik olarak ayarlanan bir ortam değişkenidir.
  if (process.env.VERCEL_URL) {
    // Canlı ortamda, kendi sitemizin tam URL'sini kullanmalıyız.
    return `https://${process.env.VERCEL_URL}`;
  }
  // Yerelde 'vercel dev' ile çalışırken, göreceli yol yeterlidir.
  return '';
};

const API_PROXY_ENDPOINT = `${getApiBaseUrl()}/api/proxy`;

export const getMarketData = async (currency: string = 'usd', perPage: number = 100): Promise<Coin[]> => {
  try {
    const response = await axios.get<Coin[]>(API_PROXY_ENDPOINT, {
      params: {
        endpoint: '/coins/markets',
        vs_currency: currency,
        order: 'market_cap_desc',
        per_page: perPage,
        page: 1,
        sparkline: false,
      },
    });
    return response.data;
  } catch (error) {
    console.error("API proxy'sinden piyasa verileri alınırken hata oluştu:", error);
    throw new Error('Piyasa verileri alınamadı.');
  }
};

export const getCoinDetails = async (coinId: string): Promise<CoinDetail> => {
  try {
    const response = await axios.get<CoinDetail>(API_PROXY_ENDPOINT, {
      params: {
        endpoint: `/coins/${coinId}`,
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false,
      }
    });
    return response.data;
  } catch (error) {
    console.error(`'${coinId}' için API proxy'sinden detay verileri alınırken hata oluştu:`, error);
    throw new Error('Coin detayları alınamadı.');
  }
};

export const getCoinChartData = async (
  coinId: string, 
  currency: string = 'usd', 
  days: string = '30'
): Promise<PriceDataPoint[]> => {
  try {
    const response = await axios.get<number[][]>(API_PROXY_ENDPOINT, {
      params: {
        endpoint: `/coins/${coinId}/ohlc`,
        vs_currency: currency,
        days: days,
      },
    });
    
    const formattedData: PriceDataPoint[] = response.data.map((item: number[]) => ({
      date: new Date(item[0]).toISOString(),
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      price: item[4],
      volume: 0, 
    }));
    
    return formattedData;
  } catch (error) {
    console.error(`'${coinId}' için API proxy'sinden grafik verileri alınırken hata oluştu:`, error);
    throw new Error('Grafik verileri alınamadı.');
  }
};