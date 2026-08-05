import React, { useState } from 'react';
import { useWindowContext } from '../../context/WindowContext';
import { Search } from 'lucide-react';

export const StartMenu = () => {
  const { toolsList, openTool, isStartOpen } = useWindowContext();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isStartOpen) return null;

  const filteredTools = toolsList.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="start-menu-popup">
      <div className="desktop-search-box">
        <Search size={16} />
        <input
          type="text"
          placeholder="Cari alat produktivitas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="start-menu-grid">
        {filteredTools.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} className="start-menu-item" onClick={() => openTool(t.id)}>
              <div className="desktop-shortcut-icon" style={{ background: t.color, width: 42, height: 42, borderRadius: 12 }}>
                {Icon && <Icon size={20} />}
              </div>
              <span className="desktop-shortcut-title" style={{ color: 'inherit', fontSize: 11 }}>{t.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
