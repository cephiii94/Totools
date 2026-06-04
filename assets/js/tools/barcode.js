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

function aturStatusBarcode(teks = '') {
    const status = document.getElementById('barcode-status');
    if (!status) {
        return;
    }

    status.textContent = teks;
    status.hidden = !teks;
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
        aturStatusBarcode('Library barcode belum termuat. Simpan JsBarcode lokal di assets/vendor/jsbarcode.all.min.js atau coba saat internet aktif.');
        if (tampilkanPesan) {
            tampilkanToast('Library barcode belum termuat.');
        }
        return;
    }

    if (!nilai) {
        output.innerHTML = '';
        aturStatusBarcode('');
        if (tampilkanPesan) {
            tampilkanToast('Isi barcode dulu.');
        }
        return;
    }

    try {
        aturStatusBarcode('');
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
        aturStatusBarcode('Format barcode tidak cocok dengan isi yang dimasukkan.');
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
