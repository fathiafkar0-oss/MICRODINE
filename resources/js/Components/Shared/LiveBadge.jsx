import { cx } from '@/Utils/classNames';

/** Label "Live · update otomatis" (sinkronisasi real-time via WebSocket). */
export default function LiveBadge({ className = '' }) {
    return (
        <span className={cx('inline-flex items-center gap-2 rounded-full bg-success-tint px-3 py-1.5 text-xs font-semibold text-success', className)}>
            <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Live · update otomatis
        </span>
    );
}
