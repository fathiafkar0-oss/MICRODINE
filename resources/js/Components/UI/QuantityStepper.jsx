import { Minus, Plus } from 'lucide-react';

/** Pengatur jumlah (− 1 +) untuk menu di katalog dan keranjang. */
export default function QuantityStepper({ name, quantity, onDecrease, onIncrease }) {
    return (
        <div className="flex items-center gap-1 rounded-full border border-line bg-panel p-1">
            <button
                type="button"
                onClick={onDecrease}
                aria-label={`Kurangi ${name}`}
                className="grid h-8 w-8 place-items-center rounded-full text-ink transition hover:bg-raised active:scale-90"
            >
                <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-6 text-center text-sm font-bold" aria-live="polite">
                {quantity}
            </span>
            <button
                type="button"
                onClick={onIncrease}
                aria-label={`Tambah ${name}`}
                className="grid h-8 w-8 place-items-center rounded-full bg-gold text-obsidian transition hover:bg-gold-hover active:scale-90"
            >
                <Plus className="h-4 w-4" />
            </button>
        </div>
    );
}
