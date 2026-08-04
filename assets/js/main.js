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

function perbaruiWaktuDanSalam() {
    const elemenJam = document.getElementById('jam-desktop');
    const elemenJamMobile = document.getElementById('jam-mobile');
    const elemenSalam = document.getElementById('salam-waktu');
    const elemenTanggal = document.getElementById('tanggal-desktop');
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

    const jamAngka = sekarang.getHours();
    let salam = 'Selamat Datang 👋';
    if (jamAngka >= 3 && jamAngka < 11) {
        salam = 'Selamat Pagi ☀️';
    } else if (jamAngka >= 11 && jamAngka < 15) {
        salam = 'Selamat Siang 🌤️';
    } else if (jamAngka >= 15 && jamAngka < 18) {
        salam = 'Selamat Sore 🌅';
    } else {
        salam = 'Selamat Malam 🌙';
    }

    if (elemenSalam) {
        elemenSalam.textContent = salam;
    }

    if (elemenTanggal) {
        const opsiTanggal = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        elemenTanggal.textContent = sekarang.toLocaleDateString('id-ID', opsiTanggal);
    }
}

function initSearchFilter() {
    const desktopSearch = document.getElementById('tool-search-input');
    const startSearch = document.getElementById('start-search-input');

    function filterTools(query) {
        const q = query.toLowerCase().trim();
        const cards = document.querySelectorAll('.shortcut-area .tool-card');
        const startButtons = document.querySelectorAll('.start-menu-grid button');

        cards.forEach((card) => {
            const title = card.querySelector('.tool-title')?.textContent.toLowerCase() || '';
            const desc = card.querySelector('.tool-desc')?.textContent.toLowerCase() || '';
            const isMatch = !q || title.includes(q) || desc.includes(q);
            card.style.display = isMatch ? '' : 'none';
        });

        startButtons.forEach((btn) => {
            const text = btn.textContent.toLowerCase();
            const isMatch = !q || text.includes(q);
            btn.style.display = isMatch ? '' : 'none';
        });
    }

    if (desktopSearch) {
        desktopSearch.addEventListener('input', (e) => filterTools(e.target.value));
    }
    if (startSearch) {
        startSearch.addEventListener('input', (e) => filterTools(e.target.value));
    }

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            desktopSearch?.focus();
        }
    });
}

function initCoreEvents() {
    refreshEventToolButtons();
    bindShortcutDrag();
    bindDockSettings();
    initModalShortcuts();
    initSearchFilter();

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

    if (aktif) {
        const startSearchInput = document.getElementById('start-search-input');
        setTimeout(() => startSearchInput?.focus(), 50);
    }
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
    perbaruiWaktuDanSalam();
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
    setInterval(perbaruiWaktuDanSalam, 10000);
}

initApp();
