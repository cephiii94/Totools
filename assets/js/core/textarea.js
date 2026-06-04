import { tampilkanToast } from './toast.js';

export function initTextareaTools() {
    document.querySelectorAll('[data-action="clear-textarea"]').forEach((tombol) => {
        tombol.addEventListener('click', () => bersihkanTextarea(tombol.dataset.target));
    });
}

function bersihkanTextarea(targetId) {
    const textarea = document.getElementById(targetId);

    if (!textarea) {
        return;
    }

    textarea.value = '';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.focus();
    tampilkanToast('Teks dibersihkan.');
}
