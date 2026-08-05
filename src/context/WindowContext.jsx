import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  DollarSign, 
  Languages, 
  Barcode, 
  QrCode, 
  Hash, 
  Image as ImageIcon, 
  Settings
} from 'lucide-react';
import { playSound } from '../utils/audio';

export const TOOLS_LIST = [
  {
    id: 'currency',
    title: 'Konversi Mata Uang',
    desc: 'Kurs mata uang real-time global',
    icon: DollarSign,
    color: 'linear-gradient(145deg, #16a34a, #22c55e)',
    defaultSize: { width: 500, height: 550 },
    shortcutKey: '1'
  },
  {
    id: 'translate',
    title: 'Penerjemah Teks',
    desc: 'Terjemahkan teks antar bahasa',
    icon: Languages,
    color: 'linear-gradient(145deg, #2563eb, #60a5fa)',
    defaultSize: { width: 580, height: 520 },
    shortcutKey: '2'
  },
  {
    id: 'barcode',
    title: 'Barcode Generator',
    desc: 'Buat barcode 1D/2D instan',
    icon: Barcode,
    color: 'linear-gradient(145deg, #334155, #111827)',
    defaultSize: { width: 520, height: 560 },
    shortcutKey: '3'
  },
  {
    id: 'qrcode',
    title: 'QR Code Generator',
    desc: 'Buat & kustomisasi QR Code',
    icon: QrCode,
    color: 'linear-gradient(145deg, #7c3aed, #c084fc)',
    defaultSize: { width: 540, height: 600 },
    shortcutKey: '4'
  },
  {
    id: 'wordcounter',
    title: 'Word Counter',
    desc: 'Hitung kata, karakter & statistik',
    icon: Hash,
    color: 'linear-gradient(145deg, #0891b2, #67e8f9)',
    defaultSize: { width: 560, height: 500 },
    shortcutKey: '6'
  },
  {
    id: 'collage',
    title: 'Collage Maker',
    desc: 'Gabungkan beberapa foto menarik',
    icon: ImageIcon,
    color: 'linear-gradient(145deg, #ec4899, #f472b6)',
    defaultSize: { width: 680, height: 620 },
    shortcutKey: '7'
  },
  {
    id: 'settings',
    title: 'Pengaturan OS',
    desc: 'Ubah tema desktop & preferensi',
    icon: Settings,
    color: 'linear-gradient(145deg, #f97316, #facc15)',
    defaultSize: { width: 460, height: 420 },
    shortcutKey: '5'
  }
];

const WindowContext = createContext();

