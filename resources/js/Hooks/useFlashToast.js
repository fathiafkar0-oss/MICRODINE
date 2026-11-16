import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Titik integrasi tunggal (Modul G/H): dengarkan setiap respons Inertia dan
 * tampilkan `flash.status` (dari `back()->with('status', ...)` di backend)
 * atau pesan validasi sebagai toast — tanpa perlu menambahkan kode toast
 * manual di setiap halaman yang memanggil `router.post/put/patch`.
 * Dipasang sekali di `app.jsx` (`withApp`).
 */
export default function useFlashToast() {
    useEffect(() => {
        const offSuccess = router.on('success', (event) => {
            const status = event.detail.page.props.flash?.status;
            if (status) toast.success(status);
        });

        const offError = router.on('error', (event) => {
            const errors = event.detail.errors ?? {};
            const first = Object.values(errors)[0];
            if (first) toast.error(Array.isArray(first) ? first[0] : String(first));
        });

        return () => {
            offSuccess();
            offError();
        };
    }, []);
}
