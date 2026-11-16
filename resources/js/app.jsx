import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';

const appName = import.meta.env.VITE_APP_NAME || 'MICRODINE';

// Semua halaman ada di resources/js/Pages. Nama komponen Inertia mengikuti path-nya,
// mis. Inertia::render('Cashier/Orders') -> Pages/Cashier/Orders.jsx
const pages = import.meta.glob('./Pages/**/*.jsx');

createInertiaApp({
    title: (title) => (title ? `${title} · ${appName}` : appName),
    resolve: async (name) => {
        const page = pages[`./Pages/${name}.jsx`];
        if (!page) {
            throw new Error(`Halaman Inertia tidak ditemukan: ${name}`);
        }
        return (await page()).default;
    },
    withApp(app) {
        return (
            <>
                {app}
                <Toaster
                    position="top-center"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#0A1D4B',
                            color: '#FFFCF7',
                            borderRadius: '999px',
                            padding: '10px 18px',
                            fontSize: '14px',
                            fontWeight: 600,
                        },
                    }}
                />
            </>
        );
    },
    progress: {
        color: '#CC9E4A',
    },
});
