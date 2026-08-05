import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  RotateCcw, 
  LayoutGrid, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  MousePointer, 
  Hand,
  Maximize2
} from 'lucide-react';
import { AdBanner } from '../components/ads/AdBanner';

const LAYOUTS = {
  'grid-2x2': { slots: 4, label: '2 × 2 Grid (4 Foto)' },
  'grid-3x3': { slots: 9, label: '3 × 3 Grid (9 Foto)' },
  'grid-1+2': { slots: 3, label: '1 + 2 (Kiri Besar)' },
  'grid-2+1': { slots: 3, label: '2 + 1 (Kanan Besar)' },
  'grid-row': { slots: 3, label: '3 Kolom Vertikal' },
  'grid-col': { slots: 3, label: '3 Baris Horisontal' },
  'grid-1x2': { slots: 2, label: '1 × 2 (2 Kolom)' },
  'grid-2x1': { slots: 2, label: '2 × 1 (2 Baris)' }
};

const ASPECT_RATIOS = {
  '1:1': { label: '1:1 (Persegi / IG Feed)', width: 1200, height: 1200 },
  '4:5': { label: '4:5 (Potret / IG Post)', width: 1000, height: 1250 },
  '16:9': { label: '16:9 (Lanskap / YT)', width: 1280, height: 720 },
  '9:16': { label: '9:16 (Potret / Story / TikTok)', width: 720, height: 1280 }
};

