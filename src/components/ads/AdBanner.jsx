import React, { useEffect } from 'react';

export const AdBanner = ({ type = 'banner', adClient, adSlot }) => {
  useEffect(() => {
    if (adClient && adSlot && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense push error:', e);
      }
    }
  }, [adClient, adSlot]);

  return (
    <div className={`ad-banner-container ad-type-${type}`}>
      <div className="ad-badge">IKLAN / SPONSORED</div>
      {adClient && adSlot ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="ad-placeholder-box">
          <span className="ad-title">Ad Space Available</span>
          <span className="ad-desc">Ruang Iklan Google AdSense / Banner Promosi</span>
        </div>
      )}
    </div>
  );
};
