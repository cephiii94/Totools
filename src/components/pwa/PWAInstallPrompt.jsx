import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // Suppress prompt for 24 hours if dismissed
const AUTO_HIDE_DELAY_MS = 6000; // Auto-hide after 6 seconds

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    // Check if user recently dismissed prompt
    const lastDismissed = localStorage.getItem('totools_pwa_dismissed');
    if (lastDismissed) {
      const elapsed = Date.now() - Number(lastDismissed);
      if (elapsed < DISMISS_COOLDOWN_MS) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPWAInstallPrompt = e;
      window.dispatchEvent(new CustomEvent('pwa-prompt-changed', { detail: e }));
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      window.deferredPWAInstallPrompt = null;
      window.dispatchEvent(new CustomEvent('pwa-prompt-changed', { detail: null }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Auto-hide timer
  useEffect(() => {
    if (!isVisible || isHiding) return;

    const timer = setTimeout(() => {
      dismissPrompt();
    }, AUTO_HIDE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isVisible, isHiding]);

  const dismissPrompt = () => {
    setIsHiding(true);
    localStorage.setItem('totools_pwa_dismissed', Date.now().toString());
    setTimeout(() => {
      setIsVisible(false);
      setIsHiding(false);
    }, 300);
  };

  const handleInstall = async () => {
    const promptEvent = deferredPrompt || window.deferredPWAInstallPrompt;
    if (!promptEvent) return;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      dismissPrompt();
    }
    setDeferredPrompt(null);
    window.deferredPWAInstallPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-prompt-changed', { detail: null }));
  };

  if (!isVisible) return null;

  return (
    <div className={`pwa-install-banner ${isHiding ? 'is-hiding' : ''}`}>
      <div className="pwa-banner-content">
        <div className="pwa-icon-wrap">
          <Download size={20} />
        </div>
        <div className="pwa-text-wrap">
          <div className="pwa-title">Install Totools OS</div>
          <div className="pwa-desc">Jalankan 100% offline layaknya aplikasi Desktop & HP native</div>
        </div>
        <button className="btn-pwa-install" onClick={handleInstall}>
          Install
        </button>
        <button className="btn-pwa-close" onClick={dismissPrompt} title="Tutup">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
  );
};