export const CollageTool = () => {
  const [images, setImages] = useState([]);
  const [layout, setLayout] = useState('grid-2x2');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [bgColor, setBgColor] = useState('#1e293b');
  const [gap, setGap] = useState(8);
  const [radius, setRadius] = useState(6);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialOffsetRef = useRef({ x: 0, y: 0 });
  const touchDistRef = useRef(0);
  const initialZoomRef = useRef(1);

  const handleFiles = (fileList) => {
    const valid = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (!valid.length) return;

    valid.forEach((file) => {
      setImages((prev) => {
        if (prev.length >= 9) return prev;
        return [
          ...prev,
          { 
            id: Date.now() + Math.random(), 
            src: URL.createObjectURL(file), 
            name: file.name,
            zoom: 1,
            offsetX: 0,
            offsetY: 0
          }
        ];
      });
    });
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setSelectedSlot(null);
  };

  const clearAllImages = () => {
    setImages([]);
    setSelectedSlot(null);
  };

  const currentLayoutSlots = LAYOUTS[layout]?.slots || 4;
  const activeImages = images.slice(0, currentLayoutSlots);

  const getLayoutRects = (W, H, g, pad) => {
    const innerW = W - pad * 2;
    const innerH = H - pad * 2;

    if (layout === 'grid-2x2') {
      const w = (innerW - g) / 2;
      const h = (innerH - g) / 2;
      return [
        { x: pad, y: pad, w, h },
        { x: pad + w + g, y: pad, w, h },
        { x: pad, y: pad + h + g, w, h },
        { x: pad + w + g, y: pad + h + g, w, h }
      ];
    } 
    
    if (layout === 'grid-3x3') {
      const w = (innerW - g * 2) / 3;
      const h = (innerH - g * 2) / 3;
      const rects = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          rects.push({ x: pad + c * (w + g), y: pad + r * (h + g), w, h });
        }
      }
      return rects;
    }

    if (layout === 'grid-1+2') {
      const wLeft = (innerW - g) / 2;
      const wRight = (innerW - g) / 2;
      const hHalf = (innerH - g) / 2;
      return [
        { x: pad, y: pad, w: wLeft, h: innerH },
        { x: pad + wLeft + g, y: pad, w: wRight, h: hHalf },
        { x: pad + wLeft + g, y: pad + hHalf + g, w: wRight, h: hHalf }
      ];
    }

    if (layout === 'grid-2+1') {
      const wLeft = (innerW - g) / 2;
      const wRight = (innerW - g) / 2;
      const hHalf = (innerH - g) / 2;
      return [
        { x: pad, y: pad, w: wLeft, h: hHalf },
        { x: pad, y: pad + hHalf + g, w: wLeft, h: hHalf },
        { x: pad + wLeft + g, y: pad, w: wRight, h: innerH }
      ];
    }

    if (layout === 'grid-row') {
      const w = (innerW - g * 2) / 3;
      return [
        { x: pad, y: pad, w, h: innerH },
        { x: pad + w + g, y: pad, w, h: innerH },
        { x: pad + (w + g) * 2, y: pad, w, h: innerH }
      ];
    }

    if (layout === 'grid-col') {
      const h = (innerH - g * 2) / 3;
      return [
        { x: pad, y: pad, w: innerW, h },
        { x: pad, y: pad + h + g, w: innerW, h },
        { x: pad, y: pad + (h + g) * 2, w: innerW, h }
      ];
    }

    if (layout === 'grid-1x2') {
      const w = (innerW - g) / 2;
      return [
        { x: pad, y: pad, w, h: innerH },
        { x: pad + w + g, y: pad, w, h: innerH }
      ];
    }

    if (layout === 'grid-2x1') {
      const h = (innerH - g) / 2;
      return [
        { x: pad, y: pad, w: innerW, h },
        { x: pad, y: pad + h + g, w: innerW, h }
      ];
    }

    return [];
  };

  const imageCacheRef = useRef(new Map());

  const drawSlotImage = (ctx, img, imgObj, rect, rad, scaleFactor, isSelected) => {
    const { x, y, w, h } = rect;
    ctx.save();
    if (rad > 0) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, rad);
      ctx.clip();
    }

    const zoom = imgObj.zoom || 1;
    const offsetX = (imgObj.offsetX || 0) * scaleFactor;
    const offsetY = (imgObj.offsetY || 0) * scaleFactor;

    // Base Aspect Fill
    const aspectBox = w / h;
    const aspectImg = img.width / img.height;
    let dw = w;
    let dh = h;

    if (aspectImg > aspectBox) {
      dw = h * aspectImg;
      dh = h;
    } else {
      dw = w;
      dh = w / aspectImg;
    }

    const scaledW = dw * zoom;
    const scaledH = dh * zoom;

    const centerX = x + w / 2;
    const centerY = y + h / 2;

    const imgX = centerX - scaledW / 2 + offsetX;
    const imgY = centerY - scaledH / 2 + offsetY;

    ctx.drawImage(img, imgX, imgY, scaledW, scaledH);
    ctx.restore();

    // Highlight selected slot border
    if (isSelected) {
      ctx.save();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = Math.max(4, Math.round(4 * scaleFactor));
      ctx.setLineDash([]);
      if (rad > 0) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, rad);
        ctx.stroke();
      } else {
        ctx.strokeRect(x, y, w, h);
      }
      ctx.restore();
    }
  };

  const generateCanvas = () => {
    if (!canvasRef.current) return;
    setIsGenerating(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const targetSize = ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS['1:1'];
    const W = targetSize.width;
    const H = targetSize.height;

    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
    }

    // Fill Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    const scaleFactor = W / 600;
    const pad = Math.round(gap * scaleFactor);
    const g = Math.round(gap * scaleFactor);
    const rad = Math.round(radius * scaleFactor);

    const rects = getLayoutRects(W, H, g, pad);

    rects.forEach((rect, i) => {
      const imgObj = activeImages[i];
      const { x, y, w, h } = rect;

      if (!imgObj) {
        // Draw empty slot placeholder
        ctx.save();
        if (rad > 0) {
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, rad);
          ctx.clip();
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = Math.max(2, Math.round(2 * scaleFactor));
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(x, y, w, h);

        // Draw + icon indicator text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = `600 ${Math.round(14 * scaleFactor)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+ Slot ${i + 1}`, x + w / 2, y + h / 2);
        ctx.restore();
        return;
      }

      // Check if image is already cached in memory
      const cachedImg = imageCacheRef.current.get(imgObj.src);
      if (cachedImg && cachedImg.complete) {
        // Synchronous draw - 0ms delay, ZERO flickering!
        drawSlotImage(ctx, cachedImg, imgObj, rect, rad, scaleFactor, selectedSlot === i);
      } else {
        // Asynchronous load once for new image
        const newImg = new Image();
        newImg.onload = () => {
          imageCacheRef.current.set(imgObj.src, newImg);
          generateCanvas();
        };
        newImg.src = imgObj.src;
      }
    });

    setIsGenerating(false);
  };

  useEffect(() => {
    generateCanvas();
  }, [images, layout, aspectRatio, bgColor, gap, radius, selectedSlot]);

  // Coordinate Conversion Helpers
  const getCanvasCoords = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const getSlotAtCoords = (cx, cy) => {
    const targetSize = ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS['1:1'];
    const W = targetSize.width;
    const H = targetSize.height;
    const scaleFactor = W / 600;
    const pad = Math.round(gap * scaleFactor);
    const g = Math.round(gap * scaleFactor);
    const rects = getLayoutRects(W, H, g, pad);

    return rects.findIndex(
      (r) => cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h
    );
  };

  const handleDoubleClick = (e) => {
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    const slotIdx = getSlotAtCoords(x, y);

    if (slotIdx !== -1 && activeImages[slotIdx]) {
      e.preventDefault();
      setSelectedSlot(slotIdx);
      const targetId = activeImages[slotIdx].id;

      // Snap photo back to perfect dead-center position (offsetX: 0, offsetY: 0, zoom: 1)
      setImages((prev) =>
        prev.map((img) =>
          img.id === targetId
            ? { ...img, offsetX: 0, offsetY: 0, zoom: 1 }
            : img
        )
      );
    }
  };

  const handleMouseDown = (e) => {
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    const slotIdx = getSlotAtCoords(x, y);

    if (slotIdx !== -1) {
      setSelectedSlot(slotIdx);
      if (activeImages[slotIdx]) {
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        initialOffsetRef.current = {
          x: activeImages[slotIdx].offsetX || 0,
          y: activeImages[slotIdx].offsetY || 0
        };
      } else {
        fileInputRef.current?.click();
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || selectedSlot === null || !activeImages[selectedSlot]) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const displayScale = 600 / rect.width;

    const dx = (e.clientX - dragStartRef.current.x) * displayScale;
    const dy = (e.clientY - dragStartRef.current.y) * displayScale;

    const targetId = activeImages[selectedSlot].id;
    setImages((prev) =>
      prev.map((img) =>
        img.id === targetId
          ? {
              ...img,
              offsetX: initialOffsetRef.current.x + dx,
              offsetY: initialOffsetRef.current.y + dy
            }
          : img
      )
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Non-passive native event listeners to prevent window/page scrolling during zoom & touch gestures
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheelNative = (e) => {
      const { x, y } = getCanvasCoords(e.clientX, e.clientY);
      const slotIdx = getSlotAtCoords(x, y);

      if (slotIdx !== -1 && activeImages[slotIdx]) {
        e.preventDefault();
        e.stopPropagation();
        setSelectedSlot(slotIdx);

        const targetId = activeImages[slotIdx].id;
        const currentZoom = activeImages[slotIdx].zoom || 1;
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        const newZoom = Math.max(0.5, Math.min(5.0, Number((currentZoom + delta).toFixed(2))));

        setImages((prev) =>
          prev.map((img) => (img.id === targetId ? { ...img, zoom: newZoom } : img))
        );
      }
    };

    const onTouchMoveNative = (e) => {
      const { x, y } = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
      const slotIdx = getSlotAtCoords(x, y);

      if (slotIdx !== -1 && activeImages[slotIdx]) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    canvas.addEventListener('wheel', onWheelNative, { passive: false });
    canvas.addEventListener('touchmove', onTouchMoveNative, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', onWheelNative);
      canvas.removeEventListener('touchmove', onTouchMoveNative);
    };
  }, [activeImages, aspectRatio, gap, layout]);

  // Touch Screen Handlers (1-finger drag, 2-finger pinch)
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const { x, y } = getCanvasCoords(touch.clientX, touch.clientY);
      const slotIdx = getSlotAtCoords(x, y);

      if (slotIdx !== -1) {
        setSelectedSlot(slotIdx);
        if (activeImages[slotIdx]) {
          setIsDragging(true);
          dragStartRef.current = { x: touch.clientX, y: touch.clientY };
          initialOffsetRef.current = {
            x: activeImages[slotIdx].offsetX || 0,
            y: activeImages[slotIdx].offsetY || 0
          };
        } else {
          fileInputRef.current?.click();
        }
      }
    } else if (e.touches.length === 2 && selectedSlot !== null && activeImages[selectedSlot]) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistRef.current = dist;
      initialZoomRef.current = activeImages[selectedSlot].zoom || 1;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging && selectedSlot !== null && activeImages[selectedSlot]) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const displayScale = 600 / rect.width;

      const dx = (touch.clientX - dragStartRef.current.x) * displayScale;
      const dy = (touch.clientY - dragStartRef.current.y) * displayScale;

      const targetId = activeImages[selectedSlot].id;
      setImages((prev) =>
        prev.map((img) =>
          img.id === targetId
            ? {
                ...img,
                offsetX: initialOffsetRef.current.x + dx,
                offsetY: initialOffsetRef.current.y + dy
              }
            : img
        )
      );
    } else if (e.touches.length === 2 && selectedSlot !== null && activeImages[selectedSlot]) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchDistRef.current > 0) {
        const scale = dist / touchDistRef.current;
        const newZoom = Math.max(0.5, Math.min(5.0, Number((initialZoomRef.current * scale).toFixed(2))));
        const targetId = activeImages[selectedSlot].id;
        setImages((prev) =>
          prev.map((img) => (img.id === targetId ? { ...img, zoom: newZoom } : img))
        );
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistRef.current = 0;
  };

  // Fine-tuning helpers for active slot
  const updateActiveZoom = (newZoom) => {
    if (selectedSlot === null || !activeImages[selectedSlot]) return;
    const targetId = activeImages[selectedSlot].id;
    const clamped = Math.max(0.5, Math.min(5.0, Number(newZoom.toFixed(2))));
    setImages((prev) =>
      prev.map((img) => (img.id === targetId ? { ...img, zoom: clamped } : img))
    );
  };

  const resetActiveTransform = () => {
    if (selectedSlot === null || !activeImages[selectedSlot]) return;
    const targetId = activeImages[selectedSlot].id;
    setImages((prev) =>
      prev.map((img) =>
        img.id === targetId ? { ...img, zoom: 1, offsetX: 0, offsetY: 0 } : img
      )
    );
  };

  const handleDownload = () => {
    if (!canvasRef.current || !activeImages.length) return;
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
    link.download = `totools-collage-${layout}-${aspectRatio.replace(':', 'x')}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const gapControlRef = useRef(null);
  const radiusControlRef = useRef(null);
  const zoomControlRef = useRef(null);

  // Non-passive wheel event listeners for sliders to prevent parent container scrolling
  useEffect(() => {
    const bindWheel = (el, callback) => {
      if (!el) return null;
      const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        callback(e);
      };
      el.addEventListener('wheel', handler, { passive: false });
      return () => el.removeEventListener('wheel', handler);
    };

    const unbindGap = bindWheel(gapControlRef.current, (e) => {
      const delta = e.deltaY < 0 ? 1 : -1;
      setGap((g) => Math.max(0, Math.min(24, g + delta)));
    });

    const unbindRadius = bindWheel(radiusControlRef.current, (e) => {
      const delta = e.deltaY < 0 ? 1 : -1;
      setRadius((r) => Math.max(0, Math.min(24, r + delta)));
    });

    const unbindZoom = bindWheel(zoomControlRef.current, (e) => {
      if (selectedSlot === null || !activeImages[selectedSlot]) return;
      const currentZoom = activeImages[selectedSlot].zoom || 1;
      const delta = e.deltaY < 0 ? 0.05 : -0.05;
      const newZoom = Math.max(0.5, Math.min(4.0, Number((currentZoom + delta).toFixed(2))));
      const targetId = activeImages[selectedSlot].id;
      setImages((prev) =>
        prev.map((img) => (img.id === targetId ? { ...img, zoom: newZoom } : img))
      );
    });

    return () => {
      if (unbindGap) unbindGap();
      if (unbindRadius) unbindRadius();
      if (unbindZoom) unbindZoom();
    };
  }, [activeImages, selectedSlot]);

  const activeImgObj = selectedSlot !== null ? activeImages[selectedSlot] : null;

  return (
    <div className="tool-container">
      <div className="tool-form-grid">
        {/* Controls Column */}
        <div className="collage-controls-panel">
          <div className="form-row-swap">
            <div className="form-group flex-1">
              <label><LayoutGrid size={14} /> Layout Grid</label>
              <select value={layout} onChange={(e) => setLayout(e.target.value)} className="input-field">
                {Object.entries(LAYOUTS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group flex-1">
              <label>Rasio Aspek</label>
              <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="input-field">
                {Object.entries(ASPECT_RATIOS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-swap">
            <div className="form-group flex-1">
              <label>Background Color</label>
              <div className="color-picker-row">
                <input 
                  type="color" 
                  value={bgColor} 
                  onChange={(e) => setBgColor(e.target.value)} 
                  className="input-color-picker" 
                />
                <span className="color-code">{bgColor}</span>
              </div>
            </div>

            <div 
              ref={gapControlRef}
              className="form-group flex-1 scrollable-control"
              title="Scroll mouse wheel untuk mengubah jarak (Gap)"
            >
              <label>Jarak Foto (Gap): {gap}px</label>
              <input
                type="range"
                min="0"
                max="24"
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="input-range"
              />
            </div>

            <div 
              ref={radiusControlRef}
              className="form-group flex-1 scrollable-control"
              title="Scroll mouse wheel untuk mengubah sudut (Radius)"
            >
              <label>Sudut (Radius): {radius}px</label>
              <input
                type="range"
                min="0"
                max="24"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="input-range"
              />
            </div>
          </div>

          {/* Active Slot Inspector Controls */}
          {activeImgObj && (
            <div className="active-slot-panel">
              <div className="active-slot-header">
                <span className="active-slot-title">
                  <Maximize2 size={14} /> Pengaturan Foto #{selectedSlot + 1}
                </span>
                <button className="btn-text-secondary" onClick={resetActiveTransform} title="Reset posisi & zoom">
                  <RotateCcw size={12} /> Reset Foto
                </button>
              </div>

              <div 
                ref={zoomControlRef}
                className="zoom-control-row scrollable-control"
                title="Scroll mouse wheel di sini untuk Zoom In / Out"
              >
                <button 
                  className="zoom-btn" 
                  onClick={() => updateActiveZoom((activeImgObj.zoom || 1) - 0.15)}
                  title="Zoom Out (-)"
                >
                  <ZoomOut size={14} />
                </button>
                
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.05"
                  value={activeImgObj.zoom || 1}
                  onChange={(e) => updateActiveZoom(Number(e.target.value))}
                  className="input-range flex-1"
                />

                <button 
                  className="zoom-btn" 
                  onClick={() => updateActiveZoom((activeImgObj.zoom || 1) + 0.15)}
                  title="Zoom In (+)"
                >
                  <ZoomIn size={14} />
                </button>

                <span className="zoom-val">{Math.round((activeImgObj.zoom || 1) * 100)}%</span>
              </div>
            </div>
          )}

          {/* Upload Dropzone */}
          <div className="upload-dropzone" onClick={() => fileInputRef.current?.click()}>
            <Upload size={24} />
            <span>Upload Foto ({images.length}/{currentLayoutSlots} Terisi)</span>
            <small>Klik atau Drag berkas gambar ke sini</small>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Thumbnails list */}
          {images.length > 0 && (
            <div className="thumb-section">
              <div className="thumb-header">
                <span>Daftar Foto ({images.length})</span>
                <button className="btn-text-danger" onClick={clearAllImages}>
                  <RotateCcw size={12} /> Hapus Semua
                </button>
              </div>
              <div className="thumb-gallery">
                {images.map((img, idx) => (
                  <div 
                    key={img.id} 
                    className={`thumb-card ${idx < currentLayoutSlots ? 'is-active-slot' : 'is-overflow-slot'} ${selectedSlot === idx ? 'is-selected-card' : ''}`}
                    onClick={() => idx < currentLayoutSlots && setSelectedSlot(idx)}
                  >
                    <img src={img.src} alt={img.name} />
                    <span className="thumb-slot-badge">{idx < currentLayoutSlots ? `#${idx + 1}` : 'Antrean'}</span>
                    <button className="thumb-remove-btn" onClick={(e) => { e.stopPropagation(); removeImage(img.id); }} title="Hapus foto ini">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Canvas Column */}
        <div className="preview-container collage-preview-section">
          <div className="preview-header">
            <span className="preview-label">Preview Canvas Kolase</span>
          </div>

          <div className="canvas-wrapper">
            <canvas 
              ref={canvasRef} 
              className={`collage-preview-canvas ${isDragging ? 'is-dragging' : ''}`}
              onMouseDown={handleMouseDown}
              onDoubleClick={handleDoubleClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </div>

          <div className="canvas-interaction-hint">
            <span><MousePointer size={12} /> <b>Double-Click</b>: Auto Rata Tengah</span>
            <span><MousePointer size={12} /> <b>Scroll Wheel</b>: Zoom In/Out</span>
            <span><Hand size={12} /> <b>Drag / Touch</b>: Geser Foto</span>
            <span><Move size={12} /> <b>Pinch</b>: Zoom Layar Sentuh</span>
          </div>

          <button className="btn-primary btn-block" onClick={handleDownload} disabled={!activeImages.length}>
            <Download size={16} /> Unduh Kolase (JPG)
          </button>
        </div>
      </div>

      <AdBanner type="inline" />
    </div>
  );
};
