import React, { useEffect, useRef } from 'react';

// Extend window object to include adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface GoogleAdProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const GoogleAd: React.FC<GoogleAdProps> = ({
  dataAdSlot,
  dataAdFormat = 'auto',
  dataFullWidthResponsive = true,
  style = { display: 'block' },
  className = '',
  width,
  height
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const isAdPushed = useRef(false);

  useEffect(() => {
    // Load AdSense script if not already loaded
    const loadAdSenseScript = () => {
      if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT}`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }
    };

    loadAdSenseScript();

    // Push ad only once per component instance
    const pushAd = () => {
      try {
        if (adRef.current && !isAdPushed.current) {
          const adStatus = adRef.current.getAttribute('data-adsbygoogle-status');
          
          // Only push if ad hasn't been loaded yet
          if (!adStatus) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            isAdPushed.current = true;
          }
        }
      } catch (error) {
        console.error('AdSense error:', error);
      }
    };

    // Wait for script to load before pushing
    if (window.adsbygoogle) {
      pushAd();
    } else {
      const checkInterval = setInterval(() => {
        if (window.adsbygoogle) {
          clearInterval(checkInterval);
          pushAd();
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }
  }, []);

  const clientId = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT;

  if (!clientId) {
    return (
      <div className="bg-red-200 p-4 text-center text-red-800">
        DEBUG: No VITE_GOOGLE_ADSENSE_CLIENT environment variable set
      </div>
    );
  }

  // Merge default style with provided style to ensure visibility
  const mergedStyle: React.CSSProperties = {
    display: 'block',
    minWidth: width || '300px',
    minHeight: height || '250px',
    ...style
  };

  return (
    <div className={className} style={{ overflow: 'visible' }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={mergedStyle}
        data-ad-client={clientId}
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive.toString()}
      />
    </div>
  );
};