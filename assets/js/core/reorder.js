import { getDockTools, bindDockSettings } from './dock.js';
import { refreshEventToolButtons } from './modal.js';
import { renderTools } from './render.js';
import { tampilkanToast } from './toast.js';

const posisiKey = 'totools-icon-positions';
const layoutModeKey = 'totools-desktop-layout-mode';
const mediaDesktop = window.matchMedia('(min-width: 721px)');
let posisiIkon = bacaPosisiIkon();
let layoutMode = bacaLayoutMode();
let dragState = null;

export function initDragReorder() {
    bindShortcutDrag();
    document.querySelector('[data-action="reset-desktop-layout"]')?.addEventListener('click', resetDesktopLayout);
    const modeSelect = document.querySelector('[data-action="desktop-layout-mode"]');
    if (modeSelect) {
        modeSelect.value = layoutMode;
        modeSelect.addEventListener('change', () => {
            layoutMode = modeSelect.value;
            localStorage.setItem(layoutModeKey, layoutMode);
            bindShortcutDrag();
            tampilkanToast('Mode desktop diperbarui.');
        });
    }
    mediaDesktop.addEventListener('change', bindShortcutDrag);
    window.addEventListener('totools:tools-rendered', bindShortcutDrag);
}

export function bindShortcutDrag() {
    const area = document.querySelector('.shortcut-area');
    const cards = Array.from(document.querySelectorAll('.shortcut-area .tool-card'));

    if (!area) {
        return;
    }

    if (!mediaDesktop.matches) {
        cards.forEach((card) => {
            card.style.left = '';
            card.style.top = '';
            card.classList.remove('is-positioned', 'is-dragging');
        });
        return;
    }

    cards.forEach((card, index) => {
        const id = card.dataset.tool;
        const posisi = layoutMode === 'reorder' ? posisiDefault(index) : posisiIkon[id] || posisiDefault(index);
        terapkanPosisi(card, posisi.x, posisi.y);

        if (card.dataset.boundFreeDrag === 'true') {
            return;
        }

        card.addEventListener('pointerdown', mulaiDrag);
        card.addEventListener('click', cegahKlikSetelahDrag, true);
        card.dataset.boundFreeDrag = 'true';
    });
}

function mulaiDrag(event) {
    if (!mediaDesktop.matches || event.button !== 0) {
        return;
    }

    const card = event.currentTarget;
    const area = document.querySelector('.shortcut-area');
    const cardRect = card.getBoundingClientRect();
    const areaRect = area.getBoundingClientRect();

    dragState = {
        card,
        id: card.dataset.tool,
        area,
        areaRect,
        startX: event.clientX,
        startY: event.clientY,
        offsetX: event.clientX - cardRect.left,
        offsetY: event.clientY - cardRect.top,
        moved: false
    };

    card.setPointerCapture(event.pointerId);
    card.classList.add('is-dragging');
    card.addEventListener('pointermove', dragBerjalan);
    card.addEventListener('pointerup', selesaiDrag, { once: true });
    card.addEventListener('pointercancel', selesaiDrag, { once: true });
}

function dragBerjalan(event) {
    if (!dragState) {
        return;
    }

    const delta = Math.abs(event.clientX - dragState.startX) + Math.abs(event.clientY - dragState.startY);
    if (delta > 6) {
        dragState.moved = true;
    }

    if (!dragState.moved) {
        return;
    }

    const x = event.clientX - dragState.areaRect.left - dragState.offsetX;
    const y = event.clientY - dragState.areaRect.top - dragState.offsetY;
    const posisi = batasiPosisi(x, y, dragState.card, dragState.area);
    terapkanPosisi(dragState.card, posisi.x, posisi.y);
}

function selesaiDrag(event) {
    if (!dragState) {
        return;
    }

    const { card, id, moved } = dragState;
    card.classList.remove('is-dragging');
    card.removeEventListener('pointermove', dragBerjalan);

    if (moved && layoutMode === 'reorder') {
        const pointerEventsAwal = card.style.pointerEvents;
        card.style.pointerEvents = 'none';
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.shortcut-area .tool-card');
        card.style.pointerEvents = pointerEventsAwal;

        if (target && target !== card) {
            pindahUrutan(card.dataset.tool, target.dataset.tool);
        } else {
            bindShortcutDrag();
        }
    } else if (moved) {
        let x = Number.parseFloat(card.style.left) || 0;
        let y = Number.parseFloat(card.style.top) || 0;

        if (layoutMode === 'grid') {
            const snap = snapPosisiKosong(x, y, card, dragState.area);
            x = snap.x;
            y = snap.y;
            terapkanPosisi(card, x, y);
        }

        posisiIkon[id] = {
            x,
            y
        };
        localStorage.setItem(posisiKey, JSON.stringify(posisiIkon));
        card.dataset.suppressClick = 'true';
        tampilkanToast('Posisi app disimpan.');
    }

    try {
        card.releasePointerCapture(event.pointerId);
    } catch (error) {
        // Pointer capture may already be released by the browser.
    }

    dragState = null;
}

