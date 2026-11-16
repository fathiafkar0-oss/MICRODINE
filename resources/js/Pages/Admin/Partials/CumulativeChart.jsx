import { formatCurrency } from '@/Utils/formatCurrency';
import { roundTo } from '@/Utils/salesTarget';

const WIDTH = 760;
const HEIGHT = 220;
const LEFT = 46;
const TOP = 18;

/** Grafik garis kumulatif: realisasi (navy), target linear (abu putus-putus), proyeksi (emas). */
export default function CumulativeChart({ target, stats }) {
    const chartW = WIDTH - LEFT - 12;
    const chartH = HEIGHT - TOP - 28;
    const x = (day) => LEFT + ((day - 1) / (target.daysInMonth - 1)) * chartW;
    const y = (value) => TOP + chartH - (value / target.monthlyTarget) * chartH;
    const line = stats.cumulative.map((value, index) => `${x(index + 1)},${y(value)}`).join(' ');
    const last = stats.cumulative.length;
    const ticks = [0, 1 / 3, 2 / 3, 1].map((t) => target.monthlyTarget * t);

    return (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-3 h-auto w-full" role="img" aria-label="Grafik omzet kumulatif dibanding target">
            {ticks.map((value) => (
                <g key={value}>
                    <line x1={LEFT} x2={WIDTH - 12} y1={y(value)} y2={y(value)} stroke="#e9dccb" />
                    <text x={LEFT - 8} y={y(value) + 4} textAnchor="end" fontSize="11" fill="#686b78">
                        {Math.round(value / 1e6)} jt
                    </text>
                </g>
            ))}
            {[1, 5, 10, 15, 20, 25, 30].map((day) => (
                <text key={day} x={x(day)} y={HEIGHT - 8} textAnchor="middle" fontSize="11" fill="#686b78">
                    {day}
                </text>
            ))}
            <line x1={x(1)} y1={y(target.monthlyTarget / target.daysInMonth)} x2={x(target.daysInMonth)} y2={y(target.monthlyTarget)} stroke="#8a8f9c" strokeWidth="2" strokeDasharray="6 5" />
            <line x1={x(last)} y1={y(stats.realised)} x2={x(target.daysInMonth)} y2={y(stats.projection)} stroke="#cc9e4a" strokeWidth="2" strokeDasharray="5 5" />
            <polygon points={`${x(1)},${y(0)} ${line} ${x(last)},${y(0)}`} fill="#0a1d4b" opacity="0.07" />
            <polyline points={line} fill="none" stroke="#0a1d4b" strokeWidth="3" strokeLinejoin="round" />
            <line x1={x(last)} x2={x(last)} y1={TOP} y2={y(0)} stroke="#cc9e4a" strokeDasharray="3 3" />
            <circle cx={x(last)} cy={y(stats.realised)} r="5" fill="#cc9e4a" stroke="#fff" strokeWidth="2" />
            <text x={x(last) + 8} y={TOP + 10} fontSize="11" fontWeight="700" fill="#7a5410">
                Hari ini ({last} Nov)
            </text>
            <text x={x(target.daysInMonth)} y={y(target.monthlyTarget) - 6} textAnchor="end" fontSize="11" fill="#686b78">
                Target {formatCurrency(target.monthlyTarget)}
            </text>
            <text x={x(target.daysInMonth)} y={y(stats.projection) + 18} textAnchor="end" fontSize="11" fontWeight="700" fill="#7a5410">
                Proyeksi {formatCurrency(roundTo(stats.projection, 100000))}
            </text>
        </svg>
    );
}
