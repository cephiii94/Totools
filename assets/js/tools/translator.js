import { tampilkanToast } from '../core/toast.js';

export function initTranslator() {
    document.querySelector('[data-action="translate"]')?.addEventListener('click', jalankanTranslateManual);
    document.querySelector('[data-action="copy-translation"]')?.addEventListener('click', salinTeks);
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
