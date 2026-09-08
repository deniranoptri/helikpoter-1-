import React, { useEffect, useRef } from 'react';

export const AdSenseDisplay: React.FC = () => {
  const adRef = useRef<HTMLModElement>(null);
  const isPushed = useRef(false);

  useEffect(() => {
    // Add the AdSense script globally if not already present
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8570354149283385";
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    let checkInterval: number;

    const pushAd = () => {
      if (adRef.current && adRef.current.getAttribute('data-adsbygoogle-status')) {
        return;
      }

      // Prevent "No slot size for availableWidth=0" error
      // Check if the container actually has a layout width before pushing
      const wrapper = adRef.current?.parentElement;
      if (wrapper && wrapper.offsetWidth === 0) {
        // Retry shortly if layout hasn't settled yet
        checkInterval = window.setTimeout(pushAd, 100);
        return;
      }

      if (!isPushed.current) {
        isPushed.current = true;
        try {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          console.error("AdSense error:", e);
        }
      }
    };

    // Use a small timeout to allow initial DOM paint
    checkInterval = window.setTimeout(pushAd, 50);

    return () => clearTimeout(checkInterval);
  }, []);

  return (
    <div className="w-full mt-4 flex justify-center items-center overflow-hidden min-h-[90px] min-w-[250px]">
      <ins ref={adRef}
           className="adsbygoogle"
           style={{ display: 'block', width: '100%' }}
           data-ad-client="ca-pub-8570354149283385"
           data-ad-slot="2621366810"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
};
