import React, { useState } from 'react';
import { ArrowRightLeft, Copy, Check, Sparkles } from 'lucide-react';
import { AdBanner } from '../components/ads/AdBanner';

const LANGUAGES = [
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'en', name: 'Bahasa Inggris' },
  { code: 'ja', name: 'Bahasa Jepang' },
  { code: 'ko', name: 'Bahasa Korea' },
  { code: 'zh', name: 'Bahasa Mandarin' },
  { code: 'ar', name: 'Bahasa Arab' },
  { code: 'es', name: 'Bahasa Spanyol' },
  { code: 'fr', name: 'Bahasa Prancis' },
  { code: 'de', name: 'Bahasa Jerman' },
  { code: 'ru', name: 'Bahasa Rusia' }
];

export const TranslatorTool = () => {
  const [fromLang, setFromLang] = useState('id');
  const [toLang, setToLang] = useState('en');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setTranslatedText('Menerjemahkan...');

    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=${fromLang}|${toLang}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      if (data?.responseData?.translatedText) {
        setTranslatedText(data.responseData.translatedText);
      } else {
        setTranslatedText('Terjemahan tidak ditemukan.');
      }
    } catch (err) {
      setTranslatedText('Gagal menerjemahkan. Cek koneksi internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleCopy = () => {
    if (!translatedText || translatedText.startsWith('Menerjemahkan') || translatedText.startsWith('Gagal')) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tool-container">
      <div className="tool-form-grid">
        <div className="form-row-swap">
          <div className="form-group flex-1">
            <label>Dari Bahasa</label>
            <select value={fromLang} onChange={(e) => setFromLang(e.target.value)} className="input-field">
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          <button className="btn-icon-swap" onClick={handleSwap} title="Tukar Bahasa">
            <ArrowRightLeft size={18} />
          </button>

          <div className="form-group flex-1">
            <label>Ke Bahasa</label>
            <select value={toLang} onChange={(e) => setToLang(e.target.value)} className="input-field">
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Teks Sumber</label>
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="input-field textarea-field"
            placeholder="Tulis atau tempel teks di sini..."
          />
        </div>

        <button className="btn-primary" onClick={handleTranslate} disabled={loading || !inputText.trim()}>
          <Sparkles size={16} />
          {loading ? 'Menerjemahkan...' : 'Terjemahkan Teks'}
        </button>

        <div className="form-group">
          <div className="label-with-action">
            <label>Hasil Terjemahan</label>
            {translatedText && (
              <button className="btn-text-action" onClick={handleCopy}>
                {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                {copied ? 'Tersalin!' : 'Salin Teks'}
              </button>
            )}
          </div>
          <textarea
            rows={4}
            readOnly
            value={translatedText}
            className="input-field textarea-field readonly-field"
            placeholder="Hasil terjemahan akan muncul di sini..."
          />
        </div>
      </div>

      <AdBanner type="inline" />
    </div>
  );
};
