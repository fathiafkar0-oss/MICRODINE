/**
 * Hitung angka pencapaian dari target bulanan dan omzet harian.
 * target: { monthlyTarget, daysInMonth, daily: number[], weeks: [{ label, range, target }] }
 */
export function analyseTarget(target) {
    const days = target.daily.length;
    const cumulative = target.daily.reduce((list, value) => [...list, (list.at(-1) ?? 0) + value], []);
    const realised = cumulative.at(-1) ?? 0;
    const remainingDays = target.daysInMonth - days;
    const average = realised / Math.max(days, 1);
    const projection = realised + average * remainingDays;

    let cursor = 0;
    const weeks = target.weeks.map((week, index) => {
        const length = index === target.weeks.length - 1 ? target.daysInMonth - 21 : 7;
        const slice = target.daily.slice(cursor, cursor + length);
        const startedAt = cursor;
        cursor += length;
        const value = slice.reduce((sum, day) => sum + day, 0);
        const state = startedAt >= days ? 'belum' : cursor <= days ? 'selesai' : 'berjalan';
        return { ...week, value, state };
    });

    return { days, cumulative, realised, remainingDays, average, projection, needed: (target.monthlyTarget - realised) / Math.max(remainingDays, 1), weeks };
}

/** Bulatkan ke kelipatan tertentu (mis. 1.000) agar angka di layar mudah dibaca. */
export const roundTo = (value, step) => Math.round(value / step) * step;
