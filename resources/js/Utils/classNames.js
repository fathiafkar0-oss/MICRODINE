/** Gabungkan nama kelas Tailwind, abaikan nilai kosong/false. */
export function cx(...classes) {
    return classes.filter(Boolean).join(' ');
}

/** Inisial nama untuk avatar, mis. "Dika Kasir" -> "DK". */
export function initials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}
