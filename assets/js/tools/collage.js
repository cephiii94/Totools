import { tampilkanToast } from '../core/toast.js';

let gambarDiunggah = [];
let layoutDipilih = 'grid-2x2';
let warnaBg = '#1a1a2e';
let jarakAntar = 8;
let sudutBulat = 0;
let slotDipilih = null;

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

    // Controls for image zoom & pan adjustment
    const inputZoom = document.getElementById('collage-zoom');
    const inputOffsetX = document.getElementById('collage-offset-x');
    const inputOffsetY = document.getElementById('collage-offset-y');
    const btnResetAdjust = document.getElementById('collage-adjust-reset');

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

    dropzone?.addEventListener('click', (e) => {
        if (e.target.closest('#collage-upload-btn')) return;
        inputFile?.click();
    });

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
        slotDipilih = null;
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

    // Adjust panel sliders
    inputZoom?.addEventListener('input', (e) => {
        if (slotDipilih === null || !gambarDiunggah[slotDipilih]) return;
        const val = parseFloat(e.target.value);
        gambarDiunggah[slotDipilih].zoom = val;
        document.getElementById('collage-zoom-val').textContent = `${val.toFixed(2)}x`;
        updateSlotTransform(slotDipilih);
    });

    inputOffsetX?.addEventListener('input', (e) => {
        if (slotDipilih === null || !gambarDiunggah[slotDipilih]) return;
        gambarDiunggah[slotDipilih].offsetX = parseInt(e.target.value, 10);
        updateSlotTransform(slotDipilih);
    });

    inputOffsetY?.addEventListener('input', (e) => {
        if (slotDipilih === null || !gambarDiunggah[slotDipilih]) return;
        gambarDiunggah[slotDipilih].offsetY = parseInt(e.target.value, 10);
        updateSlotTransform(slotDipilih);
    });

    btnResetAdjust?.addEventListener('click', () => {
        if (slotDipilih === null || !gambarDiunggah[slotDipilih]) return;
        gambarDiunggah[slotDipilih].zoom = 1;
        gambarDiunggah[slotDipilih].offsetX = 0;
        gambarDiunggah[slotDipilih].offsetY = 0;
        syncAdjustPanelValues();
        updateSlotTransform(slotDipilih);
        tampilkanToast(`Posisi gambar #${slotDipilih + 1} direset.`);
    });

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
        slotDipilih = null;
        renderDaftarGambar();
        renderPreviewKolase();
        bersihkanCanvas();
        tampilkanToast('Gambar direset.');
    });
}

const MAX_DIMENSION = 2048;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB max per file

async function tambahGambar(files) {
    const valid = files.filter((f) => f.type.startsWith('image/'));
    if (valid.length === 0) {
        tampilkanToast('Hanya file gambar yang didukung.');
        return;
    }

    let adaYangDikompres = false;
    let ditambahkan = 0;

    for (const file of valid) {
        if (gambarDiunggah.length >= 9) {
            tampilkanToast('Maksimal 9 gambar per kolase.');
            break;
        }

        try {
            const hasil = await kompresGambar(file);
            gambarDiunggah.push({
                src: hasil.src,
                nama: hasil.nama,
                zoom: 1,
                offsetX: 0,
                offsetY: 0
            });
            if (hasil.dikompres) adaYangDikompres = true;
            ditambahkan++;
        } catch (err) {
            tampilkanToast(err.message || `Gagal memproses ${file.name}`);
        }
    }

    if (ditambahkan > 0) {
        renderDaftarGambar();
        renderPreviewKolase();
        if (adaYangDikompres) {
            tampilkanToast(`${ditambahkan} gambar ditambahkan (otomatis dioptimasi).`);
        } else {
            tampilkanToast(`${ditambahkan} gambar ditambahkan.`);
        }
    }
}

