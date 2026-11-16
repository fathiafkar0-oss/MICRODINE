import { Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import Button from '@/Components/UI/Button';
import { tableQrUrl } from '@/Utils/tables';

/**
 * Kartu QR meja: QR (dipindai pelanggan) + kode barcode (dipindai scanner kasir) + tombol unduh.
 * Dipakai di halaman meja kasir dan halaman Meja & QR admin. `actions` = tombol tambahan (mis. buat ulang QR).
 */
export default function TableQrCard({ table, appUrl, actions }) {
    const url = tableQrUrl(appUrl, table);
    const barcode = `MJ-${table.number}`;
    const svgId = `qr-table-${table.number}`;

    const download = () => {
        const svg = document.getElementById(svgId);
        const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `QR-Meja-${table.number}.svg`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <div className="text-center">
            <div className="mx-auto w-fit rounded-3xl border-2 border-navy bg-white p-5">
                <QRCodeSVG id={svgId} value={url} size={200} level="M" fgColor="#0A1D4B" />
                <p className="mt-3 text-xs font-bold tracking-[0.2em] text-gold">MICRODINE</p>
                <p className="text-2xl font-extrabold text-navy">Meja {table.number}</p>
            </div>
            <p className="mt-3 break-all text-xs text-faint">{url}</p>
            <div className="mt-4 rounded-2xl bg-raised p-3">
                <p className="text-xs text-faint">Kode barcode meja (dibaca barcode scanner kasir)</p>
                <p className="mt-1 font-mono text-lg font-bold tracking-[0.3em] text-ink">{barcode}</p>
            </div>
            <Button variant="navy" block className="mt-4" onClick={download}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Unduh QR (SVG)
            </Button>
            {actions}
        </div>
    );
}
