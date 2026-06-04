import { tampilkanToast } from './toast.js';

const temaTersedia = ['theme-blue', 'theme-soft', 'theme-focus'];
let indeksTema = Number(localStorage.getItem('totools-theme-index') || 0);

if (!Number.isInteger(indeksTema) || indeksTema < 0 || indeksTema >= temaTersedia.length) {
    indeksTema = 0;
}

export function terapkanTema() {
    const desktop = document.querySelector('.desktop');
    const themeSelect = document.getElementById('theme-select');

    if (!desktop) {
        return;
    }

    desktop.classList.remove(...temaTersedia);
    desktop.classList.add(temaTersedia[indeksTema]);

    if (themeSelect) {
        themeSelect.value = String(indeksTema);
    }
}

export function gantiTema() {
    indeksTema = (indeksTema + 1) % temaTersedia.length;
    localStorage.setItem('totools-theme-index', String(indeksTema));
    terapkanTema();
    tampilkanToast('Wallpaper diganti.');
}

export function setTemaDariSelect(nilai) {
    indeksTema = Number(nilai);
    if (!Number.isInteger(indeksTema) || indeksTema < 0 || indeksTema >= temaTersedia.length) {
        indeksTema = 0;
    }
    localStorage.setItem('totools-theme-index', String(indeksTema));
    terapkanTema();
    tampilkanToast('Theme diterapkan.');
}

export function resetTema() {
    indeksTema = 0;
    localStorage.setItem('totools-theme-index', String(indeksTema));
    terapkanTema();
    tampilkanToast('Theme direset.');
}
