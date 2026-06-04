import { tampilkanToast } from '../core/toast.js';

let qrModeAktif = 'solo';

export function initQrCode() {
    document.querySelectorAll('[data-action="qr-live"]').forEach((elemen) => {
        elemen.addEventListener('input', () => buatQrCode());
        elemen.addEventListener('change', () => buatQrCode());
    });
    document.querySelectorAll('[data-qr-tab]').forEach((tab) => {
        tab.addEventListener('click', () => gantiTabQr(tab.dataset.qrTab));
    });
    document.querySelector('[data-action="generate-qr"]')?.addEventListener('click', () => buatQrCode(true));
    document.querySelector('[data-action="download-qr"]')?.addEventListener('click', downloadQrCode);
    document.querySelector('[data-action="download-qr-batch"]')?.addEventListener('click', downloadQrBatch);
    buatQrCode();
}

function gantiTabQr(mode) {
    qrModeAktif = mode === 'batch' ? 'batch' : 'solo';
    document.querySelectorAll('[data-qr-tab]').forEach((tab) => {
        tab.classList.toggle('is-active', tab.dataset.qrTab === qrModeAktif);
    });
    document.querySelectorAll('.qr-panel').forEach((panel) => {
        panel.classList.toggle('is-active', panel.id === `qr-panel-${qrModeAktif}`);
    });
    buatQrCode();
}

function ambilBarisQrBatch() {
    return (document.getElementById('qr-batch-value')?.value || '')
        .split('\n')
        .map((baris) => baris.trim())
        .filter(Boolean);
}

function renderQr(target, teks, ukuran) {
    target.innerHTML = '';
    new window.QRCode(target, {
        text: teks,
        width: ukuran,
        height: ukuran,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.H
    });
}

function buatQrCode(tampilkanPesan = false) {
    const nilai = document.getElementById('qr-value')?.value.trim();
    const ukuran = Number(document.getElementById('qr-size')?.value || 220);
    const output = document.getElementById('qr-output');
    const caption = document.getElementById('qr-caption');
    const outputBatch = document.getElementById('qr-batch-output');
    const includeText = document.getElementById('qr-include-text')?.checked ?? true;

    if (!output || !outputBatch) {
        return;
    }

    output.innerHTML = '';
    outputBatch.innerHTML = '';
    if (caption) {
        caption.textContent = '';
        caption.hidden = !includeText;
    }

    if (!window.QRCode) {
        if (tampilkanPesan) {
            tampilkanToast('Library QR Code belum termuat.');
        }
        return;
    }

    if (qrModeAktif === 'batch') {
        const baris = ambilBarisQrBatch();

        if (!baris.length) {
            if (tampilkanPesan) {
                tampilkanToast('Isi batch QR Code dulu.');
            }
            return;
        }

        baris.slice(0, 24).forEach((teks, index) => {
            const item = document.createElement('div');
            const kotakQr = document.createElement('div');
            item.className = 'qr-batch-item';
            item.appendChild(kotakQr);
            renderQr(kotakQr, teks, 112);

            if (includeText) {
                const label = document.createElement('p');
                label.textContent = teks;
                item.appendChild(label);
            }

            item.dataset.qrText = teks;
            item.dataset.qrIndex = String(index + 1);
            outputBatch.appendChild(item);
        });
        return;
    }

    if (!nilai) {
        if (tampilkanPesan) {
            tampilkanToast('Isi QR Code dulu.');
        }
        return;
    }

    renderQr(output, nilai, ukuran);
    if (caption && includeText) {
        caption.textContent = nilai;
    }
}

