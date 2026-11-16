import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';

import { cx } from '@/Utils/classNames';

/**
 * Dialog modal bergaya sheet iPhone: naik dari bawah dengan lembut, latar gelap buram.
 * Tutup dengan tombol X, klik latar, atau tombol Escape.
 */
export default function Modal({ open, onClose, title, subtitle, width = 'max-w-lg', children }) {
    const titleId = useId();
    const panel = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (event) => event.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        panel.current?.focus();
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
            <div className="absolute inset-0 animate-fade-in bg-obsidian/45 backdrop-blur-[3px]" onClick={onClose} aria-hidden="true" />
            <div
                ref={panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={cx(
                    'relative max-h-[92vh] w-full animate-sheet-in overflow-y-auto rounded-t-[28px] border border-white/70 bg-panel p-6 shadow-[0_30px_80px_-20px_rgba(6,19,58,0.55)] outline-none sm:rounded-[28px] sm:p-7',
                    width,
                )}
            >
                <span className="mx-auto -mt-2 mb-4 block h-1 w-10 rounded-full bg-line-strong sm:hidden" aria-hidden="true" />
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h2 id={titleId} className="font-display text-[1.75rem] font-semibold leading-tight text-navy">
                            {title}
                        </h2>
                        {subtitle && <p className="mt-0.5 text-[13px] text-faint">{subtitle}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy/[0.06] text-soft transition hover:bg-navy/10 hover:text-navy active:scale-95"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
