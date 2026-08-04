const daftarToolsDasar = [
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
    },
    {
        id: 'settings',
        nama: 'Settings',
        deskripsi: 'Atur tampilan',
        ikonClass: 'settings',
        labelAkses: 'Buka settings',
        ikonPath: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2m8.7-13-1.7 1M5 17l-1.7 1M21 12h-2M5 12H3m15.7 6.7-1.7-1M5 7 3.3 5.3'
    },
    {
        id: 'wordcounter',
        nama: 'Word Count',
        deskripsi: 'Hitung kata',
        ikonClass: 'word',
        labelAkses: 'Buka word counter',
        ikonPath: 'M5 5h14M5 9h14M5 13h9M5 17h6'
    },
    {
        id: 'collage',
        nama: 'Collage',
        deskripsi: 'Kolase gambar',
        ikonClass: 'collage',
        labelAkses: 'Buka image collage',
        ikonPath: 'M3 3h8v8H3V3Zm0 10h8v8H3v-8Zm10-10h8v8h-8V3Zm0 10h4v4h-4v-4Zm4 4h4v4h-4v-4Zm-4 4h4v4h-4v-4Z'
    }
];

export function getUrutanTool() {
    const urutanDefault = daftarToolsDasar.map((tool) => tool.id);

    try {
        const tersimpan = JSON.parse(localStorage.getItem('totools-tool-order') || JSON.stringify(urutanDefault));
        if (!Array.isArray(tersimpan)) {
            return urutanDefault;
        }

        return [
            ...tersimpan.filter((id) => urutanDefault.includes(id)),
            ...urutanDefault.filter((id) => !tersimpan.includes(id))
        ];
    } catch (error) {
        return urutanDefault;
    }
}

export function simpanUrutanTool(urutan) {
    localStorage.setItem('totools-tool-order', JSON.stringify(urutan));
}

export function getDaftarTools() {
    const urutan = getUrutanTool();
    return [...daftarToolsDasar].sort((a, b) => urutan.indexOf(a.id) - urutan.indexOf(b.id));
}

export const daftarTools = getDaftarTools();
