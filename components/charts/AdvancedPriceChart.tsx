import React, { useEffect, memo } from 'react';

declare global {
    interface Window {
        TradingView: any;
    }
}

interface AdvancedPriceChartProps {
    symbol: string;
}

const AdvancedPriceChart: React.FC<AdvancedPriceChartProps> = memo(({ symbol }) => {
    // Bu bileşenin her render'ında kullanılacak sabit bir ID.
    const containerId = 'tradingview_widget_container';

    useEffect(() => {
        let tvWidget: any = null;

        // Widget'ı oluşturan ana fonksiyon
        const createWidget = () => {
            // Güvenlik kontrolü: Container DOM'da var mı ve script yüklendi mi?
            if (!document.getElementById(containerId) || !window.TradingView) {
                return;
            }

            const widgetOptions = {
                autosize: true,
                symbol: symbol,
                interval: "D",
                timezone: "Etc/UTC",
                theme: "dark",
                style: "1",
                locale: "en",
                enable_publishing: false,
                backgroundColor: "rgba(13, 17, 23, 1)",
                gridColor: "rgba(48, 54, 61, 0.8)",
                hide_side_toolbar: false,
                allow_symbol_change: true,
                container_id: containerId, // En güvenilir yöntem: ID'yi kullanmak
            };

            tvWidget = new window.TradingView.widget(widgetOptions);
        };

        // Eğer TradingView script'i henüz yüklenmemişse, onu yükle.
        // Yüklendikten sonra (onload) widget'ı oluştur.
        if (!window.TradingView) {
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/tv.js';
            script.async = true;
            script.onload = createWidget; // Script yüklendiğinde bu fonksiyonu çalıştır
            document.head.appendChild(script);
        } else {
            // Eğer script zaten varsa, widget'ı direkt oluştur.
            createWidget();
        }

        // Bu useEffect'in "temizleme" fonksiyonu.
        // Component kaldırıldığında veya 'symbol' değiştiğinde bu çalışır.
        return () => {
            // Container'ı bul ve içini tamamen temizle.
            // Bu, TradingView'in oluşturduğu tüm DOM elemanlarını (iframe vb.) kaldırır.
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = ''; // En güvenilir temizleme yöntemi
            }
        };
    }, [symbol]); // Bu effect SADECE 'symbol' prop'u değiştiğinde yeniden çalışır.

    return (
        // Render edilen tek şey, widget'ın içine yerleşeceği boş bir div.
        <div id={containerId} className="h-[500px] w-full" />
    );
});

export default AdvancedPriceChart;