async function buatQrCanvasDenganTeks(teks, ukuran, includeText) {
    const pembungkus = document.createElement('div');
    pembungkus.style.position = 'fixed';
    pembungkus.style.left = '-9999px';
    document.body.appendChild(pembungkus);
    renderQr(pembungkus, teks, ukuran);
    const sumberCanvas = pembungkus.querySelector('canvas');

    if (!sumberCanvas) {
        pembungkus.remove();
        throw new Error('QR canvas tidak tersedia');
    }

    const canvas = document.createElement('canvas');
    const padding = 18;
    const tinggiTeks = includeText ? 44 : 0;
    canvas.width = ukuran + padding * 2;
    canvas.height = ukuran + padding * 2 + tinggiTeks;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(sumberCanvas, padding, padding, ukuran, ukuran);

    if (includeText) {
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 14px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        wrapCanvasText(ctx, teks, canvas.width / 2, ukuran + padding + 22, canvas.width - 24, 18, 2);
    }

    pembungkus.remove();
    return canvas;
}

function wrapCanvasText(ctx, teks, x, y, maxWidth, lineHeight, maxLines) {
    const kata = teks.split(/\s+/);
    const baris = [];
    let barisAktif = '';

    kata.forEach((kataAktif) => {
        const kandidat = barisAktif ? `${barisAktif} ${kataAktif}` : kataAktif;
        if (ctx.measureText(kandidat).width <= maxWidth) {
            barisAktif = kandidat;
        } else {
            if (barisAktif) {
                baris.push(barisAktif);
            }
            barisAktif = kataAktif;
        }
    });

    if (barisAktif) {
        baris.push(barisAktif);
    }

    baris.slice(0, maxLines).forEach((barisTeks, index) => {
        const teksAkhir = index === maxLines - 1 && baris.length > maxLines ? `${barisTeks.slice(0, 26)}...` : barisTeks;
        ctx.fillText(teksAkhir, x, y + index * lineHeight);
    });
}

async function downloadQrCode() {
    const nilai = document.getElementById('qr-value')?.value.trim() || 'qrcode';
    const ukuran = Number(document.getElementById('qr-size')?.value || 220);
    const includeText = document.getElementById('qr-include-text')?.checked ?? true;
    const output = document.getElementById('qr-output');
    const canvas = output?.querySelector('canvas');

    if (!canvas) {
        tampilkanToast('Buat QR Code dulu sebelum download.');
        return;
    }

    let canvasUnduh;

    try {
        canvasUnduh = await buatQrCanvasDenganTeks(nilai, ukuran, includeText);
    } catch (error) {
        tampilkanToast('QR Code belum siap dibuat.');
        return;
    }

    const link = document.createElement('a');
    link.href = canvasUnduh.toDataURL('image/png');
    link.download = `${nilai.replace(/[^a-z0-9_-]+/gi, '-') || 'qrcode'}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    tampilkanToast('QR Code diunduh.');
}

async function downloadQrBatch() {
    const baris = ambilBarisQrBatch().slice(0, 24);
    const includeText = document.getElementById('qr-include-text')?.checked ?? true;

    if (!baris.length) {
        tampilkanToast('Buat batch QR Code dulu sebelum download.');
        return;
    }

    if (!window.JSZip) {
        tampilkanToast('Library ZIP belum termuat.');
        return;
    }

    if (!window.QRCode) {
        tampilkanToast('Library QR Code belum termuat.');
        return;
    }

    const zip = new window.JSZip();

    for (let index = 0; index < baris.length; index += 1) {
        const teks = baris[index];
        let qrCanvas;

        try {
            qrCanvas = await buatQrCanvasDenganTeks(teks, 220, includeText);
        } catch (error) {
            tampilkanToast('Sebagian QR Code belum siap dibuat.');
            return;
        }

        const dataUrl = qrCanvas.toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];
        const namaFile = `${String(index + 1).padStart(2, '0')}-${teks.replace(/[^a-z0-9_-]+/gi, '-').slice(0, 42) || 'qrcode'}.png`;
        zip.file(namaFile, base64, { base64: true });
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qr-code-batch.zip';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    tampilkanToast('ZIP QR Code diunduh.');
}