async function kompresGambar(file) {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File ${file.name} terlalu besar (maksimal 50MB).`);
    }

    const dataUrl = await readFileAsDataURL(file);
    const img = await loadImageFromSrc(dataUrl);

    let { width, height } = img;
    
    // Jika dimensi & ukuran file sudah kecil, tidak perlu dikompresi lagi
    if (width <= MAX_DIMENSION && height <= MAX_DIMENSION && file.size < 2 * 1024 * 1024) {
        return { src: dataUrl, nama: file.name, dikompres: false };
    }

    // Hitung rasio kecilan
    let scale = 1;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    }

    const newWidth = Math.round(width * scale);
    const newHeight = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    // Kompres ke JPEG kualitas 88%
    const compressedSrc = canvas.toDataURL('image/jpeg', 0.88);
    return { src: compressedSrc, nama: file.name, dikompres: true };
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function loadImageFromSrc(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function renderDaftarGambar() {
    const container = document.getElementById('collage-image-list');
    if (!container) return;

    if (gambarDiunggah.length === 0) {
        container.innerHTML = '<p class="collage-empty-list">Belum ada gambar.</p>';
        return;
    }

    container.innerHTML = gambarDiunggah.map((gambar, idx) => `
        <div class="collage-thumb ${slotDipilih === idx ? 'is-selected' : ''}" draggable="true" data-idx="${idx}">
            <img src="${gambar.src}" alt="${gambar.nama}" loading="lazy">
            <button class="collage-thumb-remove" type="button" data-remove="${idx}" aria-label="Hapus gambar ${idx + 1}">×</button>
            <span class="collage-thumb-num">${idx + 1}</span>
        </div>
    `).join('');

    // Bind thumbnail selection & remove
    container.querySelectorAll('.collage-thumb').forEach((thumb) => {
        thumb.addEventListener('click', () => {
            const idx = parseInt(thumb.dataset.idx, 10);
            pilihSlot(idx);
        });
    });

    container.querySelectorAll('[data-remove]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.remove, 10);
            gambarDiunggah.splice(idx, 1);
            if (slotDipilih === idx) slotDipilih = null;
            else if (slotDipilih > idx) slotDipilih--;
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
                slotDipilih = dropIdx;
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
        sebunyikanAdjustPanel();
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
        if (layoutDipilih === 'grid-1+2' && idx === 0) {
            itemStyle = 'grid-row: 1 / 3;';
        }
        if (layoutDipilih === 'grid-2+1' && idx === 2) {
            itemStyle = 'grid-column: 2; grid-row: 1 / 3;';
        }

        const isSelected = slotDipilih === idx;
        const zoom = gambar.zoom || 1;
        const offX = gambar.offsetX || 0;
        const offY = gambar.offsetY || 0;

        return `
            <div class="collage-slot ${isSelected ? 'is-selected' : ''}" data-slot-idx="${idx}" style="${itemStyle} border-radius: ${sudutBulat}px;">
                <img src="${gambar.src}" alt="${gambar.nama}" style="border-radius:${sudutBulat}px; transform: scale(${zoom}) translate(${offX / zoom}%, ${offY / zoom}%); transform-origin: center center;">
            </div>
        `;
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

    bindSlotInteractions(wrapper);

    if (slotDipilih !== null && slotDipilih < imgsToUse.length) {
        tampilkanAdjustPanel();
    } else {
        sebunyikanAdjustPanel();
    }
}

function bindSlotInteractions(wrapper) {
    wrapper.querySelectorAll('.collage-slot[data-slot-idx]').forEach((slotEl) => {
        const idx = parseInt(slotEl.dataset.slotIdx, 10);
        let isPointerDown = false;
        let startX = 0;
        let startY = 0;
        let initOffX = 0;
        let initOffY = 0;

        slotEl.addEventListener('pointerdown', (e) => {
            isPointerDown = true;
            startX = e.clientX;
            startY = e.clientY;
            const g = gambarDiunggah[idx];
            initOffX = g ? (g.offsetX || 0) : 0;
            initOffY = g ? (g.offsetY || 0) : 0;
            slotEl.setPointerCapture(e.pointerId);
            pilihSlot(idx);
        });

        slotEl.addEventListener('pointermove', (e) => {
            if (!isPointerDown) return;
            const g = gambarDiunggah[idx];
            if (!g) return;

            const rect = slotEl.getBoundingClientRect();
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            const percentX = (deltaX / rect.width) * 100;
            const percentY = (deltaY / rect.height) * 100;

            const zoom = g.zoom || 1;
            g.offsetX = Math.max(-100, Math.min(100, Math.round(initOffX + percentX * zoom)));
            g.offsetY = Math.max(-100, Math.min(100, Math.round(initOffY + percentY * zoom)));

            updateSlotTransform(idx);
            syncAdjustPanelValues();
        });

        const stopPointer = (e) => {
            if (isPointerDown) {
                isPointerDown = false;
                try { slotEl.releasePointerCapture(e.pointerId); } catch (err) {}
            }
        };

        slotEl.addEventListener('pointerup', stopPointer);
        slotEl.addEventListener('pointercancel', stopPointer);

        // Mouse Wheel Zoom In / Out
        slotEl.addEventListener('wheel', (e) => {
            e.preventDefault();
            const g = gambarDiunggah[idx];
            if (!g) return;

            pilihSlot(idx);

            const currentZoom = g.zoom || 1;
            const delta = e.deltaY < 0 ? 0.08 : -0.08;
            const newZoom = Math.max(0.2, Math.min(3, Math.round((currentZoom + delta) * 100) / 100));

            g.zoom = newZoom;
            updateSlotTransform(idx);
            syncAdjustPanelValues();
        }, { passive: false });

        // Multi-touch Pinch Zoom (2 fingers) for Mobile Browsers
        let initialTouchDist = 0;
        let initialTouchZoom = 1;

        slotEl.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                isPointerDown = false;
                const g = gambarDiunggah[idx];
                if (!g) return;
                pilihSlot(idx);
                initialTouchZoom = g.zoom || 1;
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                initialTouchDist = Math.hypot(dx, dy);
            }
        }, { passive: true });

        slotEl.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && initialTouchDist > 0) {
                e.preventDefault();
                const g = gambarDiunggah[idx];
                if (!g) return;

                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const currentDist = Math.hypot(dx, dy);

                if (currentDist > 0) {
                    const scaleFactor = currentDist / initialTouchDist;
                    const newZoom = Math.max(0.2, Math.min(3, Math.round(initialTouchZoom * scaleFactor * 100) / 100));
                    g.zoom = newZoom;
                    updateSlotTransform(idx);
                    syncAdjustPanelValues();
                }
            }
        }, { passive: false });

        slotEl.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                initialTouchDist = 0;
            }
        });

        // Double-click to reset zoom and pan position
        slotEl.addEventListener('dblclick', () => {
            const g = gambarDiunggah[idx];
            if (!g) return;
            g.zoom = 1;
            g.offsetX = 0;
            g.offsetY = 0;
            updateSlotTransform(idx);
            tampilkanToast(`Posisi gambar #${idx + 1} direset.`);
        });
    });
}

