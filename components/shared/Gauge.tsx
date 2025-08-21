import React from 'react';

interface RsiGaugeProps {
  value: number; // 0-100
}

const RsiGauge: React.FC<RsiGaugeProps> = ({ value }) => {
  const getGradientColor = () => {
    // This creates a gradient from green -> yellow -> red
    const green = [63, 185, 80];
    const yellow = [234, 179, 8];
    const red = [248, 81, 73];

    let color;
    if (value < 50) {
      const p = value / 50;
      color = green.map((g, i) => Math.round(g * (1 - p) + yellow[i] * p));
    } else {
      const p = (value - 50) / 50;
      color = yellow.map((y, i) => Math.round(y * (1 - p) + red[i] * p));
    }
    return `rgb(${color.join(',')})`;
  };

  const needleRotation = (value / 100) * 180 - 90;

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="relative h-24">
        <div className="absolute top-0 left-0 w-full h-24 rounded-t-full overflow-hidden">
          <div 
            className="w-full h-48"
            style={{
              background: 'conic-gradient(from 180deg, #3FB950, #FBBF24, #F85149)',
              transform: 'translateY(-50%)',
            }}
          ></div>
        </div>
        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 w-px h-20 bg-white transition-transform duration-1000 origin-bottom"
          style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)` }}
        >
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white rounded-full"></div>
        </div>
        <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-white rounded-full -translate-x-1/2"></div>

      </div>
       <div className="text-center mt-2">
        <p className="text-3xl font-bold" style={{ color: getGradientColor() }}>{value.toFixed(2)}</p>
        <p className="text-sm text-muted">RSI (14)</p>
       </div>
       <div className="flex justify-between text-xs text-muted px-2 mt-1">
           <span>Oversold</span>
           <span>Neutral</span>
           <span>Overbought</span>
       </div>
    </div>
  );
};

export default RsiGauge;
