import React, { useState, useEffect } from 'react';
import { useWindowContext } from '../../context/WindowContext';
import { LayoutGrid } from 'lucide-react';
import { StartMenu } from './StartMenu';

export const Dock = () => {
  const { toolsList, openWindows, activeWindowId, openTool, focusWindow, toggleStartMenu } = useWindowContext();
  const [time, setTime] = useState('');
  const [isHoverRevealed, setIsHoverRevealed] = useState(false);

  const hasVisibleWindow = openWindows.some((w) => !w.isMinimized);
  const isMaximizedWindow = openWindows.some((w) => !w.isMinimized && w.isMaximized);

  // Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // macOS Style Hover Slide-Up Listener when mouse touches bottom edge (<= 24px) during Maximized Fullscreen
  useEffect(() => {
    if (!isMaximizedWindow) {
      setIsHoverRevealed(false);
      return;
    }

    const handleMouseMove = (e) => {
      const bottomThreshold = window.innerHeight - 24;
      const hideThreshold = window.innerHeight - 90;

      if (e.clientY >= bottomThreshold) {
        setIsHoverRevealed(true);
      } else if (e.clientY < hideThreshold) {
        setIsHoverRevealed(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMaximizedWindow]);

  return (
    <>
      <StartMenu />

      {/* Bottom edge hover trigger area for Maximized windows */}
      {isMaximizedWindow && (
        <div
          className="dock-hover-zone"
          onMouseEnter={() => setIsHoverRevealed(true)}
        />
      )}

      <div
        className={`dock-bar ${hasVisibleWindow ? 'hide-on-mobile-open' : ''} ${
          isMaximizedWindow ? 'is-auto-hidden' : ''
        } ${isHoverRevealed ? 'is-hover-revealed' : ''}`}
        onMouseEnter={() => setIsHoverRevealed(true)}
      >
        <button className="dock-item win11-start-btn" style={{ background: '#0078d4' }} onClick={toggleStartMenu} title="Start Menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="8.2" height="8.2" rx="1.5" fill="#ffffff" />
            <rect x="10.8" y="1" width="8.2" height="8.2" rx="1.5" fill="#ffffff" />
            <rect x="1" y="10.8" width="8.2" height="8.2" rx="1.5" fill="#ffffff" />
            <rect x="10.8" y="10.8" width="8.2" height="8.2" rx="1.5" fill="#ffffff" />
          </svg>
        </button>

        <div className="dock-divider" />

        {toolsList.map((tool) => {
          const activeWin = openWindows.find((w) => w.id === tool.id);
          const isOpen = !!activeWin;
          const isActive = activeWin?.instanceId === activeWindowId && !activeWin?.isMinimized;
          const Icon = tool.icon;

          return (
            <button
              key={tool.id}
              className={`dock-item ${isOpen ? 'is-open' : ''} ${isActive ? 'is-active' : ''}`}
              style={{ background: tool.color }}
              onClick={() => (isOpen ? focusWindow(activeWin.instanceId) : openTool(tool.id))}
              title={tool.title}
            >
              {Icon && <Icon size={20} />}
            </button>
          );
        })}

        <div className="dock-divider" />
        <div className="dock-time-clock" style={{ fontSize: 12, fontWeight: 700, padding: '0 6px', color: 'inherit' }}>
          {time}
        </div>
      </div>
    </>
  );
};
