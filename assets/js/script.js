let kotakPenyimpananKurs = null;
let modalAktif = null;
let sedangMenutupDariRiwayat = false;
let toastTimer = null;
let qrModeAktif = 'solo';
const temaTersedia = ['theme-blue', 'theme-soft', 'theme-focus'];
let indeksTema = Number(localStorage.getItem('totools-theme-index') || 0);
let fokusSebelumModal = null;

if (!Number.isInteger(indeksTema) || indeksTema < 0 || indeksTema >= temaTersedia.length) {
    indeksTema = 0;
}
const daftarTools = [
    {
        id: 'konversi',
        nama: 'Currency',
        deskripsi: 'Konversi mata uang',
        ikonClass: 'money',
        labelAkses: 'Buka konversi mata uang',
        ikonPath: 'M7 7h9.5a3.5 3.5 0 0 1 0 7H7V4m0 10h11M7 18h10'
    },
    {
        id: 'translate',
        nama: 'Translate',
        deskripsi: 'Penerjemah teks',
        ikonClass: 'translate',
        labelAkses: 'Buka penerjemah teks',
        ikonPath: 'M4 5h9M9 3v2m2 0c-.7 3.6-2.8 6.5-6 8m2.5-5c.8 1.7 2.1 3 3.9 4M14 19l3.5-8 3.5 8m-5.6-3h4.2'
    },
    {
        id: 'barcode',
        nama: 'Barcode',
        deskripsi: 'Buat barcode',
        ikonClass: 'barcode',
        labelAkses: 'Buka barcode',
        ikonPath: 'M4 7V5h2M18 5h2v2M20 17v2h-2M6 19H4v-2M7 8v8M10 8v8M14 8v8M17 8v8'
    },
    {
        id: 'qrcode',
        nama: 'QR Code',
        deskripsi: 'Buat QR Code',
        ikonClass: 'qr',
        labelAkses: 'Buka QR Code',
        ikonPath: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm11 1h2v2h-2v-2Zm3 3h2v2h-2v-2Zm-4 0h2v2h-2v-2Zm4-4h2v2h-2v-2Z'
    }
];

function buatIkon(path) {
    return `<svg viewBox="0 0 24 24" focusable="false"><path d="${path}" /></svg>`;
}

function renderTools() {
    const areaTools = document.querySelector('[data-render="tools"]');
    const areaDock = document.querySelector('[data-render="dock"]');

    if (areaTools) {
        areaTools.innerHTML = daftarTools.map((tool) => `
            <button class="tool-card" type="button" data-tool="${tool.id}">
                <span class="tool-icon ${tool.ikonClass}" aria-hidden="true">${buatIkon(tool.ikonPath)}</span>
                <span class="tool-title">${tool.nama}</span>
                <span class="tool-desc">${tool.deskripsi}</span>
            </button>
        `).join('');
    }

    if (areaDock) {
        areaDock.insertAdjacentHTML('afterbegin', daftarTools.map((tool) => `
            <button type="button" data-tool="${tool.id}" aria-label="${tool.labelAkses}">
                ${buatIkon(tool.ikonPath)}
            </button>
        `).join(''));
    }
}

