let modalAktif = null;
let sedangMenutupDariRiwayat = false;
let fokusSebelumModal = null;

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

export function bukaAlat(idAlat) {
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

    window.dispatchEvent(new CustomEvent('totools:tool-opened', { detail: { id: idAlat } }));
}

export function tutupModal() {
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

export function getModalAktif() {
    return modalAktif;
}

export function refreshEventToolButtons() {
    document.querySelectorAll('[data-tool]').forEach((elemen) => {
        if (elemen.dataset.boundTool === 'true') {
            return;
        }

        elemen.addEventListener('click', () => bukaAlat(elemen.dataset.tool));
        elemen.setAttribute('aria-haspopup', 'dialog');
        elemen.setAttribute('aria-expanded', 'false');
        elemen.dataset.boundTool = 'true';
    });
}

export function initModalShortcuts() {
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
        }
    });
}

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
