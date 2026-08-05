import React, { useState, useRef, useEffect } from 'react';
import { useWindowContext } from '../../context/WindowContext';

export const Window = ({ win, children }) => {
  const {
    activeWindowId,
    focusWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    updateWindowPosition,
    updateWindowSize
  } = useWindowContext();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const resizeDirRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });
  const initialSizeRef = useRef({ width: 0, height: 0 });

  const isActive = activeWindowId === win.instanceId;

  // Window drag handler (header)
  const handleMouseDownHeader = (e) => {
    if (e.target.closest('.win-btn') || win.isMaximized) return;
    focusWindow(win.instanceId);
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { ...win.position };
  };

  // Window resize handler (handles)
  const handleMouseDownResize = (e, direction) => {
    e.stopPropagation();
    if (win.isMaximized) return;
    focusWindow(win.instanceId);
    setIsResizing(true);
    resizeDirRef.current = direction;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialSizeRef.current = { ...win.size };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Dragging position
      if (isDragging) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        
        const newX = Math.max(0, Math.min(window.innerWidth - 100, initialPosRef.current.x + dx));
        const newY = Math.max(0, Math.min(window.innerHeight - 100, initialPosRef.current.y + dy));
        
        updateWindowPosition(win.instanceId, { x: newX, y: newY });
      }

      // Resizing dimensions
      if (isResizing) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        const dir = resizeDirRef.current;

        const MIN_W = 320;
        const MIN_H = 280;
        const MAX_W = window.innerWidth - 20;
        const MAX_H = window.innerHeight - 60;

        let newW = initialSizeRef.current.width;
        let newH = initialSizeRef.current.height;

        if (dir === 'r' || dir === 'se') {
          newW = Math.max(MIN_W, Math.min(MAX_W, initialSizeRef.current.width + dx));
        }
        if (dir === 'b' || dir === 'se') {
          newH = Math.max(MIN_H, Math.min(MAX_H, initialSizeRef.current.height + dy));
        }

        updateWindowSize(win.instanceId, { width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
      if (isResizing) setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, win.instanceId]);

  const IconComponent = win.icon;

  return (
    <div
      className={`os-window ${isActive ? 'is-active' : ''} ${
        win.isMaximized ? 'is-maximized' : ''
      } ${win.isMinimized ? 'is-minimized' : ''}`}
      style={{
        left: win.isMaximized ? 0 : win.position.x,
        top: win.isMaximized ? 0 : win.position.y,
        width: win.isMaximized ? '100vw' : win.size.width,
        height: win.isMaximized ? '100vh' : win.size.height,
        zIndex: win.zIndex
      }}
      onMouseDown={() => focusWindow(win.instanceId)}
    >
      {/* Window Header / Chrome */}
      <div className="window-header" onMouseDown={handleMouseDownHeader}>
        <div className="window-title-wrap">
          {IconComponent && <IconComponent size={16} />}
          <span>{win.title}</span>
        </div>

        {/* macOS Control Buttons (Red = Close, Yellow = Minimize, Green = Maximize) */}
        <div className="window-controls">
          <button
            className="win-btn close"
            title="Tutup (Close)"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(win.instanceId);
            }}
          />
          <button
            className="win-btn minimize"
            title="Minimize ke Dock"
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(win.instanceId);
            }}
          />
          <button
            className="win-btn maximize"
            title="Maximize / Fullscreen"
            onClick={(e) => {
              e.stopPropagation();
              toggleMaximizeWindow(win.instanceId);
            }}
          />
        </div>
      </div>

      {/* Window Content Body */}
      <div className="window-body">
        {children}
      </div>

      {/* Window Resize Handles */}
      {!win.isMaximized && !win.isMinimized && (
        <>
          <div className="resize-handle handle-right" onMouseDown={(e) => handleMouseDownResize(e, 'r')} />
          <div className="resize-handle handle-bottom" onMouseDown={(e) => handleMouseDownResize(e, 'b')} />
          <div className="resize-handle handle-corner" onMouseDown={(e) => handleMouseDownResize(e, 'se')} />
        </>
      )}
    </div>
  );
};
