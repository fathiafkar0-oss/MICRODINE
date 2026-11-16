import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';

import { cx } from '@/Utils/classNames';

/** Dialog modal sederhana: tutup dengan tombol X, klik latar, atau tombol Escape. */
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
            <div className="absolute inset-0 animate-fade-in bg-obsidian/55" onClick={onClose} aria-hidden="true" />
            <div
                ref={panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={cx('relative max-h-[92vh] w-full animate-pop-in overflow-y-auto rounded-t-3xl bg-panel p-6 shadow-2xl outline-none sm:rounded-3xl', width)}
            >
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h2 id={titleId} className="text-xl font-extrabold text-navy">
                            {title}
                        </h2>
                        {subtitle && <p className="mt-0.5 text-[13px] text-faint">{subtitle}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold-soft text-obsidian transition hover:bg-gold"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
