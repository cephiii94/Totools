import { getDaftarTools } from '../data/tools.js';

export function buatIkon(path) {
    return `<svg viewBox="0 0 24 24" focusable="false"><path d="${path}" /></svg>`;
}

export function renderTools(dockTools) {
    const areaTools = document.querySelector('[data-render="tools"]');
    const areaDock = document.querySelector('[data-render="dock"]');
    const areaDockSettings = document.querySelector('[data-render="dock-settings"]');
    const areaDesktopSettings = document.querySelector('[data-render="desktop-settings"]');
    const areaStartMenu = document.querySelector('[data-render="start-menu"]');
    const daftarTools = getDaftarTools();
    const desktopTools = bacaDesktopTools(daftarTools);

    if (areaTools) {
        areaTools.innerHTML = daftarTools.filter((tool) => desktopTools.includes(tool.id)).map((tool) => `
            <button class="tool-card" type="button" data-tool="${tool.id}">
                <span class="tool-icon ${tool.ikonClass}" aria-hidden="true">${buatIkon(tool.ikonPath)}</span>
                <span class="tool-title">${tool.nama}</span>
                <span class="tool-desc">${tool.deskripsi}</span>
            </button>
        `).join('');
    }

    if (areaDock) {
        areaDock.querySelectorAll('[data-tool]').forEach((tombol) => tombol.remove());
        const toolsDock = daftarTools.filter((tool) => dockTools.includes(tool.id));
        areaDock.insertAdjacentHTML('afterbegin', toolsDock.map((tool) => `
            <button type="button" data-tool="${tool.id}" aria-label="${tool.labelAkses}">
                ${buatIkon(tool.ikonPath)}
            </button>
        `).join(''));
    }

    if (areaDockSettings) {
        areaDockSettings.innerHTML = daftarTools.map((tool) => `
            <label class="dock-setting-item">
                <span>${tool.nama}</span>
                <input type="checkbox" value="${tool.id}" data-action="toggle-dock-tool" ${dockTools.includes(tool.id) ? 'checked' : ''}>
            </label>
        `).join('');
    }

    if (areaDesktopSettings) {
        areaDesktopSettings.innerHTML = daftarTools.map((tool) => `
            <label class="dock-setting-item">
                <span>${tool.nama}</span>
                <input type="checkbox" value="${tool.id}" data-action="toggle-desktop-tool" ${desktopTools.includes(tool.id) ? 'checked' : ''}>
            </label>
        `).join('');
    }

    if (areaStartMenu) {
        areaStartMenu.innerHTML = daftarTools.map((tool) => `
            <button type="button" data-tool="${tool.id}">
                <span class="tool-icon ${tool.ikonClass}" aria-hidden="true">${buatIkon(tool.ikonPath)}</span>
                <span>${tool.nama}</span>
            </button>
        `).join('');
    }
}

function bacaDesktopTools(daftarTools) {
    try {
        const semuaTool = daftarTools.map((tool) => tool.id);
        const tersimpan = JSON.parse(localStorage.getItem('totools-desktop-tools') || JSON.stringify(semuaTool));
        return Array.isArray(tersimpan) ? tersimpan : semuaTool;
    } catch (error) {
        return daftarTools.map((tool) => tool.id);
    }
}

export function renderModalChrome() {
    document.querySelectorAll('.tool-modal').forEach((modal) => {
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('tabindex', '-1');

        if (modal.querySelector('.modal-bar')) {
            return;
        }

        const judul = modal.dataset.modalTitle || 'Totools';
        const judulId = `${modal.id || 'totools'}-modal-title`;
        modal.setAttribute('aria-labelledby', judulId);
        modal.insertAdjacentHTML('afterbegin', `
            <div class="modal-bar">
                <div class="window-controls" aria-hidden="true">
                    <span class="window-dot red"></span>
                    <span class="window-dot yellow"></span>
                    <span class="window-dot green"></span>
                </div>
                <span class="modal-title" id="${judulId}">${judul}</span>
                <button class="close-button" type="button" data-action="close-modal" aria-label="Tutup">x</button>
            </div>
        `);
    });
}