function pilihSlot(idx) {
    if (idx < 0 || idx >= gambarDiunggah.length) return;
    slotDipilih = idx;

    // Update active highlight in preview grid
    document.querySelectorAll('.collage-slot[data-slot-idx]').forEach((el) => {
        const slotIdx = parseInt(el.dataset.slotIdx, 10);
        el.classList.toggle('is-selected', slotIdx === idx);
    });

    // Update active highlight in thumbnail list
    document.querySelectorAll('.collage-thumb').forEach((thumb) => {
        const thumbIdx = parseInt(thumb.dataset.idx, 10);
        thumb.classList.toggle('is-selected', thumbIdx === idx);
    });

    tampilkanAdjustPanel();
}

function updateSlotTransform(idx) {
    const slotEl = document.querySelector(`.collage-slot[data-slot-idx="${idx}"]`);
    const imgEl = slotEl?.querySelector('img');
    const g = gambarDiunggah[idx];
    if (!imgEl || !g) return;

    const zoom = g.zoom || 1;
    const offX = g.offsetX || 0;
    const offY = g.offsetY || 0;
    imgEl.style.transform = `scale(${zoom}) translate(${offX / zoom}%, ${offY / zoom}%)`;
}

function tampilkanAdjustPanel() {
    const panel = document.getElementById('collage-adjust-panel');
    const title = document.getElementById('collage-adjust-title');
    if (!panel || slotDipilih === null || !gambarDiunggah[slotDipilih]) return;

    panel.hidden = false;
    if (title) title.textContent = `Atur Gambar #${slotDipilih + 1}`;
    syncAdjustPanelValues();
}

