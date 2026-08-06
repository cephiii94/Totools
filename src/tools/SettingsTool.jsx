import React, { useState, useEffect, useRef } from 'react';
import { useWindowContext } from '../context/WindowContext';
import {
  Palette,
  Image as ImageIcon,
  Info,
  ChevronRight,
  ChevronLeft,
  LinkIcon,
  Upload,
  Check,
  Trash2,
  Volume2,
  VolumeX,
  RefreshCw,
  Play,
  RotateCcw,
  Maximize2,
  Minimize2,
  Search,
  MousePointer,
  Download
} from 'lucide-react';
import { playSound } from '../utils/audio';
import { AdBanner } from '../components/ads/AdBanner';

import { clearAppCache, getFormattedVersion } from '../utils/cache';

export const SettingsTool = () => {
  const {
    theme, setTheme,
    wallpaper, setWallpaper,
    customWallpaperUrl, setCustomWallpaperUrl,
    soundEnabled, setSoundEnabled,
    soundConfig, toggleSoundEffect,
    showAlert, showConfirm
  } = useWindowContext();

  const [activeTab, setActiveTab] = useState('visual'); // 'visual' | 'sound' | 'system'
  const [wallpaperTab, setWallpaperTab] = useState('gallery'); // 'gallery' | 'upload' | 'url'
  const [inputUrl, setInputUrl] = useState(customWallpaperUrl && !customWallpaperUrl.startsWith('data:') ? customWallpaperUrl : '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  // PWA State
  const [canInstallPWA, setCanInstallPWA] = useState(Boolean(window.deferredPWAInstallPrompt));
  const [isPWAInstalled, setIsPWAInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  );

  useEffect(() => {
    const handlePWAChange = () => {
      setCanInstallPWA(Boolean(window.deferredPWAInstallPrompt));
      setIsPWAInstalled(
        window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
      );
    };

    window.addEventListener('pwa-prompt-changed', handlePWAChange);
    window.addEventListener('appinstalled', handlePWAChange);
    return () => {
      window.removeEventListener('pwa-prompt-changed', handlePWAChange);
      window.removeEventListener('appinstalled', handlePWAChange);
    };
  }, []);

  const handleTriggerPWAInstall = async () => {
    if (!window.deferredPWAInstallPrompt) {
      showAlert({
        type: 'info',
        title: 'Instalasi Aplikasi PWA',
        message: 'Aplikasi ini mendukung PWA. Anda juga dapat memasangnya secara manual melalui menu browser Anda (Pilih "Tambahkan ke Layar Utama" / "Install App").'
      });
      return;
    }
    const promptEvent = window.deferredPWAInstallPrompt;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      setIsPWAInstalled(true);
    }
    window.deferredPWAInstallPrompt = null;
    setCanInstallPWA(false);
  };

  
  // Mobile drill-down view state
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // ResizeObserver for window container width < 720px
  const containerRef = useRef(null);
  const [isNarrowWindow, setIsNarrowWindow] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width < 720) {
          setIsNarrowWindow(true);
        } else {
          setIsNarrowWindow(false);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const wallpapers = [
    { id: 'glass-blue', title: 'Glass Blue', bg: 'linear-gradient(135deg, #0f766e 0%, #1d4ed8 44%, #312e81 100%)' },
    { id: 'dark-nebula', title: 'Dark Nebula', bg: 'linear-gradient(135deg, #020617 0%, #0f172a 45%, #164e63 100%)' },
    { id: 'pastel-sunset', title: 'Pastel Sunset', bg: 'linear-gradient(145deg, #38bdf8 0%, #a78bfa 46%, #fb7185 100%)' },
    { id: 'cyberpunk-neon', title: 'Cyberpunk Neon', bg: 'linear-gradient(135deg, #09090b 0%, #701a75 50%, #0284c7 100%)' },
    { id: 'minimal-dark', title: 'Minimal Slate', bg: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #09090b 100%)' }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert({
        type: 'warning',
        title: 'Berkas Tidak Valid',
        message: 'Silakan pilih berkas gambar yang valid (JPG, PNG, atau WEBP).'
      });
      return;
    }

    setIsProcessing(true);
    setUploadStatus('Membaca & mengoptimalkan resolusi gambar...');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;

        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        const sizeKb = Math.round((resizedDataUrl.length * 3) / 4 / 1024);

        setCustomWallpaperUrl(resizedDataUrl);
        setWallpaper('custom-url');
        setIsProcessing(false);
        setUploadStatus(`Berhasil! Gambar dioptimalkan ke ${width}x${height}px (~${sizeKb}KB).`);
      };

      img.onerror = () => {
        setIsProcessing(false);
        setUploadStatus('Gagal membaca berkas gambar.');
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!inputUrl.trim()) return;
    setCustomWallpaperUrl(inputUrl.trim());
    setWallpaper('custom-url');
    setUploadStatus('Wallpaper URL internet berhasil diterapkan!');
  };

  const handleResetCustomWallpaper = () => {
    setCustomWallpaperUrl('');
    setInputUrl('');
    setWallpaper('glass-blue');
    setUploadStatus('');
  };

  const handleResetAllPreferences = () => {
    showConfirm({
      type: 'danger',
      title: 'Reset Preferensi OS',
      message: 'Apakah Anda yakin ingin mengembalikan semua preferensi tema, wallpaper, dan suara ke versi bawaan pabrik?',
      confirmText: 'Ya, Reset OS',
      cancelText: 'Batal',
      onConfirm: () => {
        setTheme('default');
        setWallpaper('glass-blue');
        setCustomWallpaperUrl('');
        setInputUrl('');
        setSoundEnabled(true);
        setUploadStatus('');
        showAlert({
          type: 'success',
          title: 'Reset Berhasil',
          message: 'Seluruh preferensi OS berhasil dikembalikan ke standar bawaan pabrik.'
        });
      }
    });
  };

  const handleClearCache = () => {
    showConfirm({
      type: 'warning',
      title: 'Hapus Cache & Refresh OS',
      message: 'Bersihkan seluruh cache browser & Service Worker PWA untuk memuat pembaruan aplikasi terbaru?',
      confirmText: 'Ya, Hapus Cache',
      cancelText: 'Batal',
      onConfirm: () => {
        clearAppCache();
      }
    });
  };

  const handleSelectTab = (tabKey) => {
    setActiveTab(tabKey);
    setIsMobileDetailOpen(true);
  };

  const getTabTitle = (tabKey) => {
    if (tabKey === 'visual') return 'Visual & Tampilan';
    if (tabKey === 'sound') return 'Efek Suara (Audio FX)';
    if (tabKey === 'system') return 'Sistem & Info';
    return 'Pengaturan OS';
  };

  return (
    <div className="tool-container" style={{ padding: 0 }}>
      <div
        ref={containerRef}
        className={`win-settings-container ${isNarrowWindow ? 'is-narrow-window' : ''} ${
          isMobileDetailOpen ? 'mobile-show-detail' : 'mobile-show-list'
        }`}
      >
        
        {/* Left Sidebar (Desktop side-by-side / Mobile Category List) */}
        <div className="win-settings-sidebar">
          <div className="win-settings-sidebar-header">Pengaturan OS</div>

          <button
            className={`win-settings-nav-item ${activeTab === 'visual' ? 'is-active' : ''}`}
            onClick={() => handleSelectTab('visual')}
          >
            <div className="win-settings-nav-left">
              <Palette size={16} />
              <span>Visual & Tampilan</span>
            </div>
            <ChevronRight size={14} className="win-settings-chevron-mobile" />
          </button>

          <button
            className={`win-settings-nav-item ${activeTab === 'sound' ? 'is-active' : ''}`}
            onClick={() => handleSelectTab('sound')}
          >
            <div className="win-settings-nav-left">
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>Efek Suara (Audio FX)</span>
            </div>
            <ChevronRight size={14} className="win-settings-chevron-mobile" />
          </button>

          <button
            className={`win-settings-nav-item ${activeTab === 'system' ? 'is-active' : ''}`}
            onClick={() => handleSelectTab('system')}
          >
            <div className="win-settings-nav-left">
              <Info size={16} />
              <span>Sistem & Info</span>
            </div>
            <ChevronRight size={14} className="win-settings-chevron-mobile" />
          </button>
        </div>

        {/* Right Content Area */}
        <div className="win-settings-content">
          
          {/* Mobile Back Header */}
          <div className="win-settings-mobile-back">
            <button className="btn-mobile-back" onClick={() => setIsMobileDetailOpen(false)}>
              <ChevronLeft size={16} /> Kembali ke Daftar
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 4 }}>
              {getTabTitle(activeTab)}
            </span>
          </div>

          <div className="tool-form-grid">
            {/* TAB 1: VISUAL & TAMPILAN */}
            {activeTab === 'visual' && (
              <div className="settings-section-stack">
                {/* Kategori 1: Tema Desktop OS */}
                <div className="settings-category-card">
                  <div className="category-header">
                    <div className="category-title-group">
                      <div className="category-icon-badge">
                        <Palette size={16} />
                      </div>
                      <div>
                        <h3 className="category-title-text">Tema Desktop OS</h3>
                        <p className="category-subtitle-text">Pilih gaya & skema warna antarmuka sistem</p>
                      </div>
                    </div>
                  </div>

                  <div className="theme-options-grid">
                    <button
                      className={`theme-card ${theme === 'default' ? 'is-active' : ''}`}
                      onClick={() => setTheme('default')}
                    >
                      <div className="theme-preview default-preview" />
                      <span>Light Glass (Default)</span>
                    </button>

                    <button
                      className={`theme-card ${theme === 'soft' ? 'is-active' : ''}`}
                      onClick={() => setTheme('soft')}
                    >
                      <div className="theme-preview soft-preview" />
                      <span>Soft Pastel</span>
                    </button>

                    <button
                      className={`theme-card ${theme === 'focus' ? 'is-active' : ''}`}
                      onClick={() => setTheme('focus')}
                    >
                      <div className="theme-preview focus-preview" />
                      <span>Midnight Dark</span>
                    </button>
                  </div>
                </div>

                {/* Kategori 2: Latar Belakang / Wallpaper */}
                <div className="settings-category-card">
                  <div className="category-header">
                    <div className="category-title-group">
                      <div className="category-icon-badge">
                        <ImageIcon size={16} />
                      </div>
                      <div>
                        <h3 className="category-title-text">Latar Belakang / Wallpaper</h3>
                        <p className="category-subtitle-text">Kustomisasi gambar latar belakang desktop Anda</p>
                      </div>
                    </div>
                  </div>

                  {/* Sub-tabs for Wallpaper Source */}
                  <div className="tab-pill-row" style={{ marginBottom: 14 }}>
                    <button
                      className={`tab-pill-btn ${wallpaperTab === 'gallery' ? 'is-active' : ''}`}
                      onClick={() => setWallpaperTab('gallery')}
                    >
                      Galeri Preset
                    </button>
                    <button
                      className={`tab-pill-btn ${wallpaperTab === 'upload' ? 'is-active' : ''}`}
                      onClick={() => setWallpaperTab('upload')}
                    >
                      <Upload size={14} /> Upload Gambar
                    </button>
                    <button
                      className={`tab-pill-btn ${wallpaperTab === 'url' ? 'is-active' : ''}`}
                      onClick={() => setWallpaperTab('url')}
                    >
                      <LinkIcon size={14} /> Link URL
                    </button>
                  </div>

                  {/* Preset Gallery Grid */}
                  {wallpaperTab === 'gallery' && (
                    <div className="wallpaper-gallery-grid">
                      {wallpapers.map((wp) => (
                        <button
                          key={wp.id}
                          className={`wallpaper-card ${wallpaper === wp.id ? 'is-active' : ''}`}
                          onClick={() => setWallpaper(wp.id)}
                        >
                          <div className="wallpaper-thumb" style={{ background: wp.bg }} />
                          <span>{wp.title}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Upload Image File */}
                  {wallpaperTab === 'upload' && (
                    <div className="custom-wallpaper-container">
                      <label className="wallpaper-dropzone">
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                        />
                        <Upload size={28} className="dropzone-icon" />
                        <div className="dropzone-text">
                          <strong>Pilih foto dari komputer / HP Anda</strong>
                          <span>Auto-Resize & Kompresi HD otomatis disimpan di browser</span>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Custom URL Link */}
                  {wallpaperTab === 'url' && (
                    <div className="custom-wallpaper-container">
                      <div className="custom-url-input-group">
                        <input
                          type="text"
                          className="tool-input"
                          placeholder="Paste URL gambar (e.g. https://images.unsplash.com/...)"
                          value={inputUrl}
                          onChange={(e) => setInputUrl(e.target.value)}
                        />
                        <button className="btn-primary" onClick={handleApplyUrl}>
                          Terapkan
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Status Message */}
                  {uploadStatus && (
                    <div className="wallpaper-status-badge" style={{ marginTop: 8 }}>
                      {isProcessing ? <RefreshCw size={14} className="spin-icon" /> : <Check size={14} />}
                      <span>{uploadStatus}</span>
                    </div>
                  )}

                  {/* Custom Wallpaper Active Preview */}
                  {wallpaper === 'custom-url' && customWallpaperUrl && (
                    <div className="custom-wallpaper-preview-card" style={{ marginTop: 12 }}>
                      <div className="preview-info">
                        <span>Wallpaper Kustom Aktif</span>
                        <button className="btn-danger-sm" onClick={handleResetCustomWallpaper} title="Hapus Custom Wallpaper">
                          <Trash2 size={13} /> Reset Wallpaper
                        </button>
                      </div>
                      <div
                        className="custom-wallpaper-thumb"
                        style={{ backgroundImage: `url(${customWallpaperUrl})` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: SOUND & AUDIO */}
            {activeTab === 'sound' && (
              <div className="settings-section-stack">
                <div className="settings-category-card">
                  <div className="category-header">
                    <div className="category-title-group">
                      <div className="category-icon-badge">
                        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      </div>
                      <div>
                        <h3 className="category-title-text">Efek Suara OS (Audio FX)</h3>
                        <p className="category-subtitle-text">Atur respon efek suara antarmuka desktop</p>
                      </div>
                    </div>
                  </div>

                  <div className="sound-toggle-card">
                    <div className="sound-info">
                      <div className="sound-title">Suara Sintetis Web OS</div>
                      <div className="sound-desc">
                        Efek suara responsif tanpa lag (Web Audio API) saat berinteraksi dengan window, dock, dan spotlight
                      </div>
                    </div>
                    <button
                      className={`toggle-switch ${soundEnabled ? 'is-on' : ''}`}
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      title={soundEnabled ? 'Matikan Suara OS' : 'Aktifkan Suara OS'}
                    >
                      <div className="toggle-handle" />
                    </button>
                  </div>
                </div>

                {/* Kategori 2: Pengaturan Suara per Aksi */}
                <div className="settings-category-card">
                  <div className="category-header">
                    <div className="category-title-group">
                      <div className="category-icon-badge">
                        <Play size={16} />
                      </div>
                      <div>
                        <h3 className="category-title-text">Pengaturan Suara per Aksi</h3>
                        <p className="category-subtitle-text">Aktifkan / matikan efek suara tertentu & uji bunyinya</p>
                      </div>
                    </div>
                  </div>

                  <div className="sound-effects-stack">
                    {/* 1. Suara Klik */}
                    <div className="sound-effect-item">
                      <div className="sound-effect-left">
                        <div className="sound-effect-icon">
                          <MousePointer size={15} />
                        </div>
                        <div className="sound-effect-meta">
                          <span className="sound-effect-name">Suara Klik Tombol</span>
                          <span className="sound-effect-desc">Nada klik saat menekan tombol & menu</span>
                        </div>
                      </div>
                      <div className="sound-effect-actions">
                        <button className="sound-test-mini-btn" onClick={() => playSound('click', true)} title="Uji Suara Klik">
                          <Play size={12} /> Test
                        </button>
                        <button
                          className={`toggle-switch ${soundConfig?.click !== false ? 'is-on' : ''}`}
                          onClick={() => toggleSoundEffect('click')}
                          title={soundConfig?.click !== false ? 'Matikan Suara Klik' : 'Aktifkan Suara Klik'}
                        >
                          <div className="toggle-handle" />
                        </button>
                      </div>
                    </div>

                    {/* 2. Suara Buka Window */}
                    <div className="sound-effect-item">
                      <div className="sound-effect-left">
                        <div className="sound-effect-icon">
                          <Maximize2 size={15} />
                        </div>
                        <div className="sound-effect-meta">
                          <span className="sound-effect-name">Suara Buka Window</span>
                          <span className="sound-effect-desc">Nada lonceng kaca halus saat membuka jendela</span>
                        </div>
                      </div>
                      <div className="sound-effect-actions">
                        <button className="sound-test-mini-btn" onClick={() => playSound('open', true)} title="Uji Suara Buka">
                          <Play size={12} /> Test
                        </button>
                        <button
                          className={`toggle-switch ${soundConfig?.open !== false ? 'is-on' : ''}`}
                          onClick={() => toggleSoundEffect('open')}
                          title={soundConfig?.open !== false ? 'Matikan Suara Buka' : 'Aktifkan Suara Buka'}
                        >
                          <div className="toggle-handle" />
                        </button>
                      </div>
                    </div>

                    {/* 3. Suara Minimize */}
                    <div className="sound-effect-item">
                      <div className="sound-effect-left">
                        <div className="sound-effect-icon">
                          <Minimize2 size={15} />
                        </div>
                        <div className="sound-effect-meta">
                          <span className="sound-effect-name">Suara Minimize</span>
                          <span className="sound-effect-desc">Nada meluncur saat meminimalkan jendela</span>
                        </div>
                      </div>
                      <div className="sound-effect-actions">
                        <button className="sound-test-mini-btn" onClick={() => playSound('minimize', true)} title="Uji Suara Minimize">
                          <Play size={12} /> Test
                        </button>
                        <button
                          className={`toggle-switch ${soundConfig?.minimize !== false ? 'is-on' : ''}`}
                          onClick={() => toggleSoundEffect('minimize')}
                          title={soundConfig?.minimize !== false ? 'Matikan Suara Minimize' : 'Aktifkan Suara Minimize'}
                        >
                          <div className="toggle-handle" />
                        </button>
                      </div>
                    </div>

                    {/* 4. Suara Tutup Window */}
                    <div className="sound-effect-item">
                      <div className="sound-effect-left">
                        <div className="sound-effect-icon">
                          <Trash2 size={15} />
                        </div>
                        <div className="sound-effect-meta">
                          <span className="sound-effect-name">Suara Tutup Window</span>
                          <span className="sound-effect-desc">Nada menurun halus saat menutup jendela</span>
                        </div>
                      </div>
                      <div className="sound-effect-actions">
                        <button className="sound-test-mini-btn" onClick={() => playSound('close', true)} title="Uji Suara Tutup">
                          <Play size={12} /> Test
                        </button>
                        <button
                          className={`toggle-switch ${soundConfig?.close !== false ? 'is-on' : ''}`}
                          onClick={() => toggleSoundEffect('close')}
                          title={soundConfig?.close !== false ? 'Matikan Suara Tutup' : 'Aktifkan Suara Tutup'}
                        >
                          <div className="toggle-handle" />
                        </button>
                      </div>
                    </div>

                    {/* 5. Suara Spotlight Search */}
                    <div className="sound-effect-item">
                      <div className="sound-effect-left">
                        <div className="sound-effect-icon">
                          <Search size={15} />
                        </div>
                        <div className="sound-effect-meta">
                          <span className="sound-effect-name">Suara Spotlight Search</span>
                          <span className="sound-effect-desc">Nada dentang tinggi saat Ctrl + Space</span>
                        </div>
                      </div>
                      <div className="sound-effect-actions">
                        <button className="sound-test-mini-btn" onClick={() => playSound('spotlight', true)} title="Uji Suara Spotlight">
                          <Play size={12} /> Test
                        </button>
                        <button
                          className={`toggle-switch ${soundConfig?.spotlight !== false ? 'is-on' : ''}`}
                          onClick={() => toggleSoundEffect('spotlight')}
                          title={soundConfig?.spotlight !== false ? 'Matikan Suara Spotlight' : 'Aktifkan Suara Spotlight'}
                        >
                          <div className="toggle-handle" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SYSTEM & INFO */}
            {activeTab === 'system' && (
              <div className="settings-section-stack">
                <div className="settings-category-card">
                  <div className="category-header">
                    <div className="category-title-group">
                      <div className="category-icon-badge">
                        <Info size={16} />
                      </div>
                      <div>
                        <h3 className="category-title-text">Informasi Totools Web OS</h3>
                        <p className="category-subtitle-text">Platform alat produktivitas ringan berbasis browser</p>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                    Totools berjalan 100% di browser lokal Anda tanpa membutuhkan instalasi aplikasi eksternal.
                  </p>
                  <div className="badge-row">
                    <span className="pill-badge" style={{ background: '#2563eb', color: '#ffffff', fontWeight: 700 }}>
                      {getFormattedVersion()}
                    </span>
                    <span className="pill-badge">Windows 11 Start Menu</span>
                    <span className="pill-badge">Windows 10 Settings Layout</span>
                    <span className="pill-badge">Audio FX Synthesizer</span>
                    <span className="pill-badge">Auto-Resize Canvas</span>
                    <span className="pill-badge">Spotlight Search</span>
                    <span className="pill-badge">React 18 + Vite 6</span>
                  </div>
                </div>

                {/* Kategori PWA Install */}
                <div className="settings-category-card">
                  <div className="category-header">
                    <div className="category-title-group">
                      <div className="category-icon-badge" style={{ background: 'linear-gradient(135deg, #0284c7, #2563eb)' }}>
                        <Download size={16} />
                      </div>
                      <div>
                        <h3 className="category-title-text">Aplikasi Desktop & HP Native (PWA)</h3>
                        <p className="category-subtitle-text">Pasang Totools sebagai aplikasi mandiri yang bekerja 100% offline</p>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                    Jalankan Totools layaknya aplikasi desktop (Windows/Mac) atau HP (Android/iOS) native tanpa bar navigasi browser.
                  </p>

                  {isPWAInstalled ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(22, 163, 74, 0.1)', border: '1px solid rgba(22, 163, 74, 0.25)', borderRadius: 8, color: '#16a34a', fontSize: 12, fontWeight: 700 }}>
                      <Check size={16} />
                      <span>Totools OS Sudah Terpasang (Mode Standalone Native)</span>
                    </div>
                  ) : (
                    <button className="btn-primary" onClick={handleTriggerPWAInstall} style={{ padding: '8px 14px' }}>
                      <Download size={14} /> {canInstallPWA ? 'Install Totools OS Sekarang' : 'Petunjuk Pasang Aplikasi PWA'}
                    </button>
                  )}
                </div>

                <div className="settings-category-card">
                  <div className="category-header">
                    <div className="category-title-group">
                      <div className="category-icon-badge" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                        <RefreshCw size={16} />
                      </div>
                      <div>
                        <h3 className="category-title-text">Hapus Cache & Refresh OS</h3>
                        <p className="category-subtitle-text">Bersihkan Service Worker & Cache Storage untuk memuat update terbaru</p>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                    Gunakan opsi ini jika terdapat pembaruan kode/fitur berkala atau untuk memuat ulang seluruh aset aplikasi secara segar.
                  </p>
                  <button className="btn-primary" onClick={handleClearCache} style={{ padding: '8px 14px' }}>
                    <RefreshCw size={14} /> Hapus Cache & Memuat Ulang Aplikasi
                  </button>
                </div>

                <div className="settings-category-card">
                  <div className="category-header">
                    <div className="category-title-group">
                      <div className="category-icon-badge" style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)' }}>
                        <RotateCcw size={16} />
                      </div>
                      <div>
                        <h3 className="category-title-text">Reset Preferensi OS</h3>
                        <p className="category-subtitle-text">Kembalikan tema, wallpaper & suara ke standar pabrik</p>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                    Tindakan ini akan mengembalikan preferensi tampilan dan suara ke pengaturan awal standar.
                  </p>
                  <button className="btn-danger-sm" onClick={handleResetAllPreferences} style={{ padding: '8px 14px' }}>
                    <RotateCcw size={14} /> Kembalikan Pengaturan ke Bawaan Pabrik
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      <AdBanner type="inline" />
    </div>
  );
};
