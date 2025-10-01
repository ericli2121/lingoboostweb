import React, { useEffect } from 'react';

interface GoogleAdProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const GoogleAd: React.FC<GoogleAdProps> = ({
  dataAdSlot,
  dataAdFormat = 'auto',
  dataFullWidthResponsive = true,
  style = { display: 'block' },
  className = ''
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
      
      // Check if ad is already loaded to prevent duplicate pushes
      const adElements = document.querySelectorAll('.adsbygoogle');
      const hasUnloadedAds = Array.from(adElements).some(el => !el.getAttribute('data-adsbygoogle-status'));
      
      if (hasUnloadedAds) {
        // Push the ad only if there are unloaded ads
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  const clientId = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT;

  // Debug logging
  console.log('GoogleAd Debug:', {
    clientId: clientId ? 'SET' : 'NOT SET',
    dataAdSlot,
    hasWindowAdsense: !!window.adsbygoogle
  });

  if (!clientId) {
    return (
      <div className="bg-red-200 p-4 text-center text-red-800">
        DEBUG: No VITE_GOOGLE_ADSENSE_CLIENT environment variable set
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={clientId}
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive}
      />
    </div>
  );
};

// Extend window object to include adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
