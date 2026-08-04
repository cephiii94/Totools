(function () {
    var temaTersedia = ['theme-blue', 'theme-soft', 'theme-focus'];
    var indeksTema = Number(localStorage.getItem('totools-theme-index') || 0);
    var daftarTools = [
        {
            id: 'konversi',
            nama: 'Currency',
            labelAkses: 'Buka konversi mata uang',
            ikonClass: 'money',
            ikonPath: 'M7 7h9.5a3.5 3.5 0 0 1 0 7H7V4m0 10h11M7 18h10'
        },
        {
            id: 'translate',
            nama: 'Translate',
            labelAkses: 'Buka penerjemah teks',
            ikonClass: 'translate',
            ikonPath: 'M4 5h9M9 3v2m2 0c-.7 3.6-2.8 6.5-6 8m2.5-5c.8 1.7 2.1 3 3.9 4M14 19l3.5-8 3.5 8m-5.6-3h4.2'
        },
        {
            id: 'barcode',
            nama: 'Barcode',
            labelAkses: 'Buka barcode',
            ikonClass: 'barcode',
            ikonPath: 'M4 7V5h2M18 5h2v2M20 17v2h-2M6 19H4v-2M7 8v8M10 8v8M14 8v8M17 8v8'
        },
        {
            id: 'qrcode',
            nama: 'QR Code',
            labelAkses: 'Buka QR Code',
            ikonClass: 'qr',
            ikonPath: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm11 1h2v2h-2v-2Zm3 3h2v2h-2v-2Zm-4 0h2v2h-2v-2Zm4-4h2v2h-2v-2Z'
        },
        {
            id: 'settings',
            nama: 'Settings',
            labelAkses: 'Buka settings',
            ikonClass: 'settings',
            ikonPath: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2m8.7-13-1.7 1M5 17l-1.7 1M21 12h-2M5 12H3m15.7 6.7-1.7-1M5 7 3.3 5.3'
        },
        {
            id: 'wordcounter',
            nama: 'Word Count',
            labelAkses: 'Buka word counter',
            ikonClass: 'word',
            ikonPath: 'M5 5h14M5 9h14M5 13h9M5 17h6'
        },
        {
            id: 'collage',
            nama: 'Collage',
            labelAkses: 'Buka image collage',
            ikonClass: 'collage',
            ikonPath: 'M3 3h8v8H3V3Zm0 10h8v8H3v-8Zm10-10h8v8h-8V3Zm0 10h4v4h-4v-4Zm4 4h4v4h-4v-4Zm-4 4h4v4h-4v-4Z'
        }
    ];
    var dockTools = bacaDockToolsFallback();
    var desktopTools = bacaDesktopToolsFallback();
    var posisiIkon = bacaPosisiIkonFallback();
    var layoutMode = bacaLayoutModeFallback();
    var dragId = null;
    var dragState = null;

    if (!Number.isInteger(indeksTema) || indeksTema < 0 || indeksTema >= temaTersedia.length) {
        indeksTema = 0;
    }

    function bacaDockToolsFallback() {
        try {
            var tersimpan = JSON.parse(localStorage.getItem('totools-dock-tools') || '["konversi","translate","barcode"]');
            return Array.isArray(tersimpan) ? tersimpan : ['konversi', 'translate', 'barcode'];
        } catch (error) {
            return ['konversi', 'translate', 'barcode'];
        }
    }

    function bacaDesktopToolsFallback() {
        try {
            var semuaTool = daftarTools.map(function (tool) {
                return tool.id;
            });
            var tersimpan = JSON.parse(localStorage.getItem('totools-desktop-tools') || JSON.stringify(semuaTool));
            return Array.isArray(tersimpan) ? tersimpan : semuaTool;
        } catch (error) {
            return daftarTools.map(function (tool) {
                return tool.id;
            });
        }
    }

    function bacaUrutanToolFallback() {
        var urutanDefault = daftarTools.map(function (tool) {
            return tool.id;
        });

        try {
            var tersimpan = JSON.parse(localStorage.getItem('totools-tool-order') || JSON.stringify(urutanDefault));
            if (!Array.isArray(tersimpan)) {
                return urutanDefault;
            }
            return tersimpan.filter(function (id) {
                return urutanDefault.includes(id);
            }).concat(urutanDefault.filter(function (id) {
                return !tersimpan.includes(id);
            }));
        } catch (error) {
            return urutanDefault;
        }
    }

    function getDaftarToolsFallback() {
        var urutan = bacaUrutanToolFallback();
        return daftarTools.slice().sort(function (a, b) {
            return urutan.indexOf(a.id) - urutan.indexOf(b.id);
        });
    }

    function bacaPosisiIkonFallback() {
        try {
            var tersimpan = JSON.parse(localStorage.getItem('totools-icon-positions') || '{}');
            return tersimpan && typeof tersimpan === 'object' ? tersimpan : {};
        } catch (error) {
            return {};
        }
    }

    function bacaLayoutModeFallback() {
        var mode = localStorage.getItem('totools-desktop-layout-mode') || 'grid';
        return ['reorder', 'free', 'grid'].includes(mode) ? mode : 'grid';
    }

    function buatIkonFallback(path) {
        return '<svg viewBox="0 0 24 24" focusable="false"><path d="' + path + '" /></svg>';
    }

    function renderDockFallback() {
        var areaDock = document.querySelector('[data-render="dock"]');
        var themeButton = areaDock?.querySelector('[data-action="theme"]');

        if (!areaDock) {
            return;
        }

        areaDock.querySelectorAll('[data-tool]').forEach(function (button) {
            button.remove();
        });

        getDaftarToolsFallback()
            .filter(function (tool) {
                return dockTools.includes(tool.id);
            })
            .forEach(function (tool) {
                var button = document.createElement('button');
                button.type = 'button';
                button.dataset.tool = tool.id;
                button.setAttribute('aria-label', tool.labelAkses);
                button.innerHTML = buatIkonFallback(tool.ikonPath);
                button.addEventListener('click', function () {
                    bukaModal(tool.id);
                });
                areaDock.insertBefore(button, themeButton || null);
            });
    }

    function renderDockSettingsFallback() {
        var areaDockSettings = document.querySelector('[data-render="dock-settings"]');

        if (!areaDockSettings) {
            return;
        }

        areaDockSettings.innerHTML = getDaftarToolsFallback().map(function (tool) {
            return '<label class="dock-setting-item">' +
                '<span>' + tool.nama + '</span>' +
                '<input type="checkbox" value="' + tool.id + '" data-action="toggle-dock-tool" ' + (dockTools.includes(tool.id) ? 'checked' : '') + '>' +
            '</label>';
        }).join('');

        areaDockSettings.querySelectorAll('[data-action="toggle-dock-tool"]').forEach(function (checkbox) {
            checkbox.addEventListener('change', function () {
                toggleDockToolFallback(checkbox.value, checkbox.checked);
            });
        });
    }

    function renderDesktopAppsFallback() {
        var areaTools = document.querySelector('[data-render="tools"]');

        if (!areaTools) {
            return;
        }

        areaTools.querySelectorAll('[data-tool]').forEach(function (button) {
            button.remove();
        });

        getDaftarToolsFallback()
            .filter(function (tool) {
                return desktopTools.includes(tool.id);
            })
            .forEach(function (tool, index) {
                var button = document.createElement('button');
                button.className = 'tool-card';
                button.type = 'button';
                button.dataset.tool = tool.id;
                button.innerHTML = '<span class="tool-icon ' + tool.ikonClass + '" aria-hidden="true">' + buatIkonFallback(tool.ikonPath) + '</span>' +
                    '<span class="tool-title">' + tool.nama + '</span>';
                button.addEventListener('click', function () {
                    bukaModal(tool.id);
                });
                areaTools.appendChild(button);
            });
        bindDragFallback();
    }

    function renderDesktopSettingsFallback() {
        var areaDesktopSettings = document.querySelector('[data-render="desktop-settings"]');

        if (!areaDesktopSettings) {
            return;
        }

        areaDesktopSettings.innerHTML = getDaftarToolsFallback().map(function (tool) {
            return '<label class="dock-setting-item">' +
                '<span>' + tool.nama + '</span>' +
                '<input type="checkbox" value="' + tool.id + '" data-action="toggle-desktop-tool" ' + (desktopTools.includes(tool.id) ? 'checked' : '') + '>' +
            '</label>';
        }).join('');

        areaDesktopSettings.querySelectorAll('[data-action="toggle-desktop-tool"]').forEach(function (checkbox) {
            checkbox.addEventListener('change', function () {
                toggleDesktopToolFallback(checkbox.value, checkbox.checked);
            });
        });
    }

    function bindDragFallback() {
        document.querySelectorAll('.shortcut-area .tool-card').forEach(function (kartu) {
            var id = kartu.dataset.tool;
            var index = Array.prototype.indexOf.call(kartu.parentElement.children, kartu);
            var posisi = layoutMode === 'reorder' ? posisiDefaultFallback(index) : posisiIkon[id] || posisiDefaultFallback(index);
            terapkanPosisiFallback(kartu, posisi.x, posisi.y);

            if (kartu.dataset.boundDragFallback === 'true') {
                return;
            }

            kartu.addEventListener('pointerdown', mulaiDragFallback);
            kartu.addEventListener('click', cegahKlikSetelahDragFallback, true);
            kartu.dataset.boundDragFallback = 'true';
        });
    }

    function mulaiDragFallback(event) {
        if (window.innerWidth <= 720 || event.button !== 0) {
            return;
        }

        var kartu = event.currentTarget;
        var area = document.querySelector('.shortcut-area');
        var cardRect = kartu.getBoundingClientRect();
        var areaRect = area.getBoundingClientRect();
        dragState = {
            kartu: kartu,
            id: kartu.dataset.tool,
            area: area,
            areaRect: areaRect,
            startX: event.clientX,
            startY: event.clientY,
            offsetX: event.clientX - cardRect.left,
            offsetY: event.clientY - cardRect.top,
            moved: false
        };
        kartu.setPointerCapture(event.pointerId);
        kartu.classList.add('is-dragging');
        kartu.addEventListener('pointermove', dragBerjalanFallback);
        kartu.addEventListener('pointerup', selesaiDragFallback, { once: true });
        kartu.addEventListener('pointercancel', selesaiDragFallback, { once: true });
    }

    function dragBerjalanFallback(event) {
        if (!dragState) {
            return;
        }

        var delta = Math.abs(event.clientX - dragState.startX) + Math.abs(event.clientY - dragState.startY);
        if (delta > 6) {
            dragState.moved = true;
        }

        if (!dragState.moved) {
            return;
        }

        var x = event.clientX - dragState.areaRect.left - dragState.offsetX;
        var y = event.clientY - dragState.areaRect.top - dragState.offsetY;
        var posisi = batasiPosisiFallback(x, y, dragState.kartu, dragState.area);
        terapkanPosisiFallback(dragState.kartu, posisi.x, posisi.y);
    }

    function selesaiDragFallback(event) {
        if (!dragState) {
            return;
        }

        var kartu = dragState.kartu;
        kartu.classList.remove('is-dragging');
        kartu.removeEventListener('pointermove', dragBerjalanFallback);

        if (dragState.moved) {
            var x = Number.parseFloat(kartu.style.left) || 0;
            var y = Number.parseFloat(kartu.style.top) || 0;

            if (layoutMode === 'reorder') {
                var pointerEventsAwal = kartu.style.pointerEvents;
                kartu.style.pointerEvents = 'none';
                var target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.shortcut-area .tool-card');
                kartu.style.pointerEvents = pointerEventsAwal;

                if (target && target !== kartu) {
                    pindahUrutanFallback(kartu.dataset.tool, target.dataset.tool);
                } else {
                    renderDesktopAppsFallback();
                }
            } else {
                if (layoutMode === 'grid') {
                    var snap = snapPosisiKosongFallback(x, y, kartu, dragState.area);
                    x = snap.x;
                    y = snap.y;
                    terapkanPosisiFallback(kartu, x, y);
                }

                posisiIkon[dragState.id] = {
                    x: x,
                    y: y
                };
                localStorage.setItem('totools-icon-positions', JSON.stringify(posisiIkon));
                kartu.dataset.suppressClick = 'true';
                tampilkanToastFallback('Posisi app disimpan.');
            }
        }

        try {
            kartu.releasePointerCapture(event.pointerId);
        } catch (error) {}

        dragState = null;
    }

    function pindahUrutanFallback(idAsal, idTujuan) {
        var urutan = Array.prototype.map.call(document.querySelectorAll('.shortcut-area .tool-card'), function (card) {
            return card.dataset.tool;
        });
        var asalIndex = urutan.indexOf(idAsal);
        var tujuanIndex = urutan.indexOf(idTujuan);

        if (asalIndex === -1 || tujuanIndex === -1) {
            return;
        }

        var dipindah = urutan.splice(asalIndex, 1)[0];
        urutan.splice(tujuanIndex, 0, dipindah);
        localStorage.setItem('totools-tool-order', JSON.stringify(urutan));
        renderDesktopAppsFallback();
        renderDockFallback();
        renderDockSettingsFallback();
        renderDesktopSettingsFallback();
        renderStartMenuFallback();
        tampilkanToastFallback('Urutan app diperbarui.');
    }

    function snapPosisiKosongFallback(x, y, kartu, area) {
        var gridX = 112;
        var gridY = 132;
        var maxCol = Math.max(0, Math.floor((area.clientWidth - kartu.offsetWidth) / gridX));
        var maxRow = Math.max(0, Math.floor((area.clientHeight - kartu.offsetHeight) / gridY));
        var colTarget = Math.min(Math.max(0, Math.round(x / gridX)), maxCol);
        var rowTarget = Math.min(Math.max(0, Math.round(y / gridY)), maxRow);
        var terisi = new Set();

        document.querySelectorAll('.shortcut-area .tool-card').forEach(function (item) {
            if (item === kartu) {
                return;
            }

            var col = Math.round((Number.parseFloat(item.style.left) || 0) / gridX);
            var row = Math.round((Number.parseFloat(item.style.top) || 0) / gridY);
            terisi.add(col + ':' + row);
        });

        var terbaik = { col: colTarget, row: rowTarget, jarak: Infinity };
        for (var col = 0; col <= maxCol; col += 1) {
            for (var row = 0; row <= maxRow; row += 1) {
                if (terisi.has(col + ':' + row)) {
                    continue;
                }

                var jarak = Math.abs(col - colTarget) + Math.abs(row - rowTarget);
                if (jarak < terbaik.jarak) {
                    terbaik = { col: col, row: row, jarak: jarak };
                }
            }
        }

        return batasiPosisiFallback(terbaik.col * gridX, terbaik.row * gridY, kartu, area);
    }

    function cegahKlikSetelahDragFallback(event) {
        if (event.currentTarget.dataset.suppressClick === 'true') {
            event.currentTarget.dataset.suppressClick = 'false';
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    function posisiDefaultFallback(index) {
        var area = document.querySelector('.shortcut-area');
        var barisMaks = area ? Math.max(1, Math.floor(area.clientHeight / 132)) : 4;
        var kolom = Math.floor(index / barisMaks);
        var baris = index % barisMaks;
        return {
            x: kolom * 112,
            y: baris * 132
        };
    }

    function terapkanPosisiFallback(kartu, x, y) {
        if (window.innerWidth <= 720) {
            kartu.style.left = '';
            kartu.style.top = '';
            return;
        }

        var area = document.querySelector('.shortcut-area');
        var posisi = batasiPosisiFallback(x, y, kartu, area);
        kartu.style.left = posisi.x + 'px';
        kartu.style.top = posisi.y + 'px';
        kartu.classList.add('is-positioned');
    }

    function batasiPosisiFallback(x, y, kartu, area) {
        var maxX = Math.max(0, area.clientWidth - kartu.offsetWidth);
        var maxY = Math.max(0, area.clientHeight - kartu.offsetHeight);
        return {
            x: Math.min(Math.max(0, x), maxX),
            y: Math.min(Math.max(0, y), maxY)
        };
    }

    function toggleDesktopToolFallback(idTool, aktif) {
        if (aktif && !desktopTools.includes(idTool)) {
            desktopTools.push(idTool);
        }

        if (!aktif) {
            desktopTools = desktopTools.filter(function (id) {
                return id !== idTool;
            });
        }

        localStorage.setItem('totools-desktop-tools', JSON.stringify(desktopTools));
        renderDesktopAppsFallback();
        renderDesktopSettingsFallback();
        tampilkanToastFallback('Desktop apps diperbarui.');
    }

    function resetDesktopLayoutFallback() {
        posisiIkon = {};
        localStorage.removeItem('totools-icon-positions');
        renderDesktopAppsFallback();
        tampilkanToastFallback('Desktop layout direset.');
    }

    function renderStartMenuFallback() {
        var areaStartMenu = document.querySelector('[data-render="start-menu"]');

        if (!areaStartMenu) {
            return;
        }

        areaStartMenu.innerHTML = getDaftarToolsFallback().map(function (tool) {
            return '<button type="button" data-tool="' + tool.id + '">' +
                '<span class="tool-icon ' + tool.ikonClass + '" aria-hidden="true">' + buatIkonFallback(tool.ikonPath) + '</span>' +
                '<span>' + tool.nama + '</span>' +
            '</button>';
        }).join('');
    }

    function toggleStartMenuFallback() {
        var startMenu = document.getElementById('start-menu');

        if (!startMenu) {
            return;
        }

        var aktif = startMenu.classList.toggle('aktif');
        startMenu.setAttribute('aria-hidden', String(!aktif));
    }

    function toggleDockToolFallback(idTool, aktif) {
        if (aktif && !dockTools.includes(idTool)) {
            dockTools.push(idTool);
        }

        if (!aktif) {
            dockTools = dockTools.filter(function (id) {
                return id !== idTool;
            });
        }

        localStorage.setItem('totools-dock-tools', JSON.stringify(dockTools));
        renderDockFallback();
        renderDockSettingsFallback();
        tampilkanToastFallback('Dock diperbarui.');
    }

    function tampilkanToastFallback(pesan) {
        var toast = document.getElementById('toast');

        if (!toast) {
            return;
        }

        toast.textContent = pesan;
        toast.classList.add('show');
        setTimeout(function () {
            toast.classList.remove('show');
        }, 1800);
    }

    function terapkanTemaFallback() {
        var desktop = document.querySelector('.desktop');
        var themeSelect = document.getElementById('theme-select');

        if (!desktop) {
            return;
        }

        desktop.classList.remove.apply(desktop.classList, temaTersedia);
        desktop.classList.add(temaTersedia[indeksTema]);

        if (themeSelect) {
            themeSelect.value = String(indeksTema);
        }
    }

    function gantiTemaFallback() {
        indeksTema = (indeksTema + 1) % temaTersedia.length;
        localStorage.setItem('totools-theme-index', String(indeksTema));
        terapkanTemaFallback();
        tampilkanToastFallback('Wallpaper diganti.');
    }

    function setTemaFallback(nilai) {
        indeksTema = Number(nilai);

        if (!Number.isInteger(indeksTema) || indeksTema < 0 || indeksTema >= temaTersedia.length) {
            indeksTema = 0;
        }

        localStorage.setItem('totools-theme-index', String(indeksTema));
        terapkanTemaFallback();
        tampilkanToastFallback('Theme diterapkan.');
    }

    function resetTemaFallback() {
        indeksTema = 0;
        localStorage.setItem('totools-theme-index', String(indeksTema));
        terapkanTemaFallback();
        tampilkanToastFallback('Theme direset.');
    }

    function renderModalChromeFallback() {
        document.querySelectorAll('.tool-modal').forEach(function (modal) {
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-hidden', 'true');
            modal.setAttribute('tabindex', '-1');

            if (modal.querySelector('.modal-bar')) {
                return;
            }

            var judul = modal.dataset.modalTitle || 'Totools';
            modal.insertAdjacentHTML('afterbegin',
                '<div class="modal-bar">' +
                    '<div class="window-controls" aria-hidden="true">' +
                        '<span class="window-dot red"></span>' +
                        '<span class="window-dot yellow"></span>' +
                        '<span class="window-dot green"></span>' +
                    '</div>' +
                    '<span class="modal-title">' + judul + '</span>' +
                    '<button class="close-button" type="button" data-action="close-modal" aria-label="Tutup">x</button>' +
                '</div>'
            );
        });
    }

    function bukaModal(id) {
        var overlay = document.getElementById('layar-gelap');
        var modal = document.getElementById(id);
        var startMenu = document.getElementById('start-menu');

        if (startMenu) {
            startMenu.classList.remove('aktif');
            startMenu.setAttribute('aria-hidden', 'true');
        }

        if (overlay) {
            overlay.classList.add('aktif');
        }

        if (modal) {
            modal.classList.add('aktif');
            modal.setAttribute('aria-hidden', 'false');
            modal.focus();
        }
    }

    function tutupModal() {
        var overlay = document.getElementById('layar-gelap');

        if (overlay) {
            overlay.classList.remove('aktif');
        }

        document.querySelectorAll('.tool-modal').forEach(function (modal) {
            modal.classList.remove('aktif');
            modal.setAttribute('aria-hidden', 'true');
        });
    }

    function bindSekaliFallback(selector, eventName, handler) {
        document.querySelectorAll(selector).forEach(function (elemen) {
            var key = 'boundFallback' + eventName + selector.replace(/[^a-z0-9]/gi, '');

            if (elemen.dataset[key] === 'true') {
                return;
            }

            elemen.addEventListener(eventName, handler);
            elemen.dataset[key] = 'true';
        });
    }

    function initToolFallback() {
        bindSekaliFallback('[data-action="clear-textarea"]', 'click', function (event) {
            var textarea = document.getElementById(event.currentTarget.dataset.target);

            if (!textarea) {
                return;
            }

            textarea.value = '';
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.focus();
            tampilkanToastFallback('Teks dibersihkan.');
        });

        bindSekaliFallback('[data-action="calculate-rate"]', 'input', hitungKursFallback);
        bindSekaliFallback('[data-action="calculate-rate"]', 'change', hitungKursFallback);
        bindSekaliFallback('[data-action="refresh-rate"]', 'change', ambilKursFallback);
        bindSekaliFallback('[data-action="translate"]', 'click', translateFallback);
        bindSekaliFallback('[data-action="copy-translation"]', 'click', salinTranslateFallback);
        bindSekaliFallback('[data-action="barcode-live"]', 'input', function () {
            buatBarcodeFallback(false);
        });
        bindSekaliFallback('[data-action="barcode-live"]', 'change', function () {
            buatBarcodeFallback(false);
        });
        bindSekaliFallback('[data-action="generate-barcode"]', 'click', function () {
            buatBarcodeFallback(true);
        });
        bindSekaliFallback('[data-action="download-barcode"]', 'click', downloadBarcodeFallback);
        bindSekaliFallback('[data-action="qr-live"]', 'input', function () {
            buatQrFallback(false);
        });
        bindSekaliFallback('[data-action="qr-live"]', 'change', function () {
            buatQrFallback(false);
        });
        bindSekaliFallback('[data-action="generate-qr"]', 'click', function () {
            buatQrFallback(true);
        });
        bindSekaliFallback('[data-action="download-qr"]', 'click', downloadQrFallback);
        bindSekaliFallback('[data-action="download-qr-batch"]', 'click', downloadQrBatchFallback);
        bindSekaliFallback('[data-action="word-live"]', 'input', hitungKataFallback);

        document.querySelectorAll('[data-qr-tab]').forEach(function (tab) {
            if (tab.dataset.boundFallbackQrTab === 'true') {
                return;
            }

            tab.addEventListener('click', function () {
                gantiTabQrFallback(tab.dataset.qrTab);
            });
            tab.dataset.boundFallbackQrTab = 'true';
        });

        buatBarcodeFallback(false);
        buatQrFallback(false);
        hitungKataFallback();
        initCollageFallback();
    }

    var collageGambar = [];
    var collageLayout = 'grid-2x2';
    var collageBg = '#1a1a2e';
    var collageGap = 8;
    var collageRadius = 0;
    var collageSlotSelected = null;

    var COLLAGE_LAYOUTS = {
        'grid-2x2': { cols: 2, rows: 2, slots: 4 },
        'grid-3x3': { cols: 3, rows: 3, slots: 9 },
        'grid-1+2': { cols: 1, rows: 1, slots: 3 },
        'grid-2+1': { cols: 1, rows: 1, slots: 3 },
        'grid-row': { cols: 3, rows: 1, slots: 3 },
        'grid-col': { cols: 1, rows: 3, slots: 3 },
        'grid-1x2': { cols: 1, rows: 1, slots: 2 },
        'grid-2x1': { cols: 1, rows: 1, slots: 2 }
    };

    function initCollageFallback() {
        var btnUpload = document.getElementById('collage-upload-btn');
        var inputFile = document.getElementById('collage-file-input');
        var dropzone = document.getElementById('collage-dropzone');
        var btnGenerate = document.getElementById('collage-generate-btn');
        var btnDownload = document.getElementById('collage-download-btn');
        var btnReset = document.getElementById('collage-reset-btn');
        var selectLayout = document.getElementById('collage-layout');
        var inputBg = document.getElementById('collage-bg-color');
        var inputJarak = document.getElementById('collage-gap');
        var inputSudut = document.getElementById('collage-radius');
        var rangeJarak = document.getElementById('collage-gap-range');
        var rangeSudut = document.getElementById('collage-radius-range');
        var inputZoom = document.getElementById('collage-zoom');
        var inputOffsetX = document.getElementById('collage-offset-x');
        var inputOffsetY = document.getElementById('collage-offset-y');
        var btnResetAdjust = document.getElementById('collage-adjust-reset');

        if (!btnUpload || btnUpload.dataset.boundCollageFallback === 'true') return;
        btnUpload.dataset.boundCollageFallback = 'true';

        btnUpload.addEventListener('click', function () { inputFile?.click(); });
        inputFile?.addEventListener('change', function (e) {
            tambahGambarCollageFallback(Array.from(e.target.files));
            e.target.value = '';
        });

        dropzone?.addEventListener('dragover', function (e) { e.preventDefault(); dropzone.classList.add('drag-over'); });
        dropzone?.addEventListener('dragleave', function () { dropzone.classList.remove('drag-over'); });
        dropzone?.addEventListener('drop', function (e) {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            var files = Array.from(e.dataTransfer.files).filter(function (f) { return f.type.startsWith('image/'); });
            tambahGambarCollageFallback(files);
        });
        dropzone?.addEventListener('click', function (e) {
            if (e.target.closest('#collage-upload-btn')) return;
            inputFile?.click();
        });

        document.querySelectorAll('.collage-preset-color').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var color = btn.dataset.color;
                if (inputBg) {
                    inputBg.value = color;
                    collageBg = color;
                    renderPreviewCollageFallback();
                }
            });
        });

        selectLayout?.addEventListener('change', function (e) {
            collageLayout = e.target.value;
            collageSlotSelected = null;
            renderPreviewCollageFallback();
        });

        inputBg?.addEventListener('input', function (e) {
            collageBg = e.target.value;
            renderPreviewCollageFallback();
        });

        if (rangeJarak && inputJarak) {
            rangeJarak.addEventListener('input', function (e) {
                collageGap = parseInt(e.target.value, 10);
                inputJarak.value = collageGap;
                renderPreviewCollageFallback();
            });
            inputJarak.addEventListener('input', function (e) {
                collageGap = Math.max(0, Math.min(40, parseInt(e.target.value, 10) || 0));
                rangeJarak.value = collageGap;
                renderPreviewCollageFallback();
            });
        }

        if (rangeSudut && inputSudut) {
            rangeSudut.addEventListener('input', function (e) {
                collageRadius = parseInt(e.target.value, 10);
                inputSudut.value = collageRadius;
                renderPreviewCollageFallback();
            });
            inputSudut.addEventListener('input', function (e) {
                collageRadius = Math.max(0, Math.min(40, parseInt(e.target.value, 10) || 0));
                rangeSudut.value = collageRadius;
                renderPreviewCollageFallback();
            });
        }

        inputZoom?.addEventListener('input', function (e) {
            if (collageSlotSelected === null || !collageGambar[collageSlotSelected]) return;
            var val = parseFloat(e.target.value);
            collageGambar[collageSlotSelected].zoom = val;
            var lbl = document.getElementById('collage-zoom-val');
            if (lbl) lbl.textContent = val.toFixed(2) + 'x';
            updateSlotTransformCollageFallback(collageSlotSelected);
        });

        inputOffsetX?.addEventListener('input', function (e) {
            if (collageSlotSelected === null || !collageGambar[collageSlotSelected]) return;
            collageGambar[collageSlotSelected].offsetX = parseInt(e.target.value, 10);
            updateSlotTransformCollageFallback(collageSlotSelected);
        });

        inputOffsetY?.addEventListener('input', function (e) {
            if (collageSlotSelected === null || !collageGambar[collageSlotSelected]) return;
            collageGambar[collageSlotSelected].offsetY = parseInt(e.target.value, 10);
            updateSlotTransformCollageFallback(collageSlotSelected);
        });

        btnResetAdjust?.addEventListener('click', function () {
            if (collageSlotSelected === null || !collageGambar[collageSlotSelected]) return;
            collageGambar[collageSlotSelected].zoom = 1;
            collageGambar[collageSlotSelected].offsetX = 0;
            collageGambar[collageSlotSelected].offsetY = 0;
            syncAdjustPanelValuesCollageFallback();
            updateSlotTransformCollageFallback(collageSlotSelected);
            tampilkanToastFallback('Posisi gambar #' + (collageSlotSelected + 1) + ' direset.');
        });

        btnGenerate?.addEventListener('click', function () {
            if (collageGambar.length === 0) {
                tampilkanToastFallback('Upload minimal 1 gambar dulu!');
                return;
            }
            buatKolaseCanvasFallback();
        });

        btnDownload?.addEventListener('click', function () {
            var canvas = document.getElementById('collage-canvas');
            if (!canvas || canvas.dataset.hasContent !== 'true') {
                tampilkanToastFallback('Buat kolase dulu!');
                return;
            }
            unduhUrlFallback(canvas.toDataURL('image/png'), 'kolase-totools-' + Date.now() + '.png');
            tampilkanToastFallback('Kolase diunduh!');
        });

        btnReset?.addEventListener('click', function () {
            collageGambar = [];
            collageSlotSelected = null;
            renderDaftarGambarCollageFallback();
            renderPreviewCollageFallback();
            bersihkanCanvasCollageFallback();
            tampilkanToastFallback('Gambar direset.');
        });
    }

    async function tambahGambarCollageFallback(files) {
        var valid = files.filter(function (f) { return f.type.startsWith('image/'); });
        if (valid.length === 0) {
            tampilkanToastFallback('Hanya file gambar yang didukung.');
            return;
        }

        var adaYangDikompres = false;
        var ditambahkan = 0;

        for (var i = 0; i < valid.length; i++) {
            var file = valid[i];
            if (collageGambar.length >= 9) {
                tampilkanToastFallback('Maksimal 9 gambar per kolase.');
                break;
            }

            try {
                var hasil = await kompresGambarCollageFallback(file);
                collageGambar.push({
                    src: hasil.src,
                    nama: hasil.nama,
                    zoom: 1,
                    offsetX: 0,
                    offsetY: 0
                });
                if (hasil.dikompres) adaYangDikompres = true;
                ditambahkan++;
            } catch (err) {
                tampilkanToastFallback(err.message || ('Gagal memproses ' + file.name));
            }
        }

        if (ditambahkan > 0) {
            renderDaftarGambarCollageFallback();
            renderPreviewCollageFallback();
            if (adaYangDikompres) {
                tampilkanToastFallback(ditambahkan + ' gambar ditambahkan (otomatis dioptimasi).');
            } else {
                tampilkanToastFallback(ditambahkan + ' gambar ditambahkan.');
            }
        }
    }

    async function kompresGambarCollageFallback(file) {
        if (file.size > 50 * 1024 * 1024) {
            throw new Error('File ' + file.name + ' terlalu besar (maksimal 50MB).');
        }

        var dataUrl = await new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function (e) { resolve(e.target.result); };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        var img = await new Promise(function (resolve, reject) {
            var image = new Image();
            image.onload = function () { resolve(image); };
            image.onerror = reject;
            image.src = dataUrl;
        });

        var width = img.width;
        var height = img.height;
        if (width <= 2048 && height <= 2048 && file.size < 2 * 1024 * 1024) {
            return { src: dataUrl, nama: file.name, dikompres: false };
        }

        var scale = 1;
        if (width > 2048 || height > 2048) {
            scale = Math.min(2048 / width, 2048 / height);
        }

        var newWidth = Math.round(width * scale);
        var newHeight = Math.round(height * scale);

        var canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        return { src: canvas.toDataURL('image/jpeg', 0.88), nama: file.name, dikompres: true };
    }

    function renderDaftarGambarCollageFallback() {
        var container = document.getElementById('collage-image-list');
        if (!container) return;

        if (collageGambar.length === 0) {
            container.innerHTML = '<p class="collage-empty-list">Belum ada gambar.</p>';
            return;
        }

        container.innerHTML = collageGambar.map(function (gambar, idx) {
            return '<div class="collage-thumb ' + (collageSlotSelected === idx ? 'is-selected' : '') + '" draggable="true" data-idx="' + idx + '">' +
                '<img src="' + gambar.src + '" alt="' + gambar.nama + '" loading="lazy">' +
                '<button class="collage-thumb-remove" type="button" data-remove="' + idx + '" aria-label="Hapus gambar ' + (idx + 1) + '">×</button>' +
                '<span class="collage-thumb-num">' + (idx + 1) + '</span>' +
            '</div>';
        }).join('');

        container.querySelectorAll('.collage-thumb').forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                var idx = parseInt(thumb.dataset.idx, 10);
                pilihSlotCollageFallback(idx);
            });
        });

        container.querySelectorAll('[data-remove]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var idx = parseInt(btn.dataset.remove, 10);
                collageGambar.splice(idx, 1);
                if (collageSlotSelected === idx) collageSlotSelected = null;
                else if (collageSlotSelected > idx) collageSlotSelected--;
                renderDaftarGambarCollageFallback();
                renderPreviewCollageFallback();
            });
        });
    }

    function renderPreviewCollageFallback() {
        var wrapper = document.getElementById('collage-preview-wrapper');
        if (!wrapper) return;

        if (collageGambar.length === 0) {
            wrapper.innerHTML = '<p class="collage-preview-empty">Preview kolase akan tampil di sini setelah gambar diupload.</p>';
            sebunyikanAdjustPanelCollageFallback();
            return;
        }

        var layout = COLLAGE_LAYOUTS[collageLayout] || COLLAGE_LAYOUTS['grid-2x2'];
        var slots = layout.slots;
        var imgsToUse = collageGambar.slice(0, slots);

        var gridStyle = '';
        var gridClass = 'collage-preview-grid layout-' + collageLayout;

        switch (collageLayout) {
            case 'grid-2x2': gridStyle = 'grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr);'; break;
            case 'grid-3x3': gridStyle = 'grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);'; break;
            case 'grid-1+2': gridStyle = 'grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr;'; break;
            case 'grid-2+1': gridStyle = 'grid-template-columns: 1fr 2fr; grid-template-rows: 1fr 1fr;'; break;
            case 'grid-row': gridStyle = 'grid-template-columns: repeat(3, 1fr); grid-template-rows: 1fr;'; break;
            case 'grid-col': gridStyle = 'grid-template-columns: 1fr; grid-template-rows: repeat(3, 1fr);'; break;
            case 'grid-1x2': gridStyle = 'grid-template-columns: repeat(2, 1fr); grid-template-rows: 1fr;'; break;
            case 'grid-2x1': gridStyle = 'grid-template-columns: 1fr; grid-template-rows: repeat(2, 1fr);'; break;
        }

        var items = imgsToUse.map(function (gambar, idx) {
            var itemStyle = '';
            if (collageLayout === 'grid-1+2' && idx === 0) itemStyle = 'grid-row: 1 / 3;';
            if (collageLayout === 'grid-2+1' && idx === 2) itemStyle = 'grid-column: 2; grid-row: 1 / 3;';

            var isSelected = collageSlotSelected === idx;
            var zoom = gambar.zoom || 1;
            var offX = gambar.offsetX || 0;
            var offY = gambar.offsetY || 0;

            return '<div class="collage-slot ' + (isSelected ? 'is-selected' : '') + '" data-slot-idx="' + idx + '" style="' + itemStyle + ' border-radius: ' + collageRadius + 'px;">' +
                '<img src="' + gambar.src + '" alt="' + gambar.nama + '" style="border-radius:' + collageRadius + 'px; transform: scale(' + zoom + ') translate(' + (offX / zoom) + '%, ' + (offY / zoom) + '%); transform-origin: center center;">' +
            '</div>';
        }).join('');

        var missing = Math.max(0, slots - imgsToUse.length);
        var placeholders = Array.from({ length: missing }, function (_, i) {
            return '<div class="collage-slot collage-slot-empty" style="border-radius:' + collageRadius + 'px;"><span>' + (imgsToUse.length + i + 1) + '</span></div>';
        }).join('');

        wrapper.innerHTML = '<div class="' + gridClass + '" style="' + gridStyle + ' gap: ' + collageGap + 'px; background: ' + collageBg + '; padding: ' + collageGap + 'px; border-radius: ' + Math.max(0, collageRadius + 4) + 'px;">' + items + placeholders + '</div>';

        bindSlotInteractionsCollageFallback(wrapper);

        if (collageSlotSelected !== null && collageSlotSelected < imgsToUse.length) {
            tampilkanAdjustPanelCollageFallback();
        } else {
            sebunyikanAdjustPanelCollageFallback();
        }
    }

    function bindSlotInteractionsCollageFallback(wrapper) {
        wrapper.querySelectorAll('.collage-slot[data-slot-idx]').forEach(function (slotEl) {
            var idx = parseInt(slotEl.dataset.slotIdx, 10);
            var isPointerDown = false;
            var startX = 0;
            var startY = 0;
            var initOffX = 0;
            var initOffY = 0;

            slotEl.addEventListener('pointerdown', function (e) {
                isPointerDown = true;
                startX = e.clientX;
                startY = e.clientY;
                var g = collageGambar[idx];
                initOffX = g ? (g.offsetX || 0) : 0;
                initOffY = g ? (g.offsetY || 0) : 0;
                try { slotEl.setPointerCapture(e.pointerId); } catch (err) {}
                pilihSlotCollageFallback(idx);
            });

            slotEl.addEventListener('pointermove', function (e) {
                if (!isPointerDown) return;
                var g = collageGambar[idx];
                if (!g) return;

                var rect = slotEl.getBoundingClientRect();
                var deltaX = e.clientX - startX;
                var deltaY = e.clientY - startY;

                var percentX = (deltaX / rect.width) * 100;
                var percentY = (deltaY / rect.height) * 100;

                var zoom = g.zoom || 1;
                g.offsetX = Math.max(-100, Math.min(100, Math.round(initOffX + percentX * zoom)));
                g.offsetY = Math.max(-100, Math.min(100, Math.round(initOffY + percentY * zoom)));

                updateSlotTransformCollageFallback(idx);
                syncAdjustPanelValuesCollageFallback();
            });

            var stopPointer = function (e) {
                if (isPointerDown) {
                    isPointerDown = false;
                    try { slotEl.releasePointerCapture(e.pointerId); } catch (err) {}
                }
            };

            slotEl.addEventListener('pointerup', stopPointer);
            slotEl.addEventListener('pointercancel', stopPointer);

            slotEl.addEventListener('wheel', function (e) {
                e.preventDefault();
                var g = collageGambar[idx];
                if (!g) return;

                pilihSlotCollageFallback(idx);

                var currentZoom = g.zoom || 1;
                var delta = e.deltaY < 0 ? 0.08 : -0.08;
                var newZoom = Math.max(0.2, Math.min(3, Math.round((currentZoom + delta) * 100) / 100));

                g.zoom = newZoom;
                updateSlotTransformCollageFallback(idx);
                syncAdjustPanelValuesCollageFallback();
            }, { passive: false });

            var initialTouchDist = 0;
            var initialTouchZoom = 1;

            slotEl.addEventListener('touchstart', function (e) {
                if (e.touches.length === 2) {
                    isPointerDown = false;
                    var g = collageGambar[idx];
                    if (!g) return;
                    pilihSlotCollageFallback(idx);
                    initialTouchZoom = g.zoom || 1;
                    var dx = e.touches[0].clientX - e.touches[1].clientX;
                    var dy = e.touches[0].clientY - e.touches[1].clientY;
                    initialTouchDist = Math.hypot(dx, dy);
                }
            }, { passive: true });

            slotEl.addEventListener('touchmove', function (e) {
                if (e.touches.length === 2 && initialTouchDist > 0) {
                    e.preventDefault();
                    var g = collageGambar[idx];
                    if (!g) return;

                    var dx = e.touches[0].clientX - e.touches[1].clientX;
                    var dy = e.touches[0].clientY - e.touches[1].clientY;
                    var currentDist = Math.hypot(dx, dy);

                    if (currentDist > 0) {
                        var scaleFactor = currentDist / initialTouchDist;
                        var newZoom = Math.max(0.2, Math.min(3, Math.round(initialTouchZoom * scaleFactor * 100) / 100));
                        g.zoom = newZoom;
                        updateSlotTransformCollageFallback(idx);
                        syncAdjustPanelValuesCollageFallback();
                    }
                }
            }, { passive: false });

            slotEl.addEventListener('touchend', function (e) {
                if (e.touches.length < 2) {
                    initialTouchDist = 0;
                }
            });

            slotEl.addEventListener('dblclick', function () {
                var g = collageGambar[idx];
                if (!g) return;
                g.zoom = 1;
                g.offsetX = 0;
                g.offsetY = 0;
                updateSlotTransformCollageFallback(idx);
                tampilkanToastFallback('Posisi gambar #' + (idx + 1) + ' direset.');
            });
        });
    }

    function pilihSlotCollageFallback(idx) {
        if (idx < 0 || idx >= collageGambar.length) return;
        collageSlotSelected = idx;

        document.querySelectorAll('.collage-slot[data-slot-idx]').forEach(function (el) {
            var slotIdx = parseInt(el.dataset.slotIdx, 10);
            el.classList.toggle('is-selected', slotIdx === idx);
        });

        document.querySelectorAll('.collage-thumb').forEach(function (thumb) {
            var thumbIdx = parseInt(thumb.dataset.idx, 10);
            thumb.classList.toggle('is-selected', thumbIdx === idx);
        });

        tampilkanAdjustPanelCollageFallback();
    }

    function updateSlotTransformCollageFallback(idx) {
        var slotEl = document.querySelector('.collage-slot[data-slot-idx="' + idx + '"]');
        var imgEl = slotEl?.querySelector('img');
        var g = collageGambar[idx];
        if (!imgEl || !g) return;

        var zoom = g.zoom || 1;
        var offX = g.offsetX || 0;
        var offY = g.offsetY || 0;
        imgEl.style.transform = 'scale(' + zoom + ') translate(' + (offX / zoom) + '%, ' + (offY / zoom) + '%)';
    }

    function tampilkanAdjustPanelCollageFallback() {
        var panel = document.getElementById('collage-adjust-panel');
        var title = document.getElementById('collage-adjust-title');
        if (!panel || collageSlotSelected === null || !collageGambar[collageSlotSelected]) return;

        panel.hidden = false;
        if (title) title.textContent = 'Atur Gambar #' + (collageSlotSelected + 1);
        syncAdjustPanelValuesCollageFallback();
    }

    function sebunyikanAdjustPanelCollageFallback() {
        var panel = document.getElementById('collage-adjust-panel');
        if (panel) panel.hidden = true;
    }

    function syncAdjustPanelValuesCollageFallback() {
        if (collageSlotSelected === null || !collageGambar[collageSlotSelected]) return;
        var g = collageGambar[collageSlotSelected];
        var zoom = g.zoom || 1;
        var offX = g.offsetX || 0;
        var offY = g.offsetY || 0;

        var inputZoom = document.getElementById('collage-zoom');
        var inputOffsetX = document.getElementById('collage-offset-x');
        var inputOffsetY = document.getElementById('collage-offset-y');
        var labelZoom = document.getElementById('collage-zoom-val');

        if (inputZoom) inputZoom.value = zoom;
        if (inputOffsetX) inputOffsetX.value = offX;
        if (inputOffsetY) inputOffsetY.value = offY;
        if (labelZoom) labelZoom.textContent = zoom.toFixed(2) + 'x';
    }

    function bersihkanCanvasCollageFallback() {
        var canvas = document.getElementById('collage-canvas');
        var status = document.getElementById('collage-canvas-status');
        if (canvas) {
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.dataset.hasContent = 'false';
            canvas.style.display = 'none';
        }
        if (status) {
            status.textContent = '';
            status.hidden = true;
        }
    }

    async function buatKolaseCanvasFallback() {
        var canvas = document.getElementById('collage-canvas');
        var statusEl = document.getElementById('collage-canvas-status');
        if (!canvas) return;

        var layout = COLLAGE_LAYOUTS[collageLayout] || COLLAGE_LAYOUTS['grid-2x2'];
        var slots = layout.slots;
        var imgsToUse = collageGambar.slice(0, slots);

        if (statusEl) {
            statusEl.textContent = 'Memproses...';
            statusEl.hidden = false;
        }

        try {
            var loadedImgs = await Promise.all(imgsToUse.map(function (g) {
                return new Promise(function (resolve, reject) {
                    var img = new Image();
                    img.onload = function () { resolve(img); };
                    img.onerror = reject;
                    img.src = g.src;
                });
            }));

            var CANVAS_W = 1200;
            var CANVAS_H = 1200;
            var GAP = collageGap * 3;
            var PADDING = collageGap * 3;
            var RADIUS = collageRadius * 2;

            canvas.width = CANVAS_W;
            canvas.height = CANVAS_H;
            var ctx = canvas.getContext('2d');

            ctx.fillStyle = collageBg;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

            var rects = hitungRectsCollageFallback(collageLayout, CANVAS_W, CANVAS_H, GAP, PADDING, slots);

            loadedImgs.forEach(function (img, i) {
                if (!rects[i]) return;
                var rect = rects[i];
                var g = imgsToUse[i];
                var zoom = g.zoom || 1;
                var offX = g.offsetX || 0;
                var offY = g.offsetY || 0;

                var nw = img.naturalWidth || img.width || 1;
                var nh = img.naturalHeight || img.height || 1;

                ctx.save();
                if (RADIUS > 0) {
                    var maxR = Math.min(rect.w, rect.h) / 2;
                    var r = Math.min(RADIUS, maxR);
                    ctx.beginPath();
                    ctx.moveTo(rect.x + r, rect.y);
                    ctx.lineTo(rect.x + rect.w - r, rect.y);
                    ctx.arcTo(rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + r, r);
                    ctx.lineTo(rect.x + rect.w, rect.y + rect.h - r);
                    ctx.arcTo(rect.x + rect.w, rect.y + rect.h, rect.x + rect.w - r, rect.y + rect.h, r);
                    ctx.lineTo(rect.x + r, rect.y + rect.h);
                    ctx.arcTo(rect.x, rect.y + rect.h, rect.x, rect.y + rect.h - r, r);
                    ctx.lineTo(rect.x, rect.y + r);
                    ctx.arcTo(rect.x, rect.y, rect.x + r, rect.y, r);
                    ctx.closePath();
                    ctx.clip();
                }

                drawSlotImageCollageFallback(ctx, img, nw, nh, rect.x, rect.y, rect.w, rect.h, zoom, offX, offY);
                ctx.restore();
            });

            canvas.style.display = 'block';
            canvas.dataset.hasContent = 'true';

            if (statusEl) {
                statusEl.textContent = 'Kolase siap! Tekan Download untuk menyimpan.';
                statusEl.hidden = false;
            }

            tampilkanToastFallback('Kolase berhasil dibuat!');
        } catch (err) {
            console.error('Error buatKolaseCanvasFallback:', err);
            if (statusEl) {
                statusEl.textContent = 'Gagal membuat kolase: ' + (err.message || err);
                statusEl.hidden = false;
            }
            tampilkanToastFallback('Gagal memproses gambar.');
        }
    }

    function hitungRectsCollageFallback(layout, W, H, gap, pad, slots) {
        var inner_w = W - pad * 2;
        var inner_h = H - pad * 2;
        var rects = [];

        switch (layout) {
            case 'grid-2x2': {
                var cw = (inner_w - gap) / 2;
                var ch = (inner_h - gap) / 2;
                for (var r = 0; r < 2; r++) for (var c = 0; c < 2; c++) {
                    rects.push({ x: pad + c * (cw + gap), y: pad + r * (ch + gap), w: cw, h: ch });
                }
                break;
            }
            case 'grid-3x3': {
                var cw = (inner_w - gap * 2) / 3;
                var ch = (inner_h - gap * 2) / 3;
                for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) {
                    rects.push({ x: pad + c * (cw + gap), y: pad + r * (ch + gap), w: cw, h: ch });
                }
                break;
            }
            case 'grid-1+2': {
                var bigW = (inner_w - gap) * 2 / 3;
                var smallW = inner_w - gap - bigW;
                var ch = (inner_h - gap) / 2;
                rects.push({ x: pad, y: pad, w: bigW, h: inner_h });
                rects.push({ x: pad + bigW + gap, y: pad, w: smallW, h: ch });
                rects.push({ x: pad + bigW + gap, y: pad + ch + gap, w: smallW, h: ch });
                break;
            }
            case 'grid-2+1': {
                var smallW = (inner_w - gap) * 1 / 3;
                var bigW = inner_w - gap - smallW;
                var ch = (inner_h - gap) / 2;
                rects.push({ x: pad, y: pad, w: smallW, h: ch });
                rects.push({ x: pad, y: pad + ch + gap, w: smallW, h: ch });
                rects.push({ x: pad + smallW + gap, y: pad, w: bigW, h: inner_h });
                break;
            }
            case 'grid-row': {
                var cw = (inner_w - gap * 2) / 3;
                for (var c = 0; c < 3; c++) {
                    rects.push({ x: pad + c * (cw + gap), y: pad, w: cw, h: inner_h });
                }
                break;
            }
            case 'grid-col': {
                var ch = (inner_h - gap * 2) / 3;
                for (var r = 0; r < 3; r++) {
                    rects.push({ x: pad, y: pad + r * (ch + gap), w: inner_w, h: ch });
                }
                break;
            }
            case 'grid-1x2': {
                var cw = (inner_w - gap) / 2;
                rects.push({ x: pad, y: pad, w: cw, h: inner_h });
                rects.push({ x: pad + cw + gap, y: pad, w: cw, h: inner_h });
                break;
            }
            case 'grid-2x1': {
                var ch = (inner_h - gap) / 2;
                rects.push({ x: pad, y: pad, w: inner_w, h: ch });
                rects.push({ x: pad, y: pad + ch + gap, w: inner_w, h: ch });
                break;
            }
        }
        return rects;
    }

    function drawSlotImageCollageFallback(ctx, img, imgW, imgH, boxX, boxY, boxW, boxH, zoom, offsetX, offsetY) {
        imgW = Math.max(1, imgW || 1);
        imgH = Math.max(1, imgH || 1);
        boxW = Math.max(1, boxW || 1);
        boxH = Math.max(1, boxH || 1);
        var z = Math.max(0.1, zoom || 1);

        var baseScale = Math.max(boxW / imgW, boxH / imgH);
        var totalScale = baseScale * z;

        var scaledW = imgW * totalScale;
        var scaledH = imgH * totalScale;

        if (z >= 1.0) {
            var maxShiftX = (scaledW - boxW) / 2;
            var maxShiftY = (scaledH - boxH) / 2;

            var shiftX = ((offsetX || 0) / 100) * maxShiftX;
            var shiftY = ((offsetY || 0) / 100) * maxShiftY;

            var sw = boxW / totalScale;
            var sh = boxH / totalScale;

            var sx = (scaledW - boxW) / 2 / totalScale - shiftX / totalScale;
            var sy = (scaledH - boxH) / 2 / totalScale - shiftY / totalScale;

            sx = Math.max(0, Math.min(imgW - sw, sx));
            sy = Math.max(0, Math.min(imgH - sh, sy));

            sw = Math.max(1, Math.min(imgW - sx, sw));
            sh = Math.max(1, Math.min(imgH - sy, sh));

            ctx.drawImage(img, sx, sy, sw, sh, boxX, boxY, boxW, boxH);
        } else {
            var maxShiftX = (boxW - scaledW) / 2;
            var maxShiftY = (boxH - scaledH) / 2;

            var shiftX = ((offsetX || 0) / 100) * (maxShiftX + boxW * 0.4);
            var shiftY = ((offsetY || 0) / 100) * (maxShiftY + boxH * 0.4);

            var dx = boxX + (boxW - scaledW) / 2 + shiftX;
            var dy = boxY + (boxH - scaledH) / 2 + shiftY;

            ctx.drawImage(img, 0, 0, imgW, imgH, dx, dy, scaledW, scaledH);
        }
    }

    var kursFallback = null;
    var qrModeFallback = 'solo';

    async function ambilKursFallback() {
        var asal = document.getElementById('mata-uang-asal')?.value;
        var hasil = document.getElementById('hasil-konversi');

        if (!asal || !hasil) {
            return;
        }

        hasil.textContent = 'Mengambil kurs terbaru...';

        try {
            var response = await fetch('https://api.exchangerate-api.com/v4/latest/' + asal);
            if (!response.ok) {
                throw new Error('Gagal mengambil kurs');
            }

            var data = await response.json();
            kursFallback = data.rates;
            hitungKursFallback();
        } catch (error) {
            hasil.textContent = 'Gagal memuat data. Cek koneksi internet Tuan.';
        }
    }

    function hitungKursFallback() {
        if (!kursFallback) {
            return;
        }

        var asal = document.getElementById('mata-uang-asal')?.value;
        var tujuan = document.getElementById('mata-uang-tujuan')?.value;
        var jumlahMentah = document.getElementById('jumlah-awal')?.value;
        var hasil = document.getElementById('hasil-konversi');

        if (!hasil) {
            return;
        }

        if (jumlahMentah === '' || Number(jumlahMentah) <= 0) {
            hasil.textContent = 'Isi angkanya minimal 1 ya.';
            return;
        }

        var jumlah = Math.abs(Number(jumlahMentah));
        var kursTujuan = kursFallback[tujuan];
        if (!kursTujuan) {
            hasil.textContent = 'Kurs tujuan belum tersedia.';
            return;
        }

        hasil.innerHTML = 'Hasil: ' + jumlah.toLocaleString('id-ID') + ' ' + asal + ' = <span class="result-value">' + (jumlah * kursTujuan).toLocaleString('id-ID') + ' ' + tujuan + '</span>';
    }

    async function translateFallback() {
        var asal = document.getElementById('bahasa-asal')?.value;
        var tujuan = document.getElementById('bahasa-tujuan')?.value;
        var teks = document.getElementById('teks-input')?.value || '';
        var hasil = document.getElementById('teks-hasil');

        if (!hasil) {
            return;
        }

        if (!teks.trim()) {
            tampilkanToastFallback('Isi teksnya dulu sebelum diterjemahkan.');
            return;
        }

        hasil.value = 'Menerjemahkan...';

        try {
            var response = await fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(teks) + '&langpair=' + asal + '|' + tujuan);
            if (!response.ok) {
                throw new Error('Gagal menerjemahkan');
            }

            var data = await response.json();
            hasil.value = data.responseData && data.responseData.translatedText ? data.responseData.translatedText : 'Terjemahan tidak tersedia untuk teks ini.';
        } catch (error) {
            hasil.value = 'Koneksi internet sedang gangguan.';
        }
    }

    function salinTranslateFallback() {
        var hasil = document.getElementById('teks-hasil');
        var teks = hasil?.value || '';

        if (!teks || teks.includes('Menerjemahkan') || teks.includes('tidak tersedia') || teks.includes('gangguan')) {
            tampilkanToastFallback('Belum ada hasil terjemahan yang bisa disalin.');
            return;
        }

        navigator.clipboard.writeText(teks)
            .then(function () {
                tampilkanToastFallback('Berhasil disalin.');
            })
            .catch(function () {
                tampilkanToastFallback('Gagal menyalin. Coba salin manual ya.');
            });
    }

    function buatBarcodeFallback(tampilkanPesan) {
        var nilai = document.getElementById('barcode-value')?.value.trim();
        var format = document.getElementById('barcode-format')?.value;
        var output = document.getElementById('barcode-output');

        if (!output) {
            return;
        }

        function aturStatusBarcodeFallback(teks) {
            var status = document.getElementById('barcode-status');
            if (!status) {
                return;
            }
            status.textContent = teks || '';
            status.hidden = !teks;
        }

        if (!window.JsBarcode) {
            output.innerHTML = '';
            aturStatusBarcodeFallback('Library barcode belum termuat. Simpan JsBarcode lokal di assets/vendor/jsbarcode.all.min.js atau coba saat internet aktif.');
            if (tampilkanPesan) {
                tampilkanToastFallback('Library barcode belum termuat.');
            }
            return;
        }

        if (!nilai) {
            output.innerHTML = '';
            aturStatusBarcodeFallback('');
            if (tampilkanPesan) {
                tampilkanToastFallback('Isi barcode dulu.');
            }
            return;
        }

        try {
            aturStatusBarcodeFallback('');
            window.JsBarcode(output, nilai, {
                format: format,
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
            aturStatusBarcodeFallback('Format barcode tidak cocok dengan isi yang dimasukkan.');
            if (tampilkanPesan) {
                tampilkanToastFallback('Format barcode tidak cocok dengan isi.');
            }
        }
    }

    function downloadBarcodeFallback() {
        var output = document.getElementById('barcode-output');
        var nilai = document.getElementById('barcode-value')?.value.trim() || 'barcode';

        if (!output || !output.innerHTML.trim()) {
            tampilkanToastFallback('Buat barcode dulu sebelum download.');
            return;
        }

        var svgText = new XMLSerializer().serializeToString(output);
        unduhBlobFallback(new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }), (nilai.replace(/[^a-z0-9_-]+/gi, '-') || 'barcode') + '.svg');
        tampilkanToastFallback('Barcode diunduh.');
    }

    function gantiTabQrFallback(mode) {
        qrModeFallback = mode === 'batch' ? 'batch' : 'solo';
        document.querySelectorAll('[data-qr-tab]').forEach(function (tab) {
            tab.classList.toggle('is-active', tab.dataset.qrTab === qrModeFallback);
        });
        document.querySelectorAll('.qr-panel').forEach(function (panel) {
            panel.classList.toggle('is-active', panel.id === 'qr-panel-' + qrModeFallback);
        });
        buatQrFallback(false);
    }

    function ambilBatchQrFallback() {
        return (document.getElementById('qr-batch-value')?.value || '').split('\n').map(function (baris) {
            return baris.trim();
        }).filter(Boolean);
    }

    function renderQrFallback(target, teks, ukuran) {
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

    function buatQrFallback(tampilkanPesan) {
        var nilai = document.getElementById('qr-value')?.value.trim();
        var ukuran = Number(document.getElementById('qr-size')?.value || 220);
        var output = document.getElementById('qr-output');
        var caption = document.getElementById('qr-caption');
        var outputBatch = document.getElementById('qr-batch-output');
        var includeText = document.getElementById('qr-include-text')?.checked ?? true;

        if (!output || !outputBatch) {
            return;
        }

        function aturStatusQrFallback(targetId, teks) {
            var status = document.getElementById(targetId);
            if (!status) {
                return;
            }
            status.textContent = teks || '';
            status.hidden = !teks;
        }

        output.innerHTML = '';
        outputBatch.innerHTML = '';
        aturStatusQrFallback('qr-status', '');
        aturStatusQrFallback('qr-batch-status', '');
        if (caption) {
            caption.textContent = '';
            caption.hidden = !includeText;
        }

        if (!window.QRCode) {
            aturStatusQrFallback(qrModeFallback === 'batch' ? 'qr-batch-status' : 'qr-status', 'Library QR Code belum termuat. Simpan qrcode.min.js lokal di assets/vendor/ atau coba saat internet aktif.');
            if (tampilkanPesan) {
                tampilkanToastFallback('Library QR Code belum termuat.');
            }
            return;
        }

        if (qrModeFallback === 'batch') {
            var batch = ambilBatchQrFallback();
            if (!batch.length) {
                if (tampilkanPesan) {
                    tampilkanToastFallback('Isi batch QR Code dulu.');
                }
                return;
            }

            batch.slice(0, 24).forEach(function (teks, index) {
                var item = document.createElement('div');
                var kotakQr = document.createElement('div');
                item.className = 'qr-batch-item';
                item.dataset.qrText = teks;
                item.dataset.qrIndex = String(index + 1);
                item.appendChild(kotakQr);
                renderQrFallback(kotakQr, teks, 112);

                if (includeText) {
                    var label = document.createElement('p');
                    label.textContent = teks;
                    item.appendChild(label);
                }

                outputBatch.appendChild(item);
            });
            return;
        }

        if (!nilai) {
            if (tampilkanPesan) {
                tampilkanToastFallback('Isi QR Code dulu.');
            }
            return;
        }

        renderQrFallback(output, nilai, ukuran);
        if (caption && includeText) {
            caption.textContent = nilai;
        }
    }

    async function buatQrCanvasFallback(teks, ukuran, includeText) {
        var pembungkus = document.createElement('div');
        pembungkus.style.position = 'fixed';
        pembungkus.style.left = '-9999px';
        document.body.appendChild(pembungkus);
        renderQrFallback(pembungkus, teks, ukuran);
        var sumberCanvas = pembungkus.querySelector('canvas');

        if (!sumberCanvas) {
            pembungkus.remove();
            throw new Error('QR canvas tidak tersedia');
        }

        var canvas = document.createElement('canvas');
        var padding = 18;
        var tinggiTeks = includeText ? 44 : 0;
        canvas.width = ukuran + padding * 2;
        canvas.height = ukuran + padding * 2 + tinggiTeks;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(sumberCanvas, padding, padding, ukuran, ukuran);

        if (includeText) {
            ctx.fillStyle = '#0f172a';
            ctx.font = '700 14px Inter, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(teks.slice(0, 34), canvas.width / 2, ukuran + padding + 24);
        }

        pembungkus.remove();
        return canvas;
    }

    async function downloadQrFallback() {
        var nilai = document.getElementById('qr-value')?.value.trim() || 'qrcode';
        var ukuran = Number(document.getElementById('qr-size')?.value || 220);
        var includeText = document.getElementById('qr-include-text')?.checked ?? true;
        var canvasPreview = document.getElementById('qr-output')?.querySelector('canvas');

        if (!canvasPreview) {
            tampilkanToastFallback('Buat QR Code dulu sebelum download.');
            return;
        }

        try {
            var canvas = await buatQrCanvasFallback(nilai, ukuran, includeText);
            unduhUrlFallback(canvas.toDataURL('image/png'), (nilai.replace(/[^a-z0-9_-]+/gi, '-') || 'qrcode') + '.png');
            tampilkanToastFallback('QR Code diunduh.');
        } catch (error) {
            tampilkanToastFallback('QR Code belum siap dibuat.');
        }
    }

    async function downloadQrBatchFallback() {
        var batch = ambilBatchQrFallback().slice(0, 24);
        var includeText = document.getElementById('qr-include-text')?.checked ?? true;

        if (!batch.length) {
            tampilkanToastFallback('Buat batch QR Code dulu sebelum download.');
            return;
        }

        if (!window.JSZip) {
            var statusZip = document.getElementById('qr-batch-status');
            if (statusZip) {
                statusZip.textContent = 'Library ZIP belum termuat. Simpan jszip.min.js lokal di assets/vendor/ untuk download batch offline.';
                statusZip.hidden = false;
            }
            tampilkanToastFallback('Library ZIP belum termuat.');
            return;
        }

        if (!window.QRCode) {
            var statusQr = document.getElementById('qr-batch-status');
            if (statusQr) {
                statusQr.textContent = 'Library QR Code belum termuat. Simpan qrcode.min.js lokal di assets/vendor/ atau coba saat internet aktif.';
                statusQr.hidden = false;
            }
            tampilkanToastFallback('Library QR Code belum termuat.');
            return;
        }

        var zip = new window.JSZip();
        for (var index = 0; index < batch.length; index += 1) {
            var teks = batch[index];
            var canvas = await buatQrCanvasFallback(teks, 220, includeText);
            var base64 = canvas.toDataURL('image/png').split(',')[1];
            var namaFile = String(index + 1).padStart(2, '0') + '-' + (teks.replace(/[^a-z0-9_-]+/gi, '-').slice(0, 42) || 'qrcode') + '.png';
            zip.file(namaFile, base64, { base64: true });
        }

        var zipBlob = await zip.generateAsync({ type: 'blob' });
        unduhBlobFallback(zipBlob, 'qr-code-batch.zip');
        tampilkanToastFallback('ZIP QR Code diunduh.');
    }

    function hitungKataFallback() {
        var teks = document.getElementById('word-input')?.value || '';
        var teksTrim = teks.trim();
        var kata = teksTrim ? teksTrim.match(/\S+/g) || [] : [];
        var kalimat = teksTrim ? teksTrim.split(/[.!?]+/).map(function (item) {
            return item.trim();
        }).filter(Boolean) : [];
        var paragraf = teksTrim ? teksTrim.split(/\n\s*\n/).map(function (item) {
            return item.trim();
        }).filter(Boolean) : [];
        var menit = kata.length ? Math.max(1, Math.ceil(kata.length / 200)) : 0;

        setTeksFallback('word-count', kata.length);
        setTeksFallback('char-count', teks.length);
        setTeksFallback('sentence-count', kalimat.length);
        setTeksFallback('paragraph-count', paragraf.length);
        setTeksFallback('reading-time', menit + 'm');
    }

    function setTeksFallback(id, nilai) {
        var elemen = document.getElementById(id);

        if (elemen) {
            elemen.textContent = String(nilai);
        }
    }

    function unduhBlobFallback(blob, namaFile) {
        var url = URL.createObjectURL(blob);
        unduhUrlFallback(url, namaFile);
        URL.revokeObjectURL(url);
    }

    function unduhUrlFallback(url, namaFile) {
        var link = document.createElement('a');
        link.href = url;
        link.download = namaFile;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    function bindFallback() {
        if (window.TOTOOLS_MODULE_BOOTED) {
            return;
        }

        renderModalChromeFallback();
        terapkanTemaFallback();
        renderDesktopAppsFallback();
        renderDockFallback();
        renderDockSettingsFallback();
        renderDesktopSettingsFallback();
        renderStartMenuFallback();
        initToolFallback();

        document.querySelectorAll('[data-tool]').forEach(function (button) {
            if (button.dataset.boundFallbackTool === 'true') {
                return;
            }

            button.addEventListener('click', function () {
                bukaModal(button.dataset.tool);
            });
            button.dataset.boundFallbackTool = 'true';
        });

        document.querySelectorAll('[data-action="close-modal"]').forEach(function (button) {
            button.addEventListener('click', tutupModal);
        });

        document.querySelector('[data-action="theme"]')?.addEventListener('click', gantiTemaFallback);
        document.querySelector('[data-action="toggle-start"]')?.addEventListener('click', function (event) {
            event.stopPropagation();
            toggleStartMenuFallback();
        });
        document.querySelector('[data-action="set-theme"]')?.addEventListener('change', function (event) {
            setTemaFallback(event.target.value);
        });
        document.querySelector('[data-action="reset-theme"]')?.addEventListener('click', resetTemaFallback);
        document.querySelector('[data-action="reset-desktop-layout"]')?.addEventListener('click', resetDesktopLayoutFallback);
        var modeSelect = document.querySelector('[data-action="desktop-layout-mode"]');
        if (modeSelect) {
            modeSelect.value = layoutMode;
            modeSelect.addEventListener('change', function () {
                layoutMode = modeSelect.value;
                localStorage.setItem('totools-desktop-layout-mode', layoutMode);
                renderDesktopAppsFallback();
                tampilkanToastFallback('Mode desktop diperbarui.');
            });
        }

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                tutupModal();
            }

            if (event.altKey || event.ctrlKey || event.metaKey || event.target.matches('input, textarea, select')) {
                return;
            }

            var pintasan = {
                1: 'konversi',
                2: 'translate',
                3: 'barcode',
                4: 'qrcode',
                5: 'settings',
                6: 'wordcounter',
                7: 'collage'
            };

            if (pintasan[event.key]) {
                bukaModal(pintasan[event.key]);
            }
        });

        document.addEventListener('click', function (event) {
            var startMenu = document.getElementById('start-menu');
            var startButton = document.querySelector('[data-action="toggle-start"]');

            if (!startMenu || !startMenu.classList.contains('aktif')) {
                return;
            }

            if (!startMenu.contains(event.target) && !(startButton && startButton.contains(event.target))) {
                startMenu.classList.remove('aktif');
                startMenu.setAttribute('aria-hidden', 'true');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            setTimeout(bindFallback, 250);
        });
    } else {
        setTimeout(bindFallback, 250);
    }
}());
