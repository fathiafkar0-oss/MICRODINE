import MenuThumb from '@/Components/UI/MenuThumb';
import { cx } from '@/Utils/classNames';
import { formatCurrency, formatPercent } from '@/Utils/formatCurrency';
import { RANKING_METRICS } from '@/Utils/menuAnalytics';

const MEDAL = ['bg-gold text-obsidian', 'bg-[#c9ccd6] text-navy', 'bg-[#d9a77a] text-obsidian'];

const formatValue = (metric, value) => (RANKING_METRICS[metric].unit === 'rupiah' ? formatCurrency(value) : `${value.toLocaleString('id-ID')} ${RANKING_METRICS[metric].unit}`);

/** Daftar peringkat dengan batang horizontal yang terisi bergantian. */
export default function MenuRanking({ rows, metric }) {
    const max = Math.max(1, ...rows.map((row) => row[metric]));

    return (
        <ol className="stagger space-y-3" key={metric}>
            {rows.map((row, index) => (
                <li key={row.menuId} className="flex items-center gap-3">
                    <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold tabular-nums', MEDAL[index] ?? 'bg-raised text-soft')}>{index + 1}</span>
                    <MenuThumb menu={row.menu} className="h-10 w-10 shrink-0 rounded-[11px]" iconClass="h-4 w-4" />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                            <p className="truncate text-sm font-bold text-ink">
                                {row.menu.name}
                                {!row.menu.available && <span className="ml-2 rounded-full bg-danger-tint px-2 py-0.5 text-[10px] font-bold text-danger">Habis</span>}
                            </p>
                            <p className="shrink-0 text-sm font-extrabold tabular-nums text-navy">{formatValue(metric, row[metric])}</p>
                        </div>
                        <div className="mt-1.5 h-2 rounded-full bg-raised">
                            <div
                                className={cx('h-full origin-left animate-grow-x rounded-full', index === 0 ? 'bg-gradient-to-r from-gold to-[#dcb76c]' : 'bg-navy/70')}
                                style={{ width: `${(row[metric] / max) * 100}%`, animationDelay: `${150 + index * 60}ms` }}
                            />
                        </div>
                        {metric === 'addedToCart' && (
                            <p className="mt-1 text-xs text-faint">
                                Dilihat {row.views.toLocaleString('id-ID')}× · jadi dibeli{' '}
                                <span className={cx('font-semibold', row.conversion !== null && row.conversion < 0.6 ? 'text-danger' : 'text-success')}>
                                    {row.conversion === null ? '—' : formatPercent(row.conversion)}
                                </span>
                            </p>
                        )}
                        {metric === 'profit' && <p className="mt-1 text-xs text-faint">Margin {formatPercent(row.marginRate)} · {formatCurrency(row.unitMargin)} per porsi</p>}
                    </div>
                </li>
            ))}
        </ol>
    );
}
