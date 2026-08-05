import React, { useState } from 'react';
import { Copy, Trash2, Check } from 'lucide-react';
import { AdBanner } from '../components/ads/AdBanner';

export const WordCounterTool = () => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const textTrim = text.trim();
  const wordCount = textTrim ? (textTrim.match(/\S+/g) || []).length : 0;
  const charCount = text.length;
  const sentenceCount = textTrim ? textTrim.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean).length : 0;
  const paragraphCount = textTrim ? textTrim.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).length : 0;
  const readingTimeMinutes = wordCount ? Math.max(1, Math.ceil(wordCount / 200)) : 0;

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="tool-container">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{wordCount}</span>
          <span className="stat-label">Kata</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{charCount}</span>
          <span className="stat-label">Karakter</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{sentenceCount}</span>
          <span className="stat-label">Kalimat</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{paragraphCount}</span>
          <span className="stat-label">Paragraf</span>
        </div>
        <div className="stat-card highlight">
          <span className="stat-value">{readingTimeMinutes} m</span>
          <span className="stat-label">Estimasi Baca</span>
        </div>
      </div>

      <div className="tool-form-grid">
        <div className="form-group">
          <div className="label-with-action">
            <label>Input Teks</label>
            <div className="btn-group-sm">
              <button className="btn-text-action" onClick={handleCopy} disabled={!text}>
                {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                {copied ? 'Tersalin' : 'Salin'}
              </button>
              <button className="btn-text-action text-red" onClick={handleClear} disabled={!text}>
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          </div>

          <textarea
            rows={7}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input-field textarea-field"
            placeholder="Ketik atau tempel paragraf Anda di sini..."
          />
        </div>
      </div>

      <AdBanner type="inline" />
    </div>
  );
};