export const WindowProvider = ({ children }) => {
  const [openWindows, setOpenWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [topZIndex, setTopZIndex] = useState(10);
  const [theme, setThemeState] = useState(() => localStorage.getItem('totools_theme') || 'default');
  const [wallpaper, setWallpaperState] = useState(() => localStorage.getItem('totools_wallpaper') || 'glass-blue');
  const [customWallpaperUrl, setCustomWallpaperUrlState] = useState(() => localStorage.getItem('totools_custom_wallpaper_url') || '');
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    const saved = localStorage.getItem('totools_sound_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const defaultSoundConfig = {
    click: true,
    open: true,
    minimize: true,
    close: true,
    spotlight: true
  };

  const [soundConfig, setSoundConfigState] = useState(() => {
    try {
      const saved = localStorage.getItem('totools_sound_config');
      return saved ? JSON.parse(saved) : defaultSoundConfig;
    } catch (e) {
      return defaultSoundConfig;
    }
  });

  const toggleSoundEffect = (effectKey) => {
    setSoundConfigState((prev) => {
      const next = { ...prev, [effectKey]: !prev[effectKey] };
      localStorage.setItem('totools_sound_config', JSON.stringify(next));
      if (next[effectKey]) {
        playSound(effectKey, soundEnabled, next);
      } else {
        playSound('click', soundEnabled, next);
      }
      return next;
    });
  };

  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  // Custom Windows 11 Modal Dialog State
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'Ya, Lanjutkan',
    cancelText: 'Batal',
    onConfirm: null,
    onCancel: null
  });

  const showAlert = ({ title, message, type = 'info', onConfirm = null }) => {
    playSound('open', soundEnabled);
    setDialogState({
      isOpen: true,
      type,
      title,
      message,
      confirmText: 'Mengerti',
      cancelText: null,
      onConfirm,
      onCancel: null
    });
  };

  const showConfirm = ({
    title,
    message,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    type = 'warning',
    onConfirm,
    onCancel = null
  }) => {
    playSound('open', soundEnabled);
    setDialogState({
      isOpen: true,
      type,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
      onCancel
    });
  };

  const closeDialog = () => {
    playSound('click', soundEnabled);
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('totools_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-wallpaper', wallpaper);
    localStorage.setItem('totools_wallpaper', wallpaper);
  }, [wallpaper]);

  const setSoundEnabled = (enabled) => {
    setSoundEnabledState(enabled);
    localStorage.setItem('totools_sound_enabled', JSON.stringify(enabled));
    if (enabled) {
      playSound('open', true, soundConfig);
    }
  };

  const setCustomWallpaperUrl = (url) => {
    setCustomWallpaperUrlState(url);
    localStorage.setItem('totools_custom_wallpaper_url', url);
  };

  // Intercept browser / mobile hardware Back button to close top active window instead of exiting web
  useEffect(() => {
    const handlePopState = () => {
      setOpenWindows((prev) => {
        const visible = prev.filter((w) => !w.isMinimized);
        if (visible.length > 0) {
          const highestZ = visible.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), visible[0]);
          playSound('close', soundEnabled, soundConfig);
          return prev.filter((w) => w.instanceId !== highestZ.instanceId);
        }
        return prev;
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [soundEnabled, soundConfig]);

  // Listen for Escape key & Ctrl+Space for Spotlight
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle Spotlight with Ctrl+Space or Cmd+Space
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        setIsSpotlightOpen((prev) => {
          const next = !prev;
          if (next) playSound('spotlight', soundEnabled, soundConfig);
          return next;
        });
        return;
      }

      if (e.key === 'Escape') {
        if (isSpotlightOpen) {
          setIsSpotlightOpen(false);
          playSound('click', soundEnabled, soundConfig);
          return;
        }

        if (isStartOpen) {
          setIsStartOpen(false);
          playSound('click', soundEnabled, soundConfig);
          return;
        }

        setOpenWindows((prev) => {
          const visible = prev.filter((w) => !w.isMinimized);
          if (visible.length > 0) {
            const topWin = visible.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), visible[0]);
            playSound('close', soundEnabled, soundConfig);
            return prev.filter((w) => w.instanceId !== topWin.instanceId);
          }
          return prev;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStartOpen, isSpotlightOpen, soundEnabled, soundConfig]);

  const openTool = (toolId) => {
    setIsStartOpen(false);
    setIsSpotlightOpen(false);
    
    // Check if window already open
    const existing = openWindows.find((w) => w.id === toolId);
    if (existing) {
      if (existing.isMinimized) {
        setOpenWindows((prev) =>
          prev.map((w) => (w.id === toolId ? { ...w, isMinimized: false } : w))
        );
      }
      focusWindow(existing.instanceId);
      playSound('open', soundEnabled, soundConfig);
      return;
    }

    const toolConfig = TOOLS_LIST.find((t) => t.id === toolId);
    if (!toolConfig) return;

    const newZIndex = topZIndex + 1;
    setTopZIndex(newZIndex);

    // Initial staggered position
    const offset = (openWindows.length % 5) * 30;
    const initialX = Math.max(20, Math.min(window.innerWidth - toolConfig.defaultSize.width - 20, 100 + offset));
    const initialY = Math.max(20, Math.min(window.innerHeight - toolConfig.defaultSize.height - 80, 60 + offset));

    const newWindow = {
      id: toolConfig.id,
      instanceId: `${toolConfig.id}-${Date.now()}`,
      title: toolConfig.title,
      icon: toolConfig.icon,
      color: toolConfig.color,
      isMinimized: false,
      isMaximized: false,
      position: { x: initialX, y: initialY },
      size: { ...toolConfig.defaultSize },
      zIndex: newZIndex
    };

    // Push history state so back button closes this window
    window.history.pushState({ instanceId: newWindow.instanceId }, '');

    playSound('open', soundEnabled, soundConfig);
    setOpenWindows((prev) => [...prev, newWindow]);
    setActiveWindowId(newWindow.instanceId);
  };

  const closeWindow = (instanceId) => {
    playSound('close', soundEnabled, soundConfig);
    setOpenWindows((prev) => prev.filter((w) => w.instanceId !== instanceId));
    if (activeWindowId === instanceId) {
      const remaining = openWindows.filter((w) => w.instanceId !== instanceId);
      if (remaining.length > 0) {
        const highestZ = remaining.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), remaining[0]);
        setActiveWindowId(highestZ.instanceId);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const minimizeWindow = (instanceId) => {
    playSound('minimize', soundEnabled, soundConfig);
    setOpenWindows((prev) =>
      prev.map((w) =>
        w.instanceId === instanceId
          ? { ...w, isMinimized: true, isMaximized: false }
          : w
      )
    );
    if (activeWindowId === instanceId) {
      const remaining = openWindows.filter((w) => w.instanceId !== instanceId && !w.isMinimized);
      if (remaining.length > 0) {
        const highestZ = remaining.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), remaining[0]);
        setActiveWindowId(highestZ.instanceId);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const toggleMaximizeWindow = (instanceId) => {
    playSound('click', soundEnabled, soundConfig);
    setOpenWindows((prev) =>
      prev.map((w) => (w.instanceId === instanceId ? { ...w, isMaximized: !w.isMaximized } : w))
    );
    focusWindow(instanceId);
  };

  const focusWindow = (instanceId) => {
    const target = openWindows.find((w) => w.instanceId === instanceId);
    if (!target) return;

    const newZ = topZIndex + 1;
    setTopZIndex(newZ);
    setOpenWindows((prev) =>
      prev.map((w) => (w.instanceId === instanceId ? { ...w, zIndex: newZ, isMinimized: false } : w))
    );
    setActiveWindowId(instanceId);
  };

  const updateWindowPosition = (instanceId, newPos) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.instanceId === instanceId ? { ...w, position: newPos } : w))
    );
  };

  const updateWindowSize = (instanceId, newSize) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.instanceId === instanceId ? { ...w, size: newSize } : w))
    );
  };

  const toggleStartMenu = () => {
    playSound('click', soundEnabled, soundConfig);
    setIsStartOpen((prev) => !prev);
  };
  
  const toggleSpotlight = () => {
    playSound('spotlight', soundEnabled, soundConfig);
    setIsSpotlightOpen((prev) => !prev);
  };

  return (
    <WindowContext.Provider
      value={{
        toolsList: TOOLS_LIST,
        openWindows,
        activeWindowId,
        theme,
        setTheme: setThemeState,
        wallpaper,
        setWallpaper: setWallpaperState,
        customWallpaperUrl,
        setCustomWallpaperUrl,
        soundEnabled,
        setSoundEnabled,
        soundConfig,
        toggleSoundEffect,
        isStartOpen,
        toggleStartMenu,
        isSpotlightOpen,
        setIsSpotlightOpen,
        toggleSpotlight,
        openTool,
        closeWindow,
        minimizeWindow,
        toggleMaximizeWindow,
        focusWindow,
        updateWindowPosition,
        updateWindowSize,
        dialogState,
        showAlert,
        showConfirm,
        closeDialog
      }}
    >
      {children}
    </WindowContext.Provider>
  );
};

export const useWindowContext = () => useContext(WindowContext);
