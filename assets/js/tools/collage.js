import { tampilkanToast } from '../core/toast.js';

let gambarDiunggah = [];
let layoutDipilih = 'grid-2x2';
let warnaBg = '#1a1a2e';
let jarakAntar = 8;
let sudutBulat = 0;

const LAYOUTS = {
    'grid-2x2': { cols: 2, rows: 2, slots: 4, label: '2 × 2' },
    'grid-3x3': { cols: 3, rows: 3, slots: 9, label: '3 × 3' },
    'grid-1+2': { cols: 1, rows: 1, slots: 3, label: '1 + 2 (kiri besar)' },
    'grid-2+1': { cols: 1, rows: 1, slots: 3, label: '2 + 1 (kanan besar)' },
    'grid-row': { cols: 3, rows: 1, slots: 3, label: '3 Kolom' },
    'grid-col': { cols: 1, rows: 3, slots: 3, label: '3 Baris' },
    'grid-1x2': { cols: 1, rows: 1, slots: 2, label: '1 × 2 (side by side)' },
    'grid-2x1': { cols: 1, rows: 1, slots: 2, label: '2 × 1 (atas bawah)' },
};

export function initCollage() {
    const btnUpload = document.getElementById('collage-upload-btn');
    const inputFile = document.getElementById('collage-file-input');
    const dropzone = document.getElementById('collage-dropzone');
    const btnGenerate = document.getElementById('collage-generate-btn');
    const btnDownload = document.getElementById('collage-download-btn');
    const btnReset = document.getElementById('collage-reset-btn');
    const selectLayout = document.getElementById('collage-layout');
    const inputBg = document.getElementById('collage-bg-color');
    const inputJarak = document.getElementById('collage-gap');
    const inputSudut = document.getElementById('collage-radius');
    const rangeJarak = document.getElementById('collage-gap-range');
    const rangeSudut = document.getElementById('collage-radius-range');

    if (!btnUpload) return;

    // Upload button
    btnUpload.addEventListener('click', () => inputFile?.click());

    // File input
    inputFile?.addEventListener('change', (e) => {
        tambahGambar(Array.from(e.target.files));
        e.target.value = '';
    });

    // Dropzone drag & drop
    dropzone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
    });

    dropzone?.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-over');
    });

    dropzone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
        tambahGambar(files);
    });

    dropzone?.addEventListener('click', () => inputFile?.click());

    // Preset colors
    document.querySelectorAll('.collage-preset-color').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const color = btn.dataset.color;
            if (inputBg) {
                inputBg.value = color;
                warnaBg = color;
                renderPreviewKolase();
            }
        });
    });

    // Layout selector
    selectLayout?.addEventListener('change', (e) => {
        layoutDipilih = e.target.value;
        renderPreviewKolase();
    });

    // Background color
    inputBg?.addEventListener('input', (e) => {
        warnaBg = e.target.value;
        renderPreviewKolase();
    });

    // Gap range + input sync
    if (rangeJarak && inputJarak) {
        rangeJarak.addEventListener('input', (e) => {
            jarakAntar = parseInt(e.target.value, 10);
            inputJarak.value = jarakAntar;
            renderPreviewKolase();
        });
        inputJarak.addEventListener('input', (e) => {
            jarakAntar = Math.max(0, Math.min(40, parseInt(e.target.value, 10) || 0));
            rangeJarak.value = jarakAntar;
            renderPreviewKolase();
        });
    }

    // Radius range + input sync
    if (rangeSudut && inputSudut) {
        rangeSudut.addEventListener('input', (e) => {
            sudutBulat = parseInt(e.target.value, 10);
            inputSudut.value = sudutBulat;
            renderPreviewKolase();
        });
        inputSudut.addEventListener('input', (e) => {
            sudutBulat = Math.max(0, Math.min(40, parseInt(e.target.value, 10) || 0));
            rangeSudut.value = sudutBulat;
            renderPreviewKolase();
        });
    }

    // Generate
    btnGenerate?.addEventListener('click', () => {
        if (gambarDiunggah.length === 0) {
            tampilkanToast('Upload minimal 1 gambar dulu!');
            return;
        }
        buatKolaseCanvas();
    });

    // Download
    btnDownload?.addEventListener('click', () => {
        const canvas = document.getElementById('collage-canvas');
        if (!canvas || canvas.dataset.hasContent !== 'true') {
            tampilkanToast('Buat kolase dulu!');
            return;
        }
        downloadKolase(canvas);
    });

    // Reset
    btnReset?.addEventListener('click', () => {
        gambarDiunggah = [];
        renderDaftarGambar();
        bersihkanCanvas();
        tampilkanToast('Gambar direset.');
    });
}

