import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, Trash2, Image as ImageIcon } from 'lucide-react';
import { AdBanner } from '../components/ads/AdBanner';

const LAYOUTS = {
  'grid-2x2': { slots: 4, label: '2 × 2 Grid' },
  'grid-3x3': { slots: 9, label: '3 × 3 Grid' },
  'grid-1+2': { slots: 3, label: '1 + 2 (Kiri Besar)' },
  'grid-2+1': { slots: 3, label: '2 + 1 (Kanan Besar)' },
  'grid-row': { slots: 3, label: '3 Kolom' },
  'grid-col': { slots: 3, label: '3 Baris' },
  'grid-1x2': { slots: 2, label: '1 × 2 (Berdampingan)' },
  'grid-2x1': { slots: 2, label: '2 × 1 (Atas Bawah)' }
};

export const CollageTool = () => {
  const [images, setImages] = useState([]);
  const [layout, setLayout] = useState('grid-2x2');
  const [bgColor, setBgColor] = useState('#1a1a2e');
  const [gap, setGap] = useState(8);
  const [radius, setRadius] = useState(6);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFiles = (fileList) => {
    const valid = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (!valid.length) return;

    valid.forEach((file) => {
      if (images.length >= 9) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => [
          ...prev.slice(0, 8),
          { id: Date.now() + Math.random(), src: e.target.result, name: file.name, zoom: 1, offsetX: 0, offsetY: 0 }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const currentLayoutSlots = LAYOUTS[layout]?.slots || 4;
  const activeImages = images.slice(0, currentLayoutSlots);

  const generateCanvas = () => {
    if (!activeImages.length || !canvasRef.current) return;
    setIsGenerating(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = 1200;
    const H = 1200;
    canvas.width = W;
    canvas.height = H;

    // Fill Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    const pad = gap * 3;
    const g = gap * 3;
    const rad = radius * 2;
    const innerW = W - pad * 2;
    const innerH = H - pad * 2;

    let rects = [];
    if (layout === 'grid-2x2') {
      const w = (innerW - g) / 2;
      const h = (innerH - g) / 2;
      rects = [
        { x: pad, y: pad, w, h },
        { x: pad + w + g, y: pad, w, h },
        { x: pad, y: pad + h + g, w, h },
        { x: pad + w + g, y: pad + h + g, w, h }
      ];
    } else if (layout === 'grid-3x3') {
      const w = (innerW - g * 2) / 3;
      const h = (innerH - g * 2) / 3;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          rects.push({ x: pad + c * (w + g), y: pad + r * (h + g), w, h });
        }
      }
    } else {
      const w = (innerW - g) / 2;
      const h = (innerH - g) / 2;
      rects = [
        { x: pad, y: pad, w, h },
        { x: pad + w + g, y: pad, w, h }
      ];
    }

    let loadedCount = 0;
    activeImages.forEach((imgObj, i) => {
      if (!rects[i]) return;
      const img = new Image();
      img.onload = () => {
        const { x, y, w, h } = rects[i];
        ctx.save();
        if (rad > 0) {
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, rad);
          ctx.clip();
        }

        // Draw image aspect fill
        const aspectBox = w / h;
        const aspectImg = img.width / img.height;
        let dw = w;
        let dh = h;
        let dx = x;
        let dy = y;

        if (aspectImg > aspectBox) {
          dw = h * aspectImg;
          dx = x - (dw - w) / 2;
        } else {
          dh = w / aspectImg;
          dy = y - (dh - h) / 2;
        }

        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();

        loadedCount++;
        if (loadedCount === activeImages.length) {
          setIsGenerating(false);
        }
      };
      img.src = imgObj.src;
    });
  };

  useEffect(() => {
    if (activeImages.length > 0) {
      generateCanvas();
    }
  }, [images, layout, bgColor, gap, radius]);

  const handleDownload = () => {
    if (!canvasRef.current || !activeImages.length) return;
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.92);
    link.download = 'totools-collage.jpg';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="tool-container">
      <div className="tool-form-grid">
        <div className="form-row-swap">
          <div className="form-group flex-1">
            <label>Pilih Layout</label>
            <select value={layout} onChange={(e) => setLayout(e.target.value)} className="input-field">
              {Object.entries(LAYOUTS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group flex-1">
            <label>Warna Background</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="input-color-picker" />
          </div>
        </div>

        <div className="upload-dropzone" onClick={() => fileInputRef.current?.click()}>
          <Upload size={24} />
          <span>Upload Foto (Klik atau Drag ke Sini)</span>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {images.length > 0 && (
          <div className="thumb-gallery">
            {images.map((img) => (
              <div key={img.id} className="thumb-card">
                <img src={img.src} alt={img.name} />
                <button className="thumb-remove-btn" onClick={() => removeImage(img.id)}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="preview-container">
          <span className="preview-label">Preview Canvas Kolase</span>
          <div className="canvas-wrapper">
            <canvas ref={canvasRef} className="collage-preview-canvas" />
          </div>
        </div>

        <button className="btn-primary" onClick={handleDownload} disabled={!activeImages.length}>
          <Download size={16} /> Unduh Kolase (JPG)
        </button>
      </div>

      <AdBanner type="inline" />
    </div>
  );
};
