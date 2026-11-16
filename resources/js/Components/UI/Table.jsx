import { cx } from '@/Utils/classNames';

/**
 * Tabel data dengan kepala navy (seperti mockup proposal) dan gulir horizontal di layar kecil.
 *
 *   <Table columns={['Menu', 'HPP', 'Harga']} minWidth="min-w-[720px]" footer="Menampilkan 8 data">
 *       {rows.map((row) => (
 *           <TableRow key={row.id}>
 *               <TableCell>{row.name}</TableCell> ...
 *           </TableRow>
 *       ))}
 *   </Table>
 */
export default function Table({ columns, minWidth = 'min-w-[720px]', empty, isEmpty = false, footer, tone = 'navy', className = '', children }) {
    return (
        <div className={cx('overflow-hidden rounded-[20px] border bg-panel', tone === 'navy' ? 'border-navy/60' : 'border-line', className)}>
            <div className="overflow-x-auto">
                <table className={cx('w-full text-left text-sm', minWidth)}>
                    <thead className={cx('text-[11px] uppercase tracking-wider', tone === 'navy' ? 'bg-navy text-white' : 'bg-raised text-faint')}>
                        <tr>
                            {columns.map((column) => (
                                <th key={column} scope="col" className="px-4 py-3 font-bold">
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>{children}</tbody>
                </table>
            </div>
            {isEmpty && <p className="px-4 py-10 text-center text-sm text-faint">{empty ?? 'Belum ada data.'}</p>}
            {footer && <div className="border-t border-line px-4 py-3 text-xs text-faint">{footer}</div>}
        </div>
    );
}

/** Baris tabel. `active` menandai baris terpilih (garis emas di kiri). */
export function TableRow({ active = false, onClick, className = '', children }) {
    return (
        <tr
            onClick={onClick}
            className={cx(
                'border-t border-line transition',
                onClick && 'cursor-pointer',
                active ? 'bg-gold-tint shadow-[inset_3px_0_0_var(--color-gold)]' : onClick && 'hover:bg-raised',
                className,
            )}
        >
            {children}
        </tr>
    );
}

export function TableCell({ className = '', children }) {
    return <td className={cx('px-4 py-3', className)}>{children}</td>;
}
