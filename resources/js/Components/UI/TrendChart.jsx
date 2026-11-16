import { useState } from 'react';

import { formatCurrency } from '@/Utils/formatCurrency';

/**
 * Grafik batang omzet + garis laba (SVG, tanpa library).
 * data: [{ label, omzet, laba }]. Batang terakhir (hari ini) berwarna navy.
 * Animasi: batang tumbuh dari bawah bergantian, garis laba tergambar dari kiri ke kanan.
 */
export default function TrendChart({ data, height = 260 }) {
    const [hover, setHover] = useState(null);
    const width = 720;
    const pad = { top: 16, right: 12, bottom: 28, left: 12 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;
    const max = Math.max(...data.map((d) => d.omzet)) * 1.1;
    const step = innerW / data.length;
    const barW = Math.min(26, step * 0.55);
    const x = (i) => pad.left + step * i + step / 2;
    const y = (v) => pad.top + innerH - (v / max) * innerH;
    const line = data.map((d, i) => `${x(i)},${y(d.laba)}`).join(' ');
    const active = hover ?? data.length - 1;

    return (
        <div>
            <p className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-soft" aria-live="polite">
                <span className="font-bold text-navy">Tanggal {data[active].label}</span>
                <span>Omzet {formatCurrency(data[active].omzet)}</span>
                <span className="font-semibold text-success">Laba kotor {formatCurrency(data[active].laba)}</span>
            </p>
            <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Tren omzet dan laba kotor harian">
                <defs>
                    <linearGradient id="bar-gold" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#dcb76c" />
                        <stop offset="100%" stopColor="#c39441" />
                    </linearGradient>
                    <linearGradient id="bar-navy" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#1c2f63" />
                        <stop offset="100%" stopColor="#0a1d4b" />
                    </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75, 1].map((t) => (
                    <line key={t} x1={pad.left} x2={width - pad.right} y1={pad.top + innerH * (1 - t)} y2={pad.top + innerH * (1 - t)} stroke="#ebe0d1" strokeDasharray="3 4" />
                ))}
                {data.map((d, i) => (
                    <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                        <rect x={x(i) - step / 2} y={pad.top} width={step} height={innerH} fill="transparent" />
                        <rect
                            x={x(i) - barW / 2}
                            y={y(d.omzet)}
                            width={barW}
                            height={pad.top + innerH - y(d.omzet)}
                            rx={7}
                            fill={i === data.length - 1 ? 'url(#bar-navy)' : 'url(#bar-gold)'}
                            opacity={hover === null || hover === i ? 1 : 0.5}
                            className="animate-grow-y transition-opacity duration-300"
                            style={{ transformBox: 'fill-box', transformOrigin: 'bottom', animationDelay: `${i * 45}ms` }}
                        />
                        <text x={x(i)} y={height - 8} textAnchor="middle" fontSize="11" fill="#686b78">
                            {d.label}
                        </text>
                    </g>
                ))}
                <polyline
                    points={line}
                    fill="none"
                    stroke="#23704b"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    pathLength="1"
                    strokeDasharray="1"
                    className="animate-draw [animation-delay:350ms]"
                />
                {data.map((d, i) => (
                    <circle
                        key={d.label}
                        cx={x(i)}
                        cy={y(d.laba)}
                        r={i === active ? 5.5 : 3.5}
                        fill="#fffdf9"
                        stroke="#23704b"
                        strokeWidth="2"
                        className="animate-fade-in transition-[r] duration-300"
                        style={{ animationDuration: '400ms', animationDelay: `${600 + i * 50}ms`, animationFillMode: 'both' }}
                    />
                ))}
            </svg>
        </div>
    );
}
