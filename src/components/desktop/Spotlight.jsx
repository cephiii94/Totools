import React, { useState, useEffect, useRef } from 'react';
import { useWindowContext } from '../../context/WindowContext';
import { Search, Calculator, ArrowRight, X } from 'lucide-react';

export const Spotlight = () => {
  const { isSpotlightOpen, setIsSpotlightOpen, toolsList, openTool } = useWindowContext();
  const [query, setQuery] = useState('');
  const [mathResult, setMathResult] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSpotlightOpen) {
      setQuery('');
      setMathResult(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSpotlightOpen]);

  // Live Math Expression Evaluator (Safe regex calculator)
  useEffect(() => {
    if (!query.trim()) {
      setMathResult(null);
      return;
    }

    const cleaned = query.trim().replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '.');
    
    // Check if query is a math expression like "50 * 12" or "100 + 45 / 2"
    if (/^[0-9\.\s\+\-\*\/\(\)\%]+$/.test(cleaned) && /[0-9]/.test(cleaned)) {
      try {
        // Safe evaluation for basic math
        const evalFunc = new Function(`return (${cleaned});`);
        const res = evalFunc();
        if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
          setMathResult(res);
          return;
        }
      } catch (err) {
        setMathResult(null);
      }
    }
    setMathResult(null);
  }, [query]);

  if (!isSpotlightOpen) return null;

  const filteredTools = toolsList.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.desc.toLowerCase().includes(query.toLowerCase()) ||
      t.id.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (filteredTools.length > 0) {
        openTool(filteredTools[0].id);
        setIsSpotlightOpen(false);
      }
    }
  };

  return (
    <div className="spotlight-overlay" onClick={() => setIsSpotlightOpen(false)}>
      <div className="spotlight-modal" onClick={(e) => e.stopPropagation()}>
        {/* Search Header Bar */}
        <div className="spotlight-input-row">
          <Search size={22} className="spotlight-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="spotlight-input"
            placeholder="Cari alat atau ketik hitungan matematika (e.g. 250 * 4)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button className="spotlight-clear-btn" onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          )}
          <span className="spotlight-badge">Esc</span>
        </div>

        {/* Live Math Result Card */}
        {mathResult !== null && (
          <div className="spotlight-math-card">
            <div className="spotlight-math-left">
              <Calculator size={20} className="math-icon" />
              <span>Hasil Perhitungan:</span>
            </div>
            <div className="spotlight-math-value">{mathResult.toLocaleString('id-ID')}</div>
          </div>
        )}

        {/* Tools Results Grid */}
        <div className="spotlight-results">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className={`spotlight-result-item ${idx === 0 ? 'is-selected' : ''}`}
                  onClick={() => {
                    openTool(tool.id);
                    setIsSpotlightOpen(false);
                  }}
                >
                  <div className="spotlight-tool-icon" style={{ background: tool.color }}>
                    {Icon && <Icon size={20} />}
                  </div>
                  <div className="spotlight-tool-info">
                    <div className="spotlight-tool-title">{tool.title}</div>
                    <div className="spotlight-tool-desc">{tool.desc}</div>
                  </div>
                  <div className="spotlight-action">
                    <span>Buka</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="spotlight-empty">
              Alat "{query}" tidak ditemukan. Coba ketik "QR", "Mata Uang", "Foto", atau hitungan angka.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
