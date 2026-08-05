import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="pwa-install-banner">
      <div className="pwa-banner-content">
        <div className="pwa-icon-wrap">
          <Download size={22} />
        </div>
        <div className="pwa-text-wrap">
          <div className="pwa-title">Install Totools OS</div>
          <div className="pwa-desc">Jalankan 100% offline layaknya aplikasi Desktop & HP native</div>
        </div>
        <button className="btn-pwa-install" onClick={handleInstall}>
          Install Sekarang
        </button>
        <button className="btn-pwa-close" onClick={() => setIsVisible(false)}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
