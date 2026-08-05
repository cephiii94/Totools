import React from 'react';

export const DesktopShortcut = ({ tool, onOpen }) => {
  const Icon = tool.icon;
  return (
    <div className="desktop-shortcut-card" onClick={() => onOpen(tool.id)}>
      <div className="desktop-shortcut-icon" style={{ background: tool.color }}>
        {Icon && <Icon size={28} />}
        {tool.shortcutKey && <span className="shortcut-badge-num">{tool.shortcutKey}</span>}
      </div>
      <span className="desktop-shortcut-title">{tool.title}</span>
    </div>
  );
};
