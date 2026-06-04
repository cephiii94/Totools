let kotakPenyimpananKurs = null;

export function initCurrency() {
    document.querySelector('[data-action="refresh-rate"]')?.addEventListener('change', ambilDataKurs);
    document.querySelectorAll('[data-action="calculate-rate"]').forEach((elemen) => {
        elemen.addEventListener('input', hitungRealTime);
        elemen.addEventListener('change', hitungRealTime);
    });

    window.addEventListener('totools:tool-opened', (event) => {
        if (event.detail.id === 'konversi') {
            ambilDataKurs();
        }
    });
}

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
