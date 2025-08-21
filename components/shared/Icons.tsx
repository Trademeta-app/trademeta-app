import React, { useState, useEffect } from 'react';

// Helper to map size numbers to static Tailwind classes
const getSizeClass = (size: number): string => {
  switch (size) {
    case 5:
      return 'w-5 h-5';
    case 6:
      return 'w-6 h-6';
    case 8:
      return 'w-8 h-8';
    case 10:
      return 'w-10 h-10';
    case 12:
      return 'w-12 h-12';
    default:
      return 'w-8 h-8'; // Default size
  }
};

// New component to handle loading logos from a CDN with a fallback
const CryptoLogo = ({ symbol, size }: { symbol: string, size: number }) => {
  const [hasError, setHasError] = useState(false);
  
  // E.g., 'BTC-USD' -> 'btc'
  const cleanSymbol = symbol.split('-')[0].toLowerCase();
  
  // Use a reliable CDN for cryptocurrency icons
  const logoUrl = `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@main/svg/color/${cleanSymbol}.svg`;

  // Reset error state if the symbol changes
  useEffect(() => {
    setHasError(false);
  }, [symbol]);

  const handleError = () => {
    setHasError(true);
  };
  
  const sizeClass = getSizeClass(size);
  
  // If the logo fails to load, render the default fallback icon
  if (hasError) {
    return <LogoIcon className={`${sizeClass} text-muted`} />;
  }
  
  return (
    <img 
      src={logoUrl} 
      alt={`${symbol.split('-')[0]} logo`}
      className={sizeClass}
      onError={handleError}
      loading="lazy"
    />
  );
};


// --- Generic UI Icons (Unchanged) ---

export const LogoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const DashboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

export const AdminIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path><path d="M12 15s-4 2-4 4v1h8v-1c0-2-4-4-4-4z"></path>
  </svg>
);

export const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
  </svg>
);


export const DepositIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

export const SendIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

export const BotIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
     <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
  </svg>
);

export const StarIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

export const ArrowDownUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 16 4 4 4-4"/>
        <path d="M7 20V4"/>
        <path d="m21 8-4-4-4 4"/>
        <path d="M17 4v16"/>
    </svg>
);

export const LogoutIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
        />
    </svg>
);

export const NewsIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4"/><path d="M14 9h4"/><path d="M14 13h4"/><path d="M14 17h4"/><path d="M8 9h2"/><path d="M8 13h2"/><path d="M8 17h2"/>
    </svg>
);

export const CalendarIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

export const LogScaleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/><path d="M7 16V4"/><path d="M11 16V9"/><path d="M15 16v-3"/><path d="M19 16v-1"/>
    </svg>
);

/**
 * Renders a cryptocurrency logo by fetching it from a CDN.
 * Provides a fallback to a default icon if the logo cannot be found.
 * @param symbol - The symbol of the cryptocurrency (e.g., 'BTC-USD').
 * @param size - The size of the icon (maps to Tailwind CSS width/height classes).
 */
export const getCoinIcon = (symbol: string, size: number = 8): React.ReactNode => {
    return <CryptoLogo symbol={symbol} size={size} />;
};