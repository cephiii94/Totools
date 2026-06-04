# Totools

Kumpulan tools ringan berbasis HTML, CSS, dan JavaScript vanilla.

## Struktur

```text
Totools/
├── index.html
├── Index-1.html
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js
│       ├── core/
│       ├── data/
│       └── tools/
└── README.md
```

## Tools saat ini

- Konversi mata uang
- Penerjemah teks
- Barcode generator
- QR Code generator
- Word Counter

## Cara pakai

Upload folder ini ke hosting statis seperti GitHub Pages, Netlify, atau Vercel static hosting.

Karena JavaScript memakai ES modules, jalankan melalui server lokal saat development. Contoh:

```bash
python -m http.server 4173
```

## Catatan dependency

Beberapa tool memakai CDN:

- JsBarcode untuk barcode
- QRCode.js untuk QR Code
- JSZip untuk download batch QR sebagai ZIP

## Dukungan offline ringan

Barcode, QR Code, dan download batch QR akan mencari library lokal lebih dulu di `assets/vendor/`:

- `assets/vendor/jsbarcode.all.min.js`
- `assets/vendor/qrcode.min.js`
- `assets/vendor/jszip.min.js`

Kalau file lokal belum ada, aplikasi otomatis mencoba CDN. Saat internet mati dan library belum termuat, area preview menampilkan status yang jelas agar pengguna tahu penyebab tool belum bisa dipakai.
