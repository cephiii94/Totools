import React, { useState, useEffect, useRef } from 'react';
import { useWindowContext } from '../../context/WindowContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Power,
  Settings as SettingsIcon,
  RotateCcw,
  Lock,
  Sparkles,
  X,
  LogIn,
  LogOut
} from 'lucide-react';

import { clearAppCache } from '../../utils/cache';

export const StartMenu = () => {
  const { toolsList, openTool, isStartOpen, toggleStartMenu } = useWindowContext();
  const { user, openAuthModal, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('pinned'); // 'pinned' | 'all'

  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const menuRef = useRef(null);
  const powerRef = useRef(null);

  // Close Start Menu & Power dropdown if clicked outside
  useEffect(() => {
    if (!isStartOpen) return;

    const handleClickOutside = (e) => {
      // Close power menu if clicked outside power button wrapper
      if (powerRef.current && !powerRef.current.contains(e.target)) {
        setShowPowerMenu(false);
      }

      // Close start menu if clicked outside start menu popup and start button
      const startBtn = document.querySelector('.win11-start-btn');
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        (!startBtn || !startBtn.contains(e.target))
      ) {
        toggleStartMenu();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStartOpen, toggleStartMenu]);

  // Reset view mode and state when opening/closing
  useEffect(() => {
    if (!isStartOpen) {
      setViewMode('pinned');
      setSearchQuery('');
      setShowPowerMenu(false);
    }
  }, [isStartOpen]);

  if (!isStartOpen) return null;

  const filteredTools = toolsList.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Recommended tools display (pick 4 tools)
  const recommendedTools = toolsList.slice(0, 4);

  const handlePowerAction = (action) => {
    setShowPowerMenu(false);
    if (action === 'restart') {
      clearAppCache();
    } else if (action === 'settings') {
      openTool('settings');
    } else if (action === 'lock') {
      toggleStartMenu();
    }
  };

  return (
    <div className="win11-start-menu" ref={menuRef}>
      {/* Top Search Bar */}
      <div className="win11-start-search">
        <Search size={16} className="win11-search-icon" />
        <input
          type="text"
          placeholder="Cari aplikasi, setelan, dan dokumen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
        {searchQuery ? (
          <button className="win11-search-clear" onClick={() => setSearchQuery('')} title="Hapus pencarian">
            <X size={14} />
          </button>
        ) : (
          <span className="win11-search-shortcut">Ctrl + K</span>
        )}
      </div>

      {/* Main Content Body */}
      <div className="win11-start-body">
        {searchQuery ? (
          /* Search Results View */
          <div className="win11-section">
            <div className="win11-section-header">
              <span className="win11-section-title">Hasil Pencarian ({filteredTools.length})</span>
            </div>
            {filteredTools.length > 0 ? (
              <div className="win11-all-apps-list">
                {filteredTools.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button key={t.id} className="win11-app-row" onClick={() => openTool(t.id)}>
                      <div className="win11-app-icon-badge" style={{ background: t.color }}>
                        {Icon && <Icon size={18} color="#ffffff" />}
                      </div>
                      <div className="win11-app-info">
                        <span className="win11-app-title">{t.title}</span>
                        <span className="win11-app-desc">{t.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="win11-empty-search">
                <Sparkles size={28} />
                <p>Tidak ditemukan hasil untuk "{searchQuery}"</p>
              </div>
            )}
          </div>
        ) : viewMode === 'all' ? (
          /* All Apps View */
          <div className="win11-section">
            <div className="win11-section-header">
              <span className="win11-section-title">Semua Aplikasi</span>
              <button className="win11-btn-nav" onClick={() => setViewMode('pinned')}>
                <ChevronLeft size={14} /> Kembali
              </button>
            </div>
            <div className="win11-all-apps-list">
              {toolsList.map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.id} className="win11-app-row" onClick={() => openTool(t.id)}>
                    <div className="win11-app-icon-badge" style={{ background: t.color }}>
                      {Icon && <Icon size={18} color="#ffffff" />}
                    </div>
                    <div className="win11-app-info">
                      <span className="win11-app-title">{t.title}</span>
                      <span className="win11-app-desc">{t.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Pinned + Recommended Standard View */
          <>
            {/* Pinned Section */}
            <div className="win11-section">
              <div className="win11-section-header">
                <span className="win11-section-title">Disematkan</span>
                <button className="win11-btn-nav" onClick={() => setViewMode('all')}>
                  Semua aplikasi <ChevronRight size={14} />
                </button>
              </div>
              <div className="win11-pinned-grid">
                {toolsList.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button key={t.id} className="win11-pinned-item" onClick={() => openTool(t.id)}>
                      <div className="win11-pinned-icon" style={{ background: t.color }}>
                        {Icon && <Icon size={22} color="#ffffff" />}
                      </div>
                      <span className="win11-pinned-label">{t.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recommended Section */}
            <div className="win11-section win11-recommended-section">
              <div className="win11-section-header">
                <span className="win11-section-title">Direkomendasikan</span>
                <span className="win11-section-badge">Terbaru</span>
              </div>
              <div className="win11-recommended-grid">
                {recommendedTools.map((t, idx) => {
                  const Icon = t.icon;
                  const timeAgo = ['Baru saja', '5m lalu', '1j lalu', 'Kemarin'][idx] || 'Baru saja';
                  return (
                    <button key={t.id} className="win11-recommended-item" onClick={() => openTool(t.id)}>
                      <div className="win11-rec-icon" style={{ background: t.color }}>
                        {Icon && <Icon size={16} color="#ffffff" />}
                      </div>
                      <div className="win11-rec-text">
                        <span className="win11-rec-title">{t.title}</span>
                        <span className="win11-rec-sub">{timeAgo} • Alat Produktivitas</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Profile & Power */}
      <div className="win11-start-footer">
        <div
          className="win11-user-profile"
          onClick={() => {
            if (!user) {
              toggleStartMenu();
              openAuthModal();
            }
          }}
          title={user ? `Login sebagai ${user.email}` : 'Klik untuk Masuk / Daftar Akun'}
          style={{ cursor: 'pointer' }}
        >
          <div className="win11-avatar" style={{ overflow: 'hidden' }}>
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span>{user ? (user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase() : 'Guest'}</span>
            )}
          </div>
          <div className="win11-user-info">
            <span className="win11-user-name">
              {user ? (user.user_metadata?.full_name || user.email?.split('@')[0]) : 'Tamu / Guest'}
            </span>
            <span className="win11-user-status" style={{ color: user ? '#16a34a' : '#64748b' }}>
              {user ? '🟢 Terhubung Supabase' : '⚪ Mode Lokal'}
            </span>
          </div>
        </div>

        <div className="win11-power-wrapper" ref={powerRef}>
          {showPowerMenu && (
            <div className="win11-power-popup">
              {user ? (
                <button
                  className="win11-power-option"
                  onClick={() => {
                    setShowPowerMenu(false);
                    signOut();
                  }}
                  style={{ color: '#dc2626' }}
                >
                  <LogOut size={15} />
                  <span>Keluar Akun (Sign Out)</span>
                </button>
              ) : (
                <button
                  className="win11-power-option"
                  onClick={() => {
                    setShowPowerMenu(false);
                    toggleStartMenu();
                    openAuthModal();
                  }}
                  style={{ color: '#2563eb' }}
                >
                  <LogIn size={15} />
                  <span>Masuk / Daftar Akun</span>
                </button>
              )}
              <button className="win11-power-option" onClick={() => handlePowerAction('restart')}>
                <RotateCcw size={15} />
                <span>Mulai Ulang & Hapus Cache</span>
              </button>
              <button className="win11-power-option" onClick={() => handlePowerAction('settings')}>
                <SettingsIcon size={15} />
                <span>Pengaturan OS</span>
              </button>
              <button className="win11-power-option" onClick={() => handlePowerAction('lock')}>
                <Lock size={15} />
                <span>Kunci / Sembunyikan</span>
              </button>
            </div>
          )}

          <button
            className={`win11-power-btn ${showPowerMenu ? 'active' : ''}`}
            onClick={() => setShowPowerMenu((prev) => !prev)}
            title="Daya & Akun"
          >
            <Power size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};

