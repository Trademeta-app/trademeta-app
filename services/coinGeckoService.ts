// src/services/coinGeckoService.ts (YENİ, DOĞRU HALİ)
import axios from 'axios';
import { Coin, CoinDetail, PriceDataPoint } from '../types';

// Vite'nin doğru ortam değişkeni okuma yöntemi budur.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const getMarketData = async (currency: string = 'usd', perPage: number = 100): Promise<Coin[]> => {
  try {
    const response = await apiClient.get<Coin[]>('/coins/markets', {
      params: {
        vs_currency: currency,
        order: 'market_cap_desc',
        per_page: perPage,
        page: 1,
        sparkline: false,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Piyasa verileri alınırken hata oluştu (Bu aşamada normaldir):", error);
    // Hata durumunda uygulama çökmesin diye boş bir dizi döndürüyoruz.
    return [];
  }
};

// Diğer fonksiyonlarınız aynı kalabilir, sadece API çağrılarını apiClient üzerinden yapacak şekilde güncelliyoruz.
export const getCoinDetails = async (coinId: string): Promise<CoinDetail> => {
    try {
        const response = await apiClient.get<CoinDetail>(`/coins/${coinId}`);
        return response.data;
    } catch (error) {
        console.error(`'${coinId}' için detay verileri alınırken hata oluştu:`, error);
        throw new Error('Coin detayları alınamadı.');
    }
};

export const getCoinChartData = async (
    coinId: string,
    currency: string = 'usd',
    days: string = '30'
): Promise<PriceDataPoint[]> => {
    try {
        const response = await apiClient.get<number[][]>(`/coins/${coinId}/ohlc`, {
            params: {
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
        console.error(`'${coinId}' için grafik verileri alınırken hata oluştu:`, error);
        throw new Error('Grafik verileri alınamadı.');
    }
};