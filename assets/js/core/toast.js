let toastTimer = null;

export function tampilkanToast(pesan) {
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
