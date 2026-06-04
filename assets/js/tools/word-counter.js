export function initWordCounter() {
    document.querySelector('[data-action="word-live"]')?.addEventListener('input', hitungKata);
    hitungKata();
}

export function hitungKata() {
    const teks = document.getElementById('word-input')?.value || '';
    const teksTrim = teks.trim();
    const kata = teksTrim ? teksTrim.match(/\S+/g) || [] : [];
    const kalimat = teksTrim ? teksTrim.split(/[.!?]+/).map((item) => item.trim()).filter(Boolean) : [];
    const paragraf = teksTrim ? teksTrim.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean) : [];
    const menit = kata.length ? Math.max(1, Math.ceil(kata.length / 200)) : 0;

    setTeksStat('word-count', kata.length);
    setTeksStat('char-count', teks.length);
    setTeksStat('sentence-count', kalimat.length);
    setTeksStat('paragraph-count', paragraf.length);
    setTeksStat('reading-time', `${menit}m`);
}

function setTeksStat(id, nilai) {
    const elemen = document.getElementById(id);

    if (elemen) {
        elemen.textContent = String(nilai);
    }
}
