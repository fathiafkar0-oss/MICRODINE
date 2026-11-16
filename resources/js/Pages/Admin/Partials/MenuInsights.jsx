import { CircleCheck, Lightbulb, PackageX, ShoppingCart } from 'lucide-react';

import Card, { CardHeader } from '@/Components/UI/Card';
import { formatPercent } from '@/Utils/formatCurrency';

/** Temuan otomatis: menu yang sering masuk keranjang tapi batal dibeli, dan menu dicari saat habis. */
export default function MenuInsights({ lowConversion, wantedButSoldOut }) {
    const empty = lowConversion.length === 0 && wantedButSoldOut.length === 0;

    return (
        <Card className="h-fit">
            <CardHeader icon={Lightbulb} title="Temuan untuk ditindaklanjuti" />
            <ul className="stagger space-y-3">
                {lowConversion.map((row) => (
                    <li key={`c-${row.menuId}`} className="flex gap-3 rounded-[16px] bg-warn-tint/70 p-3.5">
                        <ShoppingCart className="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-hidden="true" />
                        <p className="text-sm leading-relaxed text-ink">
                            <span className="font-bold">{row.menu.name}</span> masuk keranjang {row.addedToCart}× tapi hanya{' '}
                            <span className="font-bold text-warn">{formatPercent(row.conversion)}</span> yang jadi dibeli.
                            <span className="mt-1 block text-xs text-soft">Cek harga, foto, atau waktu tunggunya, karena pelanggan tertarik tapi batal.</span>
                        </p>
                    </li>
                ))}
                {wantedButSoldOut.map((row) => (
                    <li key={`s-${row.menuId}`} className="flex gap-3 rounded-[16px] bg-danger-tint/70 p-3.5">
                        <PackageX className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
                        <p className="text-sm leading-relaxed text-ink">
                            <span className="font-bold">{row.menu.name}</span> dilihat {row.views}× padahal sedang <span className="font-bold text-danger">habis</span>.
                            <span className="mt-1 block text-xs text-soft">Tambah stok bahan, karena permintaannya ada.</span>
                        </p>
                    </li>
                ))}
                {empty && (
                    <li className="flex items-center gap-3 rounded-[16px] bg-success-tint/70 p-3.5 text-sm text-success">
                        <CircleCheck className="h-4 w-4" aria-hidden="true" />
                        Tidak ada temuan khusus di periode ini.
                    </li>
                )}
            </ul>
        </Card>
    );
}
