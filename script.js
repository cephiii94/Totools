// ==========================================
// 1. SISTEM BUKA-TUTUP MODAL (POP-UP)
// ==========================================

function bukaAlat(idAlat) {
    let layarGelap = document.getElementById('layar-gelap');
    if (layarGelap) layarGelap.classList.add('aktif');

    let alatYangDipilih = document.getElementById(idAlat);
    if (alatYangDipilih) {
        setTimeout(() => { alatYangDipilih.classList.add('aktif'); }, 10);
        
        // Panggil API kurs hanya saat buka konversi
        if(idAlat === 'konversi'){ ambilDataKurs(); }
    }
}

function tutupModal() {
    let layarGelap = document.getElementById('layar-gelap');
    if (layarGelap) layarGelap.classList.remove('aktif');

    let semuaAlat = document.querySelectorAll('.ruang-alat');
    semuaAlat.forEach(function(alat) { alat.classList.remove('aktif'); });
}


// ==========================================
// 2. LOGIKA KONVERSI REAL-TIME & API
// ==========================================

let kotakPenyimpananKurs = null; 

async function ambilDataKurs() {
    let mataUangAsal = document.getElementById('mata-uang-asal').value;
    let elemenHasil = document.getElementById('hasil-konversi');

    elemenHasil.innerHTML = "⏳ Mengambil kurs terbaru...";

    try {
        let urlAPI = `https://api.exchangerate-api.com/v4/latest/${mataUangAsal}`;
        let response = await fetch(urlAPI);
        let dataJSON = await response.json();
        
        kotakPenyimpananKurs = dataJSON.rates; 
        hitungRealTime();

    } catch (error) {
        elemenHasil.innerHTML = "❌ Gagal memuat data. Cek internet Tuan!";
    }
}

function hitungRealTime() {
    if (kotakPenyimpananKurs === null) return; 

    let mataUangAsal = document.getElementById('mata-uang-asal').value;
    let mataUangTujuan = document.getElementById('mata-uang-tujuan').value;
    let jumlahMentah = document.getElementById('jumlah-awal').value;
    let elemenHasil = document.getElementById('hasil-konversi');

    if (jumlahMentah === '' || jumlahMentah <= 0) {
        elemenHasil.innerHTML = "Tuan, isi angkanya minimal 1 ya! 😉";
        return;
    }

    let jumlah = Math.abs(Number(jumlahMentah));
    let kursTujuan = kotakPenyimpananKurs[mataUangTujuan];
    let hasilAkhir = jumlah * kursTujuan;

    elemenHasil.innerHTML = `Hasil: ${jumlah.toLocaleString('id-ID')} ${mataUangAsal} = <br><span style="font-size:24px; color:#007BFF;">${hasilAkhir.toLocaleString('id-ID')} ${mataUangTujuan}</span>`;
}


// ==========================================
// 3. LOGIKA TRANSLATE (MANUAL & COPY)
// ==========================================

async function jalankanTranslateManual() {
    let asal = document.getElementById('bahasa-asal').value;
    let tujuan = document.getElementById('bahasa-tujuan').value;
    let teksMasuk = document.getElementById('teks-input').value;
    let kotakHasil = document.getElementById('teks-hasil');

    // Cek kalau pengguna belum ngisi teks tapi udah pencet tombol
    if (teksMasuk.trim() === '') {
        alert("Tuan, isi teksnya dulu sebelum diterjemahkan!");
        return;
    }

    kotakHasil.value = "⏳ Koki sedang memasak terjemahan...";

    try {
        // Memanggil API MyMemory
        let urlAPI = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(teksMasuk)}&langpair=${asal}|${tujuan}`;
        
        let response = await fetch(urlAPI);
        let dataJSON = await response.json();
        
        if (dataJSON.responseData && dataJSON.responseData.translatedText) {
            kotakHasil.value = dataJSON.responseData.translatedText;
        } else {
            kotakHasil.value = "❌ Waduh, Koki API bingung dengan teks ini.";
        }
    } catch (error) {
        kotakHasil.value = "❌ Koneksi internet Tuan sedang gangguan.";
    }
}

// Fitur Ekstra Bri: Tombol Copy/Salin Teks
function salinTeks() {
    let kotakHasil = document.getElementById('teks-hasil');
    
    // Pastikan ada teksnya sebelum disalin
    if (kotakHasil.value === '' || kotakHasil.value.includes("⏳") || kotakHasil.value.includes("❌")) {
        alert("Belum ada hasil terjemahan yang bisa disalin, Tuan!");
        return;
    }

    // Perintah sakti untuk menyalin teks ke memori HP
    navigator.clipboard.writeText(kotakHasil.value).then(() => {
        alert("✅ Berhasil disalin! Tinggal Paste di WhatsApp.");
    }).catch(err => {
        alert("❌ Gagal menyalin. Coba block teksnya manual ya Tuan.");
    });
}
