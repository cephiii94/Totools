import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { checkAppVersionUpdate, markVersionAsUpdated, clearAppCache, getFormattedVersion } from '../../utils/cache';

export const UpdateToast = () => {
  const [hasUpdate, setHasUpdate] = useState(false);

  const checkUpdateStatus = () => {
    if (checkAppVersionUpdate()) {
      setHasUpdate(true);
    }
  };

  useEffect(() => {
    // Check version difference on app load
    checkUpdateStatus();

    // Check again whenever user switches back to the tab
    window.addEventListener('focus', checkUpdateStatus);
    return () => window.removeEventListener('focus', checkUpdateStatus);
  }, []);

  if (!hasUpdate) return null;

  const handleUpdateClick = () => {
    markVersionAsUpdated();
    clearAppCache();
  };

  const handleDismiss = () => {
    markVersionAsUpdated();
    setHasUpdate(false);
  };

  return (
    <div className="update-toast-banner">
      <div className="update-toast-icon">
        <Sparkles size={20} />
      </div>

      <div className="update-toast-content">
        <div className="update-toast-title">Pembaruan Web OS Tersedia ({getFormattedVersion()})</div>
        <div className="update-toast-desc">
          Build versi baru telah terdeteksi. Klik untuk mengaktifkan pembaruan & bersihkan cache otomatis.
        </div>
        <div className="update-toast-actions">
          <button className="btn-update-now" onClick={handleUpdateClick}>
            <RefreshCw size={13} className="spin-icon-hover" /> Perbarui & Hapus Cache
          </button>
          <button className="btn-update-later" onClick={handleDismiss}>
            Nanti
          </button>
        </div>
      </div>

      <button className="update-toast-close" onClick={handleDismiss} title="Tutup Notifikasi">
        <X size={14} />
      </button>
    </div>
  );
};
