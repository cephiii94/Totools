import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Download, Barcode as BarcodeIcon } from 'lucide-react';
import { AdBanner } from '../components/ads/AdBanner';

export const BarcodeTool = () => {
  const [value, setValue] = useState('123456789012');
  const [format, setFormat] = useState('CODE128');
  const [error, setError] = useState('');
  const svgRef = useRef(null);

  useEffect(() => {
    if (!value.trim()) {
      setError('');
      if (svgRef.current) svgRef.current.innerHTML = '';
      return;
    }

    try {
      setError('');
      JsBarcode(svgRef.current, value, {
        format,
        lineColor: '#0f172a',
        width: 2,
        height: 86,
        displayValue: true,
        font: 'Plus Jakarta Sans',
        fontSize: 14,
        margin: 12
      });
    } catch (err) {
      setError('Format barcode tidak cocok dengan isi teks yang dimasukkan.');
    }
  }, [value, format]);

  const handleDownload = () => {
    if (!svgRef.current || error || !value.trim()) return;
    const serializer = new XMLSerializer();
    const svgText = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `barcode-${value.replace(/[^a-z0-9_-]+/gi, '-')}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tool-container">
      <div className="tool-form-grid">
        <div className="form-group">
          <label>Isi Kode Barcode</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input-field"
            placeholder="Masukkan angka atau teks..."
          />
        </div>

        <div className="form-group">
          <label>Format Barcode</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="input-field">
            <option value="CODE128">CODE128 (Teks & Angka)</option>
            <option value="EAN13">EAN-13 (13 Angka)</option>
            <option value="UPC">UPC (12 Angka)</option>
            <option value="CODE39">CODE39 (Huruf Kapital & Angka)</option>
            <option value="ITF14">ITF-14 (14 Angka)</option>
            <option value="MSI">MSI (Angka)</option>
            <option value="pharmacode">Pharmacode</option>
          </select>
        </div>

        <div className="preview-container">
          <span className="preview-label">Preview Barcode</span>
          <div className="barcode-svg-wrap">
            <svg ref={svgRef} />
          </div>
          {error && <div className="error-badge">{error}</div>}
        </div>

        <button className="btn-primary" onClick={handleDownload} disabled={!value.trim() || !!error}>
          <Download size={16} />
          Unduh Barcode (SVG)
        </button>
      </div>

      <AdBanner type="inline" />
    </div>
  );
};