function tambahGambar(files) {
    const layout = LAYOUTS[layoutDipilih];
    const maks = layout ? layout.slots : 9;

    const valid = files.filter((f) => f.type.startsWith('image/'));
    if (valid.length === 0) {
        tampilkanToast('Hanya file gambar yang didukung.');
        return;
    }

    valid.forEach((file) => {
        if (gambarDiunggah.length >= 9) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            gambarDiunggah.push({ src: e.target.result, nama: file.name });
            renderDaftarGambar();
            renderPreviewKolase();
        };
        reader.readAsDataURL(file);
    });

    tampilkanToast(`${valid.length} gambar ditambahkan.`);
}

function renderDaftarGambar() {
    const container = document.getElementById('collage-image-list');
    if (!container) return;

    if (gambarDiunggah.length === 0) {
        container.innerHTML = '<p class="collage-empty-list">Belum ada gambar.</p>';
        return;
    }

    container.innerHTML = gambarDiunggah.map((gambar, idx) => `
        <div class="collage-thumb" draggable="true" data-idx="${idx}">
            <img src="${gambar.src}" alt="${gambar.nama}" loading="lazy">
            <button class="collage-thumb-remove" type="button" data-remove="${idx}" aria-label="Hapus gambar ${idx + 1}">×</button>
            <span class="collage-thumb-num">${idx + 1}</span>
        </div>
    `).join('');

    // Bind remove buttons
    container.querySelectorAll('[data-remove]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.remove, 10);
            gambarDiunggah.splice(idx, 1);
            renderDaftarGambar();
            renderPreviewKolase();
        });
    });

    // Drag-to-reorder
    bindDragReorderThumbs(container);
}

function bindDragReorderThumbs(container) {
    let dragIdx = null;

    container.querySelectorAll('.collage-thumb').forEach((el) => {
        el.addEventListener('dragstart', () => {
            dragIdx = parseInt(el.dataset.idx, 10);
            el.classList.add('dragging');
        });
        el.addEventListener('dragend', () => {
            el.classList.remove('dragging');
            dragIdx = null;
        });
        el.addEventListener('dragover', (e) => {
            e.preventDefault();
            el.classList.add('drag-target');
        });
        el.addEventListener('dragleave', () => {
            el.classList.remove('drag-target');
        });
        el.addEventListener('drop', (e) => {
            e.preventDefault();
            el.classList.remove('drag-target');
            const dropIdx = parseInt(el.dataset.idx, 10);
            if (dragIdx !== null && dragIdx !== dropIdx) {
                const moved = gambarDiunggah.splice(dragIdx, 1)[0];
                gambarDiunggah.splice(dropIdx, 0, moved);
                renderDaftarGambar();
                renderPreviewKolase();
            }
        });
    });
}

