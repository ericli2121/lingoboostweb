import React, { useEffect, useRef } from 'react';

// Extend window object to include PropellerAds
declare global {
  interface Window {
    propellerads: any;
  }
}

interface PropellerAdsProps {
  zoneId: string;
  adFormat?: 'onclick' | 'push' | 'interstitial' | 'banner';
  style?: React.CSSProperties;
  className?: string;
  width?: number | string;
  height?: number | string;
  onClick?: () => void;
}

export const PropellerAds: React.FC<PropellerAdsProps> = ({
  zoneId,
  adFormat = 'onclick',
  style = { display: 'block' },
  className = '',
  width,
  height,
  onClick
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    // Load PropellerAds script if not already loaded
    const loadPropellerAdsScript = () => {
      if (!document.querySelector('script[src*="upgulpinon.com"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `//upgulpinon.com/1?z=${zoneId}`;
        script.setAttribute('data-cfasync', 'false');
        document.head.appendChild(script);
      }
    };

    // For onclick ads, we need to initialize the click handler
    const initializeOnClickAd = () => {
      if (adRef.current && !isAdLoaded.current) {
        const handleClick = (event: MouseEvent) => {
          event.preventDefault();
          
          // Call PropellerAds onclick function
          if (window.propellerads && window.propellerads.onclick) {
            window.propellerads.onclick(zoneId);
          }
          
          // Call custom onClick handler if provided
          if (onClick) {
            onClick();
          }
        };

        adRef.current.addEventListener('click', handleClick);
        isAdLoaded.current = true;

        return () => {
          if (adRef.current) {
            adRef.current.removeEventListener('click', handleClick);
          }
        };
      }
    };

    loadPropellerAdsScript();
    
    // Initialize onclick ad after script loads
    if (adFormat === 'onclick') {
      const timer = setTimeout(() => {
        initializeOnClickAd();
      }, 1000); // Wait for script to load

      return () => clearTimeout(timer);
    }
  }, [zoneId, adFormat, onClick]);

  if (!zoneId) {
    return (
      <div className="bg-red-200 p-4 text-center text-red-800">
        DEBUG: No PropellerAds Zone ID provided
      </div>
    );
  }

  // Merge default style with provided style
  const mergedStyle: React.CSSProperties = {
    display: 'block',
    minWidth: width || '300px',
    minHeight: height || '250px',
    cursor: adFormat === 'onclick' ? 'pointer' : 'default',
    ...style
  };

  // Different rendering based on ad format
  if (adFormat === 'onclick') {
    return (
      <div 
        ref={adRef}
        className={`propeller-ads-onclick ${className}`}
        style={mergedStyle}
        data-zone-id={zoneId}
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg text-center">
          <div className="text-sm font-medium mb-2">Advertisement</div>
          <div className="text-xs opacity-90">Click to continue</div>
        </div>
      </div>
    );
  }

  if (adFormat === 'banner') {
    return (
      <div 
        ref={adRef}
        className={`propeller-ads-banner ${className}`}
        style={mergedStyle}
        data-zone-id={zoneId}
      >
        <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg text-center">
          <div className="text-sm text-gray-600 mb-2">Advertisement</div>
          <div className="text-xs text-gray-500">PropellerAds Banner</div>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div 
      ref={adRef}
      className={`propeller-ads ${className}`}
      style={mergedStyle}
      data-zone-id={zoneId}
    >
      <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg text-center">
        <div className="text-sm text-gray-600 mb-2">Advertisement</div>
        <div className="text-xs text-gray-500">PropellerAds</div>
      </div>
    </div>
  );
};
