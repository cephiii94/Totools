import { getDockTools, bindDockSettings } from './core/dock.js';
import { initModalShortcuts, refreshEventToolButtons, bukaAlat, tutupModal } from './core/modal.js';
import { renderModalChrome, renderTools } from './core/render.js';
import { initDragReorder, bindShortcutDrag } from './core/reorder.js';
import { gantiTema, resetTema, setTemaDariSelect, terapkanTema } from './core/theme.js';
import { initTextareaTools } from './core/textarea.js';
import { initBarcode } from './tools/barcode.js';
import { initCurrency } from './tools/currency.js';
import { initQrCode } from './tools/qrcode.js';
import { initTranslator } from './tools/translator.js';
import { initWordCounter } from './tools/word-counter.js';
import { initCollage } from './tools/collage.js';

window.TOTOOLS_MODULE_BOOTED = true;

function perbaruiJamDesktop() {
    const elemenJam = document.getElementById('jam-desktop');
    const elemenJamMobile = document.getElementById('jam-mobile');
    const sekarang = new Date();
    const jam = sekarang.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });

    if (elemenJam) {
        elemenJam.textContent = jam;
    }

    if (elemenJamMobile) {
        elemenJamMobile.textContent = jam;
    }
}

function initCoreEvents() {
    refreshEventToolButtons();
    bindShortcutDrag();
    bindDockSettings();
    initModalShortcuts();

    document.querySelectorAll('[data-action="close-modal"]').forEach((elemen) => {
        elemen.addEventListener('click', tutupModal);
    });

    document.querySelector('[data-action="theme"]')?.addEventListener('click', gantiTema);
    document.querySelector('[data-action="toggle-start"]')?.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleStartMenu();
    });
    document.querySelector('[data-action="set-theme"]')?.addEventListener('change', (event) => setTemaDariSelect(event.target.value));
    document.querySelector('[data-action="reset-theme"]')?.addEventListener('click', resetTema);

    document.addEventListener('keydown', (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.target.matches('input, textarea, select')) {
            return;
        }

        const pintasan = {
            1: 'konversi',
            2: 'translate',
            3: 'barcode',
            4: 'qrcode',
            5: 'settings',
            6: 'wordcounter',
            7: 'collage'
        };

        if (pintasan[event.key]) {
            bukaAlat(pintasan[event.key]);
        }
    });
}

function toggleStartMenu() {
    const startMenu = document.getElementById('start-menu');

    if (!startMenu) {
        return;
    }

    const aktif = startMenu.classList.toggle('aktif');
    startMenu.setAttribute('aria-hidden', String(!aktif));
}

document.addEventListener('click', (event) => {
    const startMenu = document.getElementById('start-menu');
    const startButton = document.querySelector('[data-action="toggle-start"]');

    if (!startMenu || !startMenu.classList.contains('aktif')) {
        return;
    }

    if (!startMenu.contains(event.target) && !startButton?.contains(event.target)) {
        startMenu.classList.remove('aktif');
        startMenu.setAttribute('aria-hidden', 'true');
    }
});

window.addEventListener('totools:tool-opened', () => {
    const startMenu = document.getElementById('start-menu');

    if (!startMenu) {
        return;
    }

    startMenu.classList.remove('aktif');
    startMenu.setAttribute('aria-hidden', 'true');
});

function initApp() {
    perbaruiJamDesktop();
    terapkanTema();
    renderTools(getDockTools());
    renderModalChrome();
    initCoreEvents();
    initTextareaTools();
    initDragReorder();
    initCurrency();
    initTranslator();
    initBarcode();
    initQrCode();
    initWordCounter();
    initCollage();
    setInterval(perbaruiJamDesktop, 30000);
}

initApp();
