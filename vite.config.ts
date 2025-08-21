import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/api' ile başlayan tüm istekleri 'https://api.coingecko.com' adresine yönlendir
      '/api': {
        target: 'https://api.coingecko.com',
        changeOrigin: true, // CORS için bu gereklidir
        rewrite: (path) => path.replace(/^\/api/, ''), // '/api' kısmını URL'den kaldır
      },
    },
  },
});