function renderPreviewKolase() {
    const wrapper = document.getElementById('collage-preview-wrapper');
    if (!wrapper) return;

    if (gambarDiunggah.length === 0) {
        wrapper.innerHTML = '<p class="collage-preview-empty">Preview kolase akan tampil di sini setelah gambar diupload.</p>';
        return;
    }

    const layout = LAYOUTS[layoutDipilih] || LAYOUTS['grid-2x2'];
    const slots = layout.slots;
    const imgsToUse = gambarDiunggah.slice(0, slots);

    let gridStyle = '';
    let gridClass = `collage-preview-grid layout-${layoutDipilih}`;

    switch (layoutDipilih) {
        case 'grid-2x2':
            gridStyle = `grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr);`;
            break;
        case 'grid-3x3':
            gridStyle = `grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);`;
            break;
        case 'grid-1+2':
            gridStyle = `grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr;`;
            break;
        case 'grid-2+1':
            gridStyle = `grid-template-columns: 1fr 2fr; grid-template-rows: 1fr 1fr;`;
            break;
        case 'grid-row':
            gridStyle = `grid-template-columns: repeat(3, 1fr); grid-template-rows: 1fr;`;
            break;
        case 'grid-col':
            gridStyle = `grid-template-columns: 1fr; grid-template-rows: repeat(3, 1fr);`;
            break;
        case 'grid-1x2':
            gridStyle = `grid-template-columns: repeat(2, 1fr); grid-template-rows: 1fr;`;
            break;
        case 'grid-2x1':
            gridStyle = `grid-template-columns: 1fr; grid-template-rows: repeat(2, 1fr);`;
            break;
    }

    const items = imgsToUse.map((gambar, idx) => {
        let itemStyle = '';
        // Special spanning for asymmetric layouts
        if (layoutDipilih === 'grid-1+2' && idx === 0) {
            itemStyle = 'grid-row: 1 / 3;';
        }
        if (layoutDipilih === 'grid-2+1' && idx === 2) {
            itemStyle = 'grid-column: 2; grid-row: 1 / 3;';
        }
        return `<div class="collage-slot" style="${itemStyle} border-radius: ${sudutBulat}px; overflow: hidden;"><img src="${gambar.src}" alt="${gambar.nama}" style="width:100%;height:100%;object-fit:cover;border-radius:${sudutBulat}px;"></div>`;
    }).join('');

    // Fill missing slots with placeholders
    const missing = Math.max(0, slots - imgsToUse.length);
    const placeholders = Array.from({ length: missing }, (_, i) =>
        `<div class="collage-slot collage-slot-empty" style="border-radius:${sudutBulat}px;"><span>${imgsToUse.length + i + 1}</span></div>`
    ).join('');

    wrapper.innerHTML = `
        <div class="${gridClass}" style="${gridStyle} gap: ${jarakAntar}px; background: ${warnaBg}; padding: ${jarakAntar}px; border-radius: ${Math.max(0, sudutBulat + 4)}px;">
            ${items}${placeholders}
        </div>
    `;
}

function bersihkanCanvas() {
    const canvas = document.getElementById('collage-canvas');
    const status = document.getElementById('collage-canvas-status');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.dataset.hasContent = 'false';
        canvas.style.display = 'none';
    }
    if (status) {
        status.textContent = '';
        status.hidden = true;
    }
}

async function buatKolaseCanvas() {
    const canvas = document.getElementById('collage-canvas');
    const statusEl = document.getElementById('collage-canvas-status');
    if (!canvas) return;

    const layout = LAYOUTS[layoutDipilih] || LAYOUTS['grid-2x2'];
    const slots = layout.slots;
    const imgsToUse = gambarDiunggah.slice(0, slots);

    if (statusEl) {
        statusEl.textContent = 'Memproses...';
        statusEl.hidden = false;
    }

    try {
        // Load all images
        const loadedImgs = await Promise.all(imgsToUse.map(loadImage));

        const CANVAS_W = 1200;
        const CANVAS_H = 1200;
        const GAP = jarakAntar * 3;
        const PADDING = jarakAntar * 3;
        const RADIUS = sudutBulat * 2;

        canvas.width = CANVAS_W;
        canvas.height = CANVAS_H;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = warnaBg;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Compute slot rects
        const rects = hitungRects(layoutDipilih, CANVAS_W, CANVAS_H, GAP, PADDING, slots, loadedImgs.length);

        // Draw each image
        loadedImgs.forEach((img, i) => {
            if (!rects[i]) return;
            const { x, y, w, h } = rects[i];
            ctx.save();
            if (RADIUS > 0) {
                bulatKanvas(ctx, x, y, w, h, RADIUS);
                ctx.clip();
            }
            // Draw cover-fit
            const { sx, sy, sw, sh } = coverFit(img.naturalWidth, img.naturalHeight, w, h);
            ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
            ctx.restore();
        });

        canvas.style.display = 'block';
        canvas.dataset.hasContent = 'true';

        if (statusEl) {
            statusEl.textContent = 'Kolase siap! Tekan Download untuk menyimpan.';
            statusEl.hidden = false;
        }

        tampilkanToast('Kolase berhasil dibuat!');
    } catch (err) {
        if (statusEl) {
            statusEl.textContent = 'Gagal membuat kolase.';
            statusEl.hidden = false;
        }
        tampilkanToast('Gagal memproses gambar.');
    }
}

