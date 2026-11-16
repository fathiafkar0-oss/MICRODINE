import { QRCodeSVG } from 'qrcode.react';

import { tableQrUrl } from '@/Utils/tables';

/**
 * Lembar cetak semua QR meja aktif. Tersembunyi di layar, hanya tampil saat dicetak (window.print()).
 * Ukuran kartu ±8 cm agar mudah dipotong dan ditempel / dimasukkan ke akrilik meja.
 */
export default function QrPrintSheet({ tables, appUrl, restaurantName }) {
    return (
        <section className="hidden print:block" aria-hidden="true">
            <div className="grid grid-cols-2 gap-6">
                {tables.map((table) => (
                    <div key={table.id} className="break-inside-avoid rounded-[18px] border-2 border-navy p-5 text-center">
                        <p className="text-[10px] font-bold tracking-[0.3em] text-gold">{restaurantName.toUpperCase()}</p>
                        <p className="mt-1 font-display text-4xl font-semibold text-navy">Meja {table.number}</p>
                        <div className="mx-auto mt-3 w-fit">
                            <QRCodeSVG value={tableQrUrl(appUrl, table)} size={190} level="M" fgColor="#0A1D4B" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-ink">Scan untuk melihat menu & memesan</p>
                        <p className="mt-2 font-mono text-sm tracking-[0.3em] text-soft">MJ-{table.number}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