function cegahKlikSetelahDrag(event) {
    if (event.currentTarget.dataset.suppressClick === 'true') {
        event.currentTarget.dataset.suppressClick = 'false';
        event.preventDefault();
        event.stopImmediatePropagation();
    }
}

function posisiDefault(index) {
    const area = document.querySelector('.shortcut-area');
    const barisMaks = area ? Math.max(1, Math.floor(area.clientHeight / 132)) : 4;
    const kolom = Math.floor(index / barisMaks);
    const baris = index % barisMaks;
    return {
        x: kolom * 112,
        y: baris * 132
    };
}

function terapkanPosisi(card, x, y) {
    const area = document.querySelector('.shortcut-area');
    const posisi = batasiPosisi(x, y, card, area);
    card.style.left = `${posisi.x}px`;
    card.style.top = `${posisi.y}px`;
    card.classList.add('is-positioned');
}

function batasiPosisi(x, y, card, area) {
    const maxX = Math.max(0, area.clientWidth - card.offsetWidth);
    const maxY = Math.max(0, area.clientHeight - card.offsetHeight);
    return {
        x: Math.min(Math.max(0, x), maxX),
        y: Math.min(Math.max(0, y), maxY)
    };
}

function bacaPosisiIkon() {
    try {
        const tersimpan = JSON.parse(localStorage.getItem(posisiKey) || '{}');
        return tersimpan && typeof tersimpan === 'object' ? tersimpan : {};
    } catch (error) {
        return {};
    }
}

function bacaLayoutMode() {
    const mode = localStorage.getItem(layoutModeKey) || 'grid';
    return ['reorder', 'free', 'grid'].includes(mode) ? mode : 'grid';
}

function snapPosisiKosong(x, y, card, area) {
    const gridX = 112;
    const gridY = 132;
    const maxCol = Math.max(0, Math.floor((area.clientWidth - card.offsetWidth) / gridX));
    const maxRow = Math.max(0, Math.floor((area.clientHeight - card.offsetHeight) / gridY));
    const colTarget = Math.min(Math.max(0, Math.round(x / gridX)), maxCol);
    const rowTarget = Math.min(Math.max(0, Math.round(y / gridY)), maxRow);
    const terisi = new Set();

    document.querySelectorAll('.shortcut-area .tool-card').forEach((item) => {
        if (item === card) {
            return;
        }

        const col = Math.round((Number.parseFloat(item.style.left) || 0) / gridX);
        const row = Math.round((Number.parseFloat(item.style.top) || 0) / gridY);
        terisi.add(`${col}:${row}`);
    });

    let terbaik = { col: colTarget, row: rowTarget, jarak: Infinity };
    for (let col = 0; col <= maxCol; col += 1) {
        for (let row = 0; row <= maxRow; row += 1) {
            if (terisi.has(`${col}:${row}`)) {
                continue;
            }

            const jarak = Math.abs(col - colTarget) + Math.abs(row - rowTarget);
            if (jarak < terbaik.jarak) {
                terbaik = { col, row, jarak };
            }
        }
    }

    return batasiPosisi(terbaik.col * gridX, terbaik.row * gridY, card, area);
}

function pindahUrutan(idAsal, idTujuan) {
    const urutan = Array.from(document.querySelectorAll('.shortcut-area .tool-card')).map((card) => card.dataset.tool);
    const asalIndex = urutan.indexOf(idAsal);
    const tujuanIndex = urutan.indexOf(idTujuan);

    if (asalIndex === -1 || tujuanIndex === -1) {
        return;
    }

    const [dipindah] = urutan.splice(asalIndex, 1);
    urutan.splice(tujuanIndex, 0, dipindah);
    localStorage.setItem('totools-tool-order', JSON.stringify(urutan));
    renderTools(getDockTools());
    refreshEventToolButtons();
    bindDockSettings();
    bindShortcutDrag();
    tampilkanToast('Urutan app diperbarui.');
}

function resetDesktopLayout() {
    posisiIkon = {};
    localStorage.removeItem(posisiKey);
    renderTools(getDockTools());
    refreshEventToolButtons();
    bindDockSettings();
    bindShortcutDrag();
    tampilkanToast('Desktop layout direset.');
}
