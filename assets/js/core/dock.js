import { renderTools } from './render.js';
import { tampilkanToast } from './toast.js';
import { getModalAktif, refreshEventToolButtons } from './modal.js';

let dockTools = bacaDockTools();

if (!Array.isArray(dockTools)) {
    dockTools = ['konversi', 'translate', 'barcode'];
}

function bacaDockTools() {
    try {
        const tersimpan = JSON.parse(localStorage.getItem('totools-dock-tools') || '["konversi","translate","barcode"]');
        return Array.isArray(tersimpan) ? tersimpan : ['konversi', 'translate', 'barcode'];
    } catch (error) {
        return ['konversi', 'translate', 'barcode'];
    }
}

export function getDockTools() {
    return dockTools;
}

export function toggleDockTool(idTool, aktif) {
    if (aktif && !dockTools.includes(idTool)) {
        dockTools.push(idTool);
    }

    if (!aktif) {
        dockTools = dockTools.filter((id) => id !== idTool);
    }

    localStorage.setItem('totools-dock-tools', JSON.stringify(dockTools));
    renderTools(dockTools);
    refreshEventToolButtons();
    tandaiShortcutAktif(getModalAktif());
    bindDockSettings();
    window.dispatchEvent(new Event('totools:tools-rendered'));
    tampilkanToast('Dock diperbarui.');
}

export function bindDockSettings() {
    document.querySelectorAll('[data-action="toggle-dock-tool"]').forEach((checkbox) => {
        if (checkbox.dataset.boundDockSetting === 'true') {
            return;
        }

        checkbox.addEventListener('change', () => toggleDockTool(checkbox.value, checkbox.checked));
        checkbox.dataset.boundDockSetting = 'true';
    });

    document.querySelectorAll('[data-action="toggle-desktop-tool"]').forEach((checkbox) => {
        if (checkbox.dataset.boundDesktopSetting === 'true') {
            return;
        }

        checkbox.addEventListener('change', () => toggleDesktopTool(checkbox.value, checkbox.checked));
        checkbox.dataset.boundDesktopSetting = 'true';
    });
}

function bacaDesktopTools() {
    try {
        const semuaTool = Array.from(document.querySelectorAll('[data-action="toggle-desktop-tool"]')).map((checkbox) => checkbox.value);
        const fallback = semuaTool.length ? semuaTool : ['konversi', 'translate', 'barcode', 'qrcode', 'settings', 'wordcounter'];
        const tersimpan = JSON.parse(localStorage.getItem('totools-desktop-tools') || JSON.stringify(fallback));
        return Array.isArray(tersimpan) ? tersimpan : fallback;
    } catch (error) {
        return ['konversi', 'translate', 'barcode', 'qrcode', 'settings', 'wordcounter'];
    }
}

function toggleDesktopTool(idTool, aktif) {
    let desktopTools = bacaDesktopTools();

    if (aktif && !desktopTools.includes(idTool)) {
        desktopTools.push(idTool);
    }

    if (!aktif) {
        desktopTools = desktopTools.filter((id) => id !== idTool);
    }

    localStorage.setItem('totools-desktop-tools', JSON.stringify(desktopTools));
    renderTools(dockTools);
    refreshEventToolButtons();
    tandaiShortcutAktif(getModalAktif());
    bindDockSettings();
    window.dispatchEvent(new Event('totools:tools-rendered'));
    tampilkanToast('Desktop apps diperbarui.');
}

function tandaiShortcutAktif(idAlat) {
    document.querySelectorAll('.tool-card').forEach((kartu) => {
        const cocok = kartu.dataset.tool === idAlat;
        kartu.classList.toggle('is-selected', Boolean(cocok));
        kartu.setAttribute('aria-expanded', String(cocok));
    });

    document.querySelectorAll('.taskbar-apps button[data-tool]').forEach((tombol) => {
        tombol.classList.toggle('is-active', tombol.dataset.tool === idAlat);
        tombol.setAttribute('aria-expanded', String(tombol.dataset.tool === idAlat));
    });
}