function renderModalChrome() {
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

function terapkanTema() {
    const desktop = document.querySelector('.desktop');

    if (!desktop) {
        return;
    }

    desktop.classList.remove(...temaTersedia);
    desktop.classList.add(temaTersedia[indeksTema]);
}

function gantiTema() {
    indeksTema = (indeksTema + 1) % temaTersedia.length;
    localStorage.setItem('totools-theme-index', String(indeksTema));
    terapkanTema();
    tampilkanToast('Wallpaper diganti.');
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

function pasangEventUI() {
    document.querySelectorAll('[data-tool]').forEach((elemen) => {
        elemen.addEventListener('click', () => bukaAlat(elemen.dataset.tool));
        elemen.setAttribute('aria-haspopup', 'dialog');
        elemen.setAttribute('aria-expanded', 'false');
    });

    document.querySelectorAll('[data-action="close-modal"]').forEach((elemen) => {
        elemen.addEventListener('click', tutupModal);
    });

    document.querySelector('[data-action="theme"]')?.addEventListener('click', gantiTema);
    document.querySelector('[data-action="refresh-rate"]')?.addEventListener('change', ambilDataKurs);
    document.querySelectorAll('[data-action="calculate-rate"]').forEach((elemen) => {
        elemen.addEventListener('input', hitungRealTime);
        elemen.addEventListener('change', hitungRealTime);
    });
    document.querySelector('[data-action="translate"]')?.addEventListener('click', jalankanTranslateManual);
    document.querySelector('[data-action="copy-translation"]')?.addEventListener('click', salinTeks);
    document.querySelectorAll('[data-action="barcode-live"]').forEach((elemen) => {
        elemen.addEventListener('input', () => buatBarcode());
        elemen.addEventListener('change', () => buatBarcode());
    });
    document.querySelector('[data-action="generate-barcode"]')?.addEventListener('click', () => buatBarcode(true));
    document.querySelector('[data-action="download-barcode"]')?.addEventListener('click', downloadBarcode);
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
    document.querySelectorAll('[data-action="clear-textarea"]').forEach((tombol) => {
        tombol.addEventListener('click', () => bersihkanTextarea(tombol.dataset.target));
    });
}

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

function tampilkanToast(pesan) {
    const toast = document.getElementById('toast');

    if (!toast) {
        return;
    }

    toast.textContent = pesan;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2200);
}

function bukaAlat(idAlat) {
    const layarGelap = document.getElementById('layar-gelap');
    const alatYangDipilih = document.getElementById(idAlat);

    if (layarGelap) {
        layarGelap.classList.add('aktif');
    }

    if (alatYangDipilih) {
        fokusSebelumModal = document.activeElement;
        setTimeout(() => alatYangDipilih.classList.add('aktif'), 10);
        alatYangDipilih.setAttribute('aria-hidden', 'false');
        modalAktif = idAlat;
        tandaiShortcutAktif(idAlat);
        setTimeout(() => fokuskanModal(alatYangDipilih), 30);

        if (!history.state || history.state.modal !== idAlat) {
            history.pushState({ modal: idAlat }, '', window.location.href);
        }
    }

    if (idAlat === 'konversi') {
        ambilDataKurs();
    }
}

function tutupModal() {
    if (modalAktif && history.state && history.state.modal === modalAktif && !sedangMenutupDariRiwayat) {
        history.back();
        return;
    }

    const layarGelap = document.getElementById('layar-gelap');
    const semuaAlat = document.querySelectorAll('.tool-modal');

    if (layarGelap) {
        layarGelap.classList.remove('aktif');
    }

    semuaAlat.forEach((alat) => {
        alat.classList.remove('aktif');
        alat.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('.tool-card').forEach((kartu) => {
        kartu.classList.remove('is-selected');
        kartu.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.taskbar-apps button').forEach((tombol) => {
        tombol.classList.remove('is-active');
        tombol.setAttribute('aria-expanded', 'false');
    });
    modalAktif = null;

    if (fokusSebelumModal && typeof fokusSebelumModal.focus === 'function') {
        fokusSebelumModal.focus();
    }
}

window.addEventListener('popstate', () => {
    if (!modalAktif) {
        return;
    }

    sedangMenutupDariRiwayat = true;
    tutupModal();
    sedangMenutupDariRiwayat = false;
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        tutupModal();
    }

    if (event.key === 'Tab' && modalAktif) {
        jagaFokusModal(event);
        return;
    }

    if (event.altKey || event.ctrlKey || event.metaKey || event.target.matches('input, textarea, select')) {
        return;
    }

    const pintasan = {
        1: 'konversi',
        2: 'translate',
        3: 'barcode',
        4: 'qrcode'
    };

    if (pintasan[event.key]) {
        bukaAlat(pintasan[event.key]);
    }
});

function elemenFokusDalamModal(modal) {
    return Array.from(modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter((elemen) => !elemen.disabled && elemen.offsetParent !== null);
}

function fokuskanModal(modal) {
    const elemenFokus = elemenFokusDalamModal(modal);
    (elemenFokus[0] || modal).focus();
}

function jagaFokusModal(event) {
    const modal = document.getElementById(modalAktif);

    if (!modal) {
        return;
    }

    const elemenFokus = elemenFokusDalamModal(modal);

    if (!elemenFokus.length) {
        event.preventDefault();
        modal.focus();
        return;
    }

    const pertama = elemenFokus[0];
    const terakhir = elemenFokus[elemenFokus.length - 1];

    if (event.shiftKey && document.activeElement === pertama) {
        event.preventDefault();
        terakhir.focus();
    } else if (!event.shiftKey && document.activeElement === terakhir) {
        event.preventDefault();
        pertama.focus();
    }
}

perbaruiJamDesktop();
terapkanTema();
renderTools();
renderModalChrome();
pasangEventUI();
setInterval(perbaruiJamDesktop, 30000);
buatBarcode();
buatQrCode();

async function ambilDataKurs() {
    const mataUangAsal = document.getElementById('mata-uang-asal').value;
    const elemenHasil = document.getElementById('hasil-konversi');

    elemenHasil.textContent = 'Mengambil kurs terbaru...';

    try {
        const urlAPI = `https://api.exchangerate-api.com/v4/latest/${mataUangAsal}`;
        const response = await fetch(urlAPI);

        if (!response.ok) {
            throw new Error('Gagal mengambil data kurs');
        }

        const dataJSON = await response.json();
        kotakPenyimpananKurs = dataJSON.rates;
        hitungRealTime();
    } catch (error) {
        elemenHasil.textContent = 'Gagal memuat data. Cek koneksi internet Tuan.';
    }
}

function hitungRealTime() {
    if (kotakPenyimpananKurs === null) {
        return;
    }

    const mataUangAsal = document.getElementById('mata-uang-asal').value;
    const mataUangTujuan = document.getElementById('mata-uang-tujuan').value;
    const jumlahMentah = document.getElementById('jumlah-awal').value;
    const elemenHasil = document.getElementById('hasil-konversi');

    if (jumlahMentah === '' || Number(jumlahMentah) <= 0) {
        elemenHasil.textContent = 'Isi angkanya minimal 1 ya.';
        return;
    }

    const jumlah = Math.abs(Number(jumlahMentah));
    const kursTujuan = kotakPenyimpananKurs[mataUangTujuan];

    if (!kursTujuan) {
        elemenHasil.textContent = 'Kurs tujuan belum tersedia.';
        return;
    }

    const hasilAkhir = jumlah * kursTujuan;
    elemenHasil.innerHTML = `Hasil: ${jumlah.toLocaleString('id-ID')} ${mataUangAsal} = <span class="result-value">${hasilAkhir.toLocaleString('id-ID')} ${mataUangTujuan}</span>`;
}

async function jalankanTranslateManual() {
    const asal = document.getElementById('bahasa-asal').value;
    const tujuan = document.getElementById('bahasa-tujuan').value;
    const teksMasuk = document.getElementById('teks-input').value;
    const kotakHasil = document.getElementById('teks-hasil');

    if (teksMasuk.trim() === '') {
        tampilkanToast('Isi teksnya dulu sebelum diterjemahkan.');
        return;
    }

    kotakHasil.value = 'Menerjemahkan...';

    try {
        const urlAPI = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(teksMasuk)}&langpair=${asal}|${tujuan}`;
        const response = await fetch(urlAPI);

        if (!response.ok) {
            throw new Error('Gagal menerjemahkan teks');
        }

        const dataJSON = await response.json();

        if (dataJSON.responseData && dataJSON.responseData.translatedText) {
            kotakHasil.value = dataJSON.responseData.translatedText;
        } else {
            kotakHasil.value = 'Terjemahan tidak tersedia untuk teks ini.';
        }
    } catch (error) {
        kotakHasil.value = 'Koneksi internet sedang gangguan.';
    }
}

function salinTeks() {
    const kotakHasil = document.getElementById('teks-hasil');
    const tidakBisaDisalin = kotakHasil.value === ''
        || kotakHasil.value.includes('Menerjemahkan')
        || kotakHasil.value.includes('tidak tersedia')
        || kotakHasil.value.includes('gangguan');

    if (tidakBisaDisalin) {
        tampilkanToast('Belum ada hasil terjemahan yang bisa disalin.');
        return;
    }

    navigator.clipboard.writeText(kotakHasil.value)
        .then(() => tampilkanToast('Berhasil disalin.'))
        .catch(() => tampilkanToast('Gagal menyalin. Coba salin manual ya.'));
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

    const canvasUnduh = await buatQrCanvasDenganTeks(nilai, ukuran, includeText);
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

    const zip = new window.JSZip();

    for (let index = 0; index < baris.length; index += 1) {
        const teks = baris[index];
        const qrCanvas = await buatQrCanvasDenganTeks(teks, 220, includeText);
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