function sebunyikanAdjustPanel() {
    const panel = document.getElementById('collage-adjust-panel');
    if (panel) panel.hidden = true;
}

function syncAdjustPanelValues() {
    if (slotDipilih === null || !gambarDiunggah[slotDipilih]) return;
    const g = gambarDiunggah[slotDipilih];
    const zoom = g.zoom || 1;
    const offX = g.offsetX || 0;
    const offY = g.offsetY || 0;

    const inputZoom = document.getElementById('collage-zoom');
    const inputOffsetX = document.getElementById('collage-offset-x');
    const inputOffsetY = document.getElementById('collage-offset-y');
    const labelZoom = document.getElementById('collage-zoom-val');

    if (inputZoom) inputZoom.value = zoom;
    if (inputOffsetX) inputOffsetX.value = offX;
    if (inputOffsetY) inputOffsetY.value = offY;
    if (labelZoom) labelZoom.textContent = `${zoom.toFixed(2)}x`;
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
        const loadedImgs = await Promise.all(imgsToUse.map((g) => loadImageFromSrc(g.src)));

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

        // Draw each image with zoom & pan
        loadedImgs.forEach((img, i) => {
            if (!rects[i]) return;
            const { x, y, w, h } = rects[i];
            const g = imgsToUse[i];
            const zoom = g.zoom || 1;
            const offX = g.offsetX || 0;
            const offY = g.offsetY || 0;

            const nw = img.naturalWidth || img.width || 1;
            const nh = img.naturalHeight || img.height || 1;

            ctx.save();
            if (RADIUS > 0) {
                bulatKanvas(ctx, x, y, w, h, RADIUS);
                ctx.clip();
            }

            drawSlotImage(ctx, img, nw, nh, x, y, w, h, zoom, offX, offY);
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
        console.error('Error buatKolaseCanvas:', err);
        if (statusEl) {
            statusEl.textContent = `Gagal membuat kolase: ${err.message || err}`;
            statusEl.hidden = false;
        }
        tampilkanToast('Gagal memproses gambar.');
    }
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

function drawSlotImage(ctx, img, imgW, imgH, boxX, boxY, boxW, boxH, zoom = 1, offsetX = 0, offsetY = 0) {
    imgW = Math.max(1, imgW || 1);
    imgH = Math.max(1, imgH || 1);
    boxW = Math.max(1, boxW || 1);
    boxH = Math.max(1, boxH || 1);
    const z = Math.max(0.1, zoom || 1);

    const baseScale = Math.max(boxW / imgW, boxH / imgH);
    const totalScale = baseScale * z;

    const scaledW = imgW * totalScale;
    const scaledH = imgH * totalScale;

    if (z >= 1.0) {
        const maxShiftX = (scaledW - boxW) / 2;
        const maxShiftY = (scaledH - boxH) / 2;

        const shiftX = ((offsetX || 0) / 100) * maxShiftX;
        const shiftY = ((offsetY || 0) / 100) * maxShiftY;

        let sw = boxW / totalScale;
        let sh = boxH / totalScale;

        let sx = (scaledW - boxW) / 2 / totalScale - shiftX / totalScale;
        let sy = (scaledH - boxH) / 2 / totalScale - shiftY / totalScale;

        sx = Math.max(0, Math.min(imgW - sw, sx));
        sy = Math.max(0, Math.min(imgH - sh, sy));

        sw = Math.max(1, Math.min(imgW - sx, sw));
        sh = Math.max(1, Math.min(imgH - sy, sh));

        ctx.drawImage(img, sx, sy, sw, sh, boxX, boxY, boxW, boxH);
    } else {
        const maxShiftX = (boxW - scaledW) / 2;
        const maxShiftY = (boxH - scaledH) / 2;

        const shiftX = ((offsetX || 0) / 100) * (maxShiftX + boxW * 0.4);
        const shiftY = ((offsetY || 0) / 100) * (maxShiftY + boxH * 0.4);

        const dx = boxX + (boxW - scaledW) / 2 + shiftX;
        const dy = boxY + (boxH - scaledH) / 2 + shiftY;

        ctx.drawImage(img, 0, 0, imgW, imgH, dx, dy, scaledW, scaledH);
    }
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