function loadImage(gambar) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = gambar.src;
    });
}

function hitungRects(layout, W, H, gap, pad, slots, count) {
    const inner_w = W - pad * 2;
    const inner_h = H - pad * 2;
    const rects = [];

    switch (layout) {
        case 'grid-2x2': {
            const cw = (inner_w - gap) / 2;
            const ch = (inner_h - gap) / 2;
            for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
                rects.push({ x: pad + c * (cw + gap), y: pad + r * (ch + gap), w: cw, h: ch });
            }
            break;
        }
        case 'grid-3x3': {
            const cw = (inner_w - gap * 2) / 3;
            const ch = (inner_h - gap * 2) / 3;
            for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
                rects.push({ x: pad + c * (cw + gap), y: pad + r * (ch + gap), w: cw, h: ch });
            }
            break;
        }
        case 'grid-1+2': {
            const bigW = (inner_w - gap) * 2 / 3;
            const smallW = inner_w - gap - bigW;
            const ch = (inner_h - gap) / 2;
            rects.push({ x: pad, y: pad, w: bigW, h: inner_h });
            rects.push({ x: pad + bigW + gap, y: pad, w: smallW, h: ch });
            rects.push({ x: pad + bigW + gap, y: pad + ch + gap, w: smallW, h: ch });
            break;
        }
        case 'grid-2+1': {
            const smallW = (inner_w - gap) * 1 / 3;
            const bigW = inner_w - gap - smallW;
            const ch = (inner_h - gap) / 2;
            rects.push({ x: pad, y: pad, w: smallW, h: ch });
            rects.push({ x: pad, y: pad + ch + gap, w: smallW, h: ch });
            rects.push({ x: pad + smallW + gap, y: pad, w: bigW, h: inner_h });
            break;
        }
        case 'grid-row': {
            const cw = (inner_w - gap * 2) / 3;
            for (let c = 0; c < 3; c++) {
                rects.push({ x: pad + c * (cw + gap), y: pad, w: cw, h: inner_h });
            }
            break;
        }
        case 'grid-col': {
            const ch = (inner_h - gap * 2) / 3;
            for (let r = 0; r < 3; r++) {
                rects.push({ x: pad, y: pad + r * (ch + gap), w: inner_w, h: ch });
            }
            break;
        }
        case 'grid-1x2': {
            const cw = (inner_w - gap) / 2;
            rects.push({ x: pad, y: pad, w: cw, h: inner_h });
            rects.push({ x: pad + cw + gap, y: pad, w: cw, h: inner_h });
            break;
        }
        case 'grid-2x1': {
            const ch = (inner_h - gap) / 2;
            rects.push({ x: pad, y: pad, w: inner_w, h: ch });
            rects.push({ x: pad, y: pad + ch + gap, w: inner_w, h: ch });
            break;
        }
        default:
            break;
    }

    return rects;
}

function coverFit(imgW, imgH, boxW, boxH) {
    const scaleX = boxW / imgW;
    const scaleY = boxH / imgH;
    const scale = Math.max(scaleX, scaleY);
    const scaledW = imgW * scale;
    const scaledH = imgH * scale;
    const sx = (scaledW - boxW) / 2 / scale;
    const sy = (scaledH - boxH) / 2 / scale;
    const sw = boxW / scale;
    const sh = boxH / scale;
    return { sx, sy, sw, sh };
}

function bulatKanvas(ctx, x, y, w, h, r) {
    const maxR = Math.min(w, h) / 2;
    r = Math.min(r, maxR);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
}

function downloadKolase(canvas) {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `kolase-totools-${Date.now()}.png`;
    a.click();
    tampilkanToast('Kolase diunduh!');
}
