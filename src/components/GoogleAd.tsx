import React, { useEffect } from 'react';

interface GoogleAdProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
  style?: React.CSSProperties;
}

export const GoogleAd: React.FC<GoogleAdProps> = ({
  dataAdSlot,
  dataAdFormat = 'auto',
  dataFullWidthResponsive = true,
  style = { display: 'block' }
}) => {
  useEffect(() => {
    try {
      // Load AdSense script if not already loaded
      if (!window.adsbygoogle) {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
        
        // Initialize adsbygoogle array
        window.adsbygoogle = window.adsbygoogle || [];
      }
      
      // Push the ad
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  const clientId = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT;

  if (!clientId) {
    return null; // Don't render if no client ID
  }

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client={clientId}
      data-ad-slot={dataAdSlot}
      data-ad-format={dataAdFormat}
      data-full-width-responsive={dataFullWidthResponsive}
    />
  );
};

// Extend window object to include adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
