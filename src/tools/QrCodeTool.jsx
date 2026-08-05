import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { Download, Layers, QrCode as QrIcon } from 'lucide-react';
import { AdBanner } from '../components/ads/AdBanner';

export const QrCodeTool = () => {
  const [mode, setMode] = useState('solo'); // 'solo' | 'batch'
  const [value, setValue] = useState('https://totools.net');
  const [batchValue, setBatchValue] = useState('https://google.com\nhttps://github.com\nhttps://youtube.com');
  const [size, setSize] = useState(220);
  const [includeText, setIncludeText] = useState(true);
  const [batchQrList, setBatchQrList] = useState([]);
  
  const canvasRef = useRef(null);

  // Solo QR effect
  useEffect(() => {
    if (mode !== 'solo' || !value.trim() || !canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      },
      (err) => {
        if (err) console.error('QR error:', err);
      }
    );
  }, [value, size, mode]);

  // Batch QR effect
  useEffect(() => {
    if (mode !== 'batch') return;
    const lines = batchValue
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 24);

    const generateBatch = async () => {
      const items = await Promise.all(
        lines.map(async (text) => {
          try {
            const dataUrl = await QRCode.toDataURL(text, { width: 120, margin: 2 });
            return { text, dataUrl };
          } catch (e) {
            return null;
          }
        })
      );
      setBatchQrList(items.filter(Boolean));
    };

    generateBatch();
  }, [batchValue, mode]);

  const downloadCanvasWithCaption = async (text, qrSize) => {
    const tempCanvas = document.createElement('canvas');
    await QRCode.toCanvas(tempCanvas, text, { width: qrSize, margin: 2 });

    const finalCanvas = document.createElement('canvas');
    const padding = 16;
    const textHeight = includeText ? 36 : 0;
    finalCanvas.width = qrSize + padding * 2;
    finalCanvas.height = qrSize + padding * 2 + textHeight;

    const ctx = finalCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    ctx.drawImage(tempCanvas, padding, padding);

    if (includeText) {
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 13px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text.slice(0, 32), finalCanvas.width / 2, qrSize + padding + 22);
    }

    return finalCanvas;
  };

  const handleDownloadSolo = async () => {
    if (!value.trim()) return;
    const canvas = await downloadCanvasWithCaption(value, size);
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `qrcode-${value.replace(/[^a-z0-9_-]+/gi, '-').slice(0, 30)}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDownloadBatch = async () => {
    const lines = batchValue.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 24);
    if (!lines.length) return;

    const zip = new JSZip();
    for (let i = 0; i < lines.length; i++) {
      const text = lines[i];
      const canvas = await downloadCanvasWithCaption(text, 220);
      const base64 = canvas.toDataURL('image/png').split(',')[1];
      const filename = `${String(i + 1).padStart(2, '0')}-${text.replace(/[^a-z0-9_-]+/gi, '-').slice(0, 30)}.png`;
      zip.file(filename, base64, { base64: true });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'batch-qrcodes.zip';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tool-container">
      {/* Mode Switcher */}
      <div className="tab-group">
        <button className={`tab-btn ${mode === 'solo' ? 'is-active' : ''}`} onClick={() => setMode('solo')}>
          <QrIcon size={16} /> Single QR
        </button>
        <button className={`tab-btn ${mode === 'batch' ? 'is-active' : ''}`} onClick={() => setMode('batch')}>
          <Layers size={16} /> Batch QR (Multiple)
        </button>
      </div>

      {mode === 'solo' ? (
        <div className="tool-form-grid">
          <div className="form-group">
            <label>Isi QR Code (URL / Teks)</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="input-field"
              placeholder="https://contoh.com..."
            />
          </div>

          <div className="form-row-swap">
            <div className="form-group flex-1">
              <label>Ukuran QR (px)</label>
              <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="input-field">
                <option value={160}>Kecil (160px)</option>
                <option value={220}>Sedang (220px)</option>
                <option value={300}>Besar (300px)</option>
              </select>
            </div>

            <div className="form-group flex-1 checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeText}
                  onChange={(e) => setIncludeText(e.target.checked)}
                />
                Sertakan Teks di Gambar
              </label>
            </div>
          </div>

          <div className="preview-container">
            <span className="preview-label">Preview QR Code</span>
            <div className="qr-canvas-wrap">
              <canvas ref={canvasRef} />
              {includeText && value && <p className="qr-caption">{value}</p>}
            </div>
          </div>

          <button className="btn-primary" onClick={handleDownloadSolo} disabled={!value.trim()}>
            <Download size={16} /> Unduh QR Code (PNG)
          </button>
        </div>
      ) : (
        <div className="tool-form-grid">
          <div className="form-group">
            <label>Daftar URL/Teks (1 per Baris, Maks 24)</label>
            <textarea
              rows={5}
              value={batchValue}
              onChange={(e) => setBatchValue(e.target.value)}
              className="input-field textarea-field"
              placeholder="Tempel beberapa link di sini..."
            />
          </div>

          <div className="preview-container">
            <span className="preview-label">Preview Batch QR ({batchQrList.length} Item)</span>
            <div className="qr-batch-grid">
              {batchQrList.map((item, idx) => (
                <div key={idx} className="qr-batch-card">
                  <img src={item.dataUrl} alt={item.text} />
                  <span className="qr-batch-text">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="btn-primary" onClick={handleDownloadBatch} disabled={!batchQrList.length}>
            <Download size={16} /> Unduh Semua (ZIP)
          </button>
        </div>
      )}

      <AdBanner type="inline" />
    </div>
  );
};
