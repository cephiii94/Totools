import React, { useState, useEffect } from 'react';
import { useWindowContext } from '../../context/WindowContext';
import { useAuth } from '../../context/AuthContext';
import { DesktopShortcut } from './DesktopShortcut';
import { Window } from '../window/Window';
import { Dock } from '../dock/Dock';
import { Spotlight } from './Spotlight';
import { PWAInstallPrompt } from '../pwa/PWAInstallPrompt';
import { Search, User } from 'lucide-react';

import { CurrencyTool } from '../../tools/CurrencyTool';
import { TranslatorTool } from '../../tools/TranslatorTool';
import { BarcodeTool } from '../../tools/BarcodeTool';
import { QrCodeTool } from '../../tools/QrCodeTool';
import { WordCounterTool } from '../../tools/WordCounterTool';
import { CollageTool } from '../../tools/CollageTool';
import { SettingsTool } from '../../tools/SettingsTool';

const TOOL_COMPONENTS = {
  currency: CurrencyTool,
  translate: TranslatorTool,
  barcode: BarcodeTool,
  qrcode: QrCodeTool,
  wordcounter: WordCounterTool,
  collage: CollageTool,
  settings: SettingsTool
};

import { CustomDialog } from '../modal/CustomDialog';
import { AuthModal } from '../modal/AuthModal';
import { UpdateToast } from '../notification/UpdateToast';

export const Desktop = () => {
  const { toolsList, openWindows, openTool, toggleSpotlight, wallpaper, customWallpaperUrl } = useWindowContext();
  const { user, openAuthModal } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [formattedDate, setFormattedDate] = useState('');

  // Dismiss Instant Splash Loading Screen smoothly on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const splash = document.getElementById('app-splash-screen');
      if (splash) {
        splash.classList.add('is-loaded');
      }
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const now = new Date();
    const hrs = now.getHours();
    if (hrs >= 3 && hrs < 11) setGreeting('Selamat Pagi ☀️');
    else if (hrs >= 11 && hrs < 15) setGreeting('Selamat Siang 🌤️');
    else if (hrs >= 15 && hrs < 18) setGreeting('Selamat Sore 🌅');
    else setGreeting('Selamat Malam 🌙');

    setFormattedDate(
      now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    );
  }, []);

  // Keyboard shortcut listener (1-7 for tools)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.matches('input, textarea, select')) return;

      const shortcuts = {
        '1': 'currency',
        '2': 'translate',
        '3': 'barcode',
        '4': 'qrcode',
        '5': 'settings',
        '6': 'wordcounter',
        '7': 'collage'
      };

      if (shortcuts[e.key]) {
        e.preventDefault();
        openTool(shortcuts[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openTool]);

  const getCustomBgStyle = () => {
    if (wallpaper === 'custom-url' && customWallpaperUrl) {
      return {
        backgroundImage: `url(${customWallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    return {};
  };

  return (
    <div className="desktop-container" style={getCustomBgStyle()}>
      <div className="desktop-grid-overlay" />

      {/* Header Info & Quick Search Trigger */}
      <div className="desktop-header-row">
        <div className="desktop-search-box" onClick={toggleSpotlight} style={{ cursor: 'pointer' }}>
          <Search size={16} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#475569', flex: 1 }}>
            Spotlight Search (Ctrl + Space)...
          </span>
          <span className="shortcut-kbd">⌘ Space</span>
        </div>

        <div className="desktop-info-card">
          <div className="greeting">{greeting}</div>
          <div className="date">{formattedDate}</div>
        </div>
      </div>


      {/* Desktop Shortcuts */}
      <div className="desktop-grid">
        {toolsList.map((tool) => (
          <DesktopShortcut key={tool.id} tool={tool} onOpen={openTool} />
        ))}
      </div>

      {/* Floating Active Windows */}
      {openWindows.map((win) => {
        const ToolComponent = TOOL_COMPONENTS[win.id];
        return (
          <Window key={win.instanceId} win={win}>
            {ToolComponent ? <ToolComponent /> : <div>Component not found</div>}
          </Window>
        );
      })}

      {/* Taskbar / Dock */}
      <Dock />

      {/* macOS Spotlight Search Modal */}
      <Spotlight />

      {/* PWA Installation Prompt Banner */}
      <PWAInstallPrompt />

      {/* Version Update & Clear Cache Toast Notification */}
      <UpdateToast />

      {/* Windows 11 Custom Modal Dialog */}
      <CustomDialog />

      {/* Supabase Auth Modal */}
      <AuthModal />
    </div>
  );
};

