/** Judul halaman staf + keterangan + area aksi di kanan. */
export default function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
                <h1 className="text-2xl font-extrabold text-navy md:text-[28px]">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-faint">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}
