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
    const containerId = 'tradingview_widget_container';

    useEffect(() => {
        // Sembol geçerli değilse veya henüz gelmediyse hiçbir şey yapma
        if (!symbol) return;

        let tvWidget: any = null;

        const createWidget = () => {
            const container = document.getElementById(containerId);
            if (!container || !window.TradingView) {
                return;
            }

            // Widget oluşturmadan önce container'ı temizle
            container.innerHTML = '';

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
                container_id: containerId,
            };

            tvWidget = new window.TradingView.widget(widgetOptions);
        };

        if (!window.TradingView) {
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/tv.js';
            script.async = true;
            script.onload = createWidget;
            document.head.appendChild(script);
        } else {
            createWidget();
        }

        return () => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
        };
    }, [symbol]);

    return (
        <div id={containerId} style={{ height: "500px", width: "100%" }} />
    );
});

export default AdvancedPriceChart;