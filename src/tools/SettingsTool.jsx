import React, { useState } from 'react';
import { useWindowContext } from '../context/WindowContext';
import { Palette, Image as ImageIcon, Info, Link as LinkIcon, Upload, Check, Trash2, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { AdBanner } from '../components/ads/AdBanner';

export const SettingsTool = () => {
  const { 
    theme, setTheme, 
    wallpaper, setWallpaper, 
    customWallpaperUrl, setCustomWallpaperUrl,
    soundEnabled, setSoundEnabled 
  } = useWindowContext();

  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'upload' | 'url'
  const [inputUrl, setInputUrl] = useState(customWallpaperUrl && !customWallpaperUrl.startsWith('data:') ? customWallpaperUrl : '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const wallpapers = [
    { id: 'glass-blue', title: 'Glass Blue', bg: 'linear-gradient(135deg, #0f766e 0%, #1d4ed8 44%, #312e81 100%)' },
    { id: 'dark-nebula', title: 'Dark Nebula', bg: 'linear-gradient(135deg, #020617 0%, #0f172a 45%, #164e63 100%)' },
    { id: 'pastel-sunset', title: 'Pastel Sunset', bg: 'linear-gradient(145deg, #38bdf8 0%, #a78bfa 46%, #fb7185 100%)' },
    { id: 'cyberpunk-neon', title: 'Cyberpunk Neon', bg: 'linear-gradient(135deg, #09090b 0%, #701a75 50%, #0284c7 100%)' },
    { id: 'minimal-dark', title: 'Minimal Slate', bg: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #09090b 100%)' }
  ];

  // Auto-resize high resolution image upload via HTML5 Canvas
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar yang valid (JPG, PNG, WEBP).');
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

        // Convert to optimized JPEG Data URL (quality 0.82)
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

        // Calculate approximate size in KB
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

  return (
    <div className="tool-container">
      <div className="tool-form-grid">
        {/* Sound Effects Setting */}
        <div className="form-group">
          <label className="section-title">
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />} Efek Suara OS (Audio FX)
          </label>
          <div className="sound-toggle-card">
            <div className="sound-info">
              <div className="sound-title">Suara Antarmuka Desktop OS</div>
              <div className="sound-desc">Mainkan efek suara halus ala macOS saat membuka, menutup, meremajakan, atau mencari alat</div>
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

        {/* Theme Settings */}
        <div className="form-group">
          <label className="section-title">
            <Palette size={16} /> Tema Desktop OS
          </label>
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

        {/* Custom Wallpaper Section */}
        <div className="form-group">
          <label className="section-title">
            <ImageIcon size={16} /> Wallpaper Desktop
          </label>

          {/* Sub-tabs for Wallpaper Source */}
          <div className="tab-pill-row" style={{ marginBottom: 12 }}>
            <button
              className={`tab-pill-btn ${activeTab === 'gallery' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('gallery')}
            >
              Galeri Preset
            </button>
            <button
              className={`tab-pill-btn ${activeTab === 'upload' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <Upload size={14} /> Upload Gambar
            </button>
            <button
              className={`tab-pill-btn ${activeTab === 'url' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('url')}
            >
              <LinkIcon size={14} /> Link URL
            </button>
          </div>

          {/* TAB 1: Preset Gallery */}
          {activeTab === 'gallery' && (
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

          {/* TAB 2: Upload Image File (Canvas Auto-Resize) */}
          {activeTab === 'upload' && (
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

          {/* TAB 3: Custom URL Link */}
          {activeTab === 'url' && (
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

          {/* Status Message & Preview Thumbnail */}
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

        {/* OS Information */}
        <div className="info-box-card">
          <div className="info-header">
            <Info size={18} />
            <span>Tentang Totools v2.0 Web OS</span>
          </div>
          <p>
            Totools adalah kumpulan alat produktivitas ringan berbasis Web OS yang berjalan 100% di browser Anda tanpa perlu install aplikasi.
          </p>
          <div className="badge-row">
            <span className="pill-badge">Audio FX OS</span>
            <span className="pill-badge">Auto-Resize Canvas</span>
            <span className="pill-badge">Spotlight (Ctrl+Space)</span>
            <span className="pill-badge">Vite 6</span>
            <span className="pill-badge">React 18</span>
          </div>
        </div>
      </div>

      <AdBanner type="inline" />
    </div>
  );
};
