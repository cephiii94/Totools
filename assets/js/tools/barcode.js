import { tampilkanToast } from '../core/toast.js';

export function initBarcode() {
    document.querySelectorAll('[data-action="barcode-live"]').forEach((elemen) => {
        elemen.addEventListener('input', () => buatBarcode());
        elemen.addEventListener('change', () => buatBarcode());
    });
    document.querySelector('[data-action="generate-barcode"]')?.addEventListener('click', () => buatBarcode(true));
    document.querySelector('[data-action="download-barcode"]')?.addEventListener('click', downloadBarcode);
    buatBarcode();
}

function buatBarcode(tampilkanPesan = false) {
    const nilai = document.getElementById('barcode-value')?.value.trim();
    const format = document.getElementById('barcode-format')?.value;
    const output = document.getElementById('barcode-output');

    if (!output) {
        return;
    }

    if (!window.JsBarcode) {
        output.innerHTML = '';
        if (tampilkanPesan) {
            tampilkanToast('Library barcode belum termuat.');
        }
        return;
    }

    if (!nilai) {
        output.innerHTML = '';
        if (tampilkanPesan) {
            tampilkanToast('Isi barcode dulu.');
        }
        return;
    }

    try {
        window.JsBarcode(output, nilai, {
            format,
            lineColor: '#0f172a',
            width: 2,
            height: 86,
            displayValue: true,
            font: 'Inter',
            fontSize: 15,
            margin: 12
        });
    } catch (error) {
        output.innerHTML = '';
        if (tampilkanPesan) {
            tampilkanToast('Format barcode tidak cocok dengan isi.');
        }
    }
}

function downloadBarcode() {
    const output = document.getElementById('barcode-output');
    const nilai = document.getElementById('barcode-value')?.value.trim() || 'barcode';

    if (!output || !output.innerHTML.trim()) {
        tampilkanToast('Buat barcode dulu sebelum download.');
        return;
    }

    const serializer = new XMLSerializer();
    const svgText = serializer.serializeToString(output);
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${nilai.replace(/[^a-z0-9_-]+/gi, '-') || 'barcode'}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    tampilkanToast('Barcode diunduh.');
}
