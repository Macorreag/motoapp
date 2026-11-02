import { useMemo, useState } from "react";
import { moneyShort, num } from "../lib/format";

export const PALETA = [
  "#f97316",
  "#2563eb",
  "#16a34a",
  "#e11d48",
  "#7c3aed",
  "#0891b2",
  "#ca8a04",
  "#64748b",
  "#db2777",
  "#0d9488",
];

/** Barras verticales por mes. */
export function BarrasMensuales({
  data,
  height = 170,
}: {
  data: { label: string; value: number; sub?: string }[];
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => {
          const h = max > 0 ? Math.max(d.value > 0 ? 4 : 1.5, (d.value / max) * (height - 26)) : 1.5;
          const activo = hover === i;
          return (
            <div
              key={`${d.label}-${i}`}
              className="group relative flex flex-1 flex-col items-center justify-end gap-1"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              tabIndex={0}
              role="img"
              aria-label={`${d.label}: ${moneyShort(d.value)}`}
            >
              {activo && d.value > 0 && (
                <div className="ink absolute -top-1 z-10 rounded-md border border-[var(--line)] bg-[var(--surface)] px-1.5 py-0.5 text-[0.65rem] font-semibold shadow">
                  {moneyShort(d.value)}
                </div>
              )}
              <div
                className="w-full rounded-t-[5px] transition-all"
                style={{
                  height: h,
                  background: d.value > 0 ? "var(--brand)" : "var(--surface-3)",
                  opacity: hover === null || activo ? 1 : 0.45,
                }}
              />
              <span className="ink-3 text-[0.6rem] font-medium">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Dona con centro y leyenda opcional. */
export function Dona({
  data,
  size = 176,
  centroTitulo,
  centroValor,
}: {
  data: { label: string; value: number }[];
  size?: number;
  centroTitulo?: string;
  centroValor?: string;
}) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  let acc = 0;
  const segs = data
    .filter((d) => d.value > 0)
    .map((d, i) => {
      const frac = total > 0 ? d.value / total : 0;
      const seg = { ...d, frac, offset: acc, color: PALETA[i % PALETA.length] };
      acc += frac;
      return seg;
    });
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label="Distribución de gastos">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={16} />
        {segs.map((s) => (
          <circle
            key={s.label}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={16}
            strokeDasharray={`${s.frac * c} ${c}`}
            strokeDashoffset={-s.offset * c}
            strokeLinecap="butt"
            style={{ transition: "stroke-dasharray .5s ease" }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {centroTitulo && <span className="ink-3 text-[0.68rem] font-semibold uppercase tracking-wide">{centroTitulo}</span>}
        <span className="nums ink text-lg font-bold">{centroValor ?? ""}</span>
      </div>
    </div>
  );
}

export function LeyendaDona({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <ul className="flex w-full flex-col gap-2">
      {data.map((d, i) => (
        <li key={d.label} className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PALETA[i % PALETA.length] }} />
          <span className="ink flex-1 truncate">{d.label}</span>
          <span className="nums ink-2 text-xs font-semibold">{moneyShort(d.value)}</span>
          <span className="nums ink-3 w-10 text-right text-xs">
            {total > 0 ? `${Math.round((d.value / total) * 100)}%` : "0%"}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Línea simple para rendimiento. */
export function Linea({
  puntos,
  height = 150,
  unidad = "km/l",
  color = "#2563eb",
}: {
  puntos: { label: string; value: number }[];
  height?: number;
  unidad?: string;
  color?: string;
}) {
  const W = 320;
  const H = height;
  const pad = { l: 28, r: 8, t: 12, b: 20 };
  const vals = puntos.map((p) => p.value);
  const min = Math.min(...vals, 0);
  const max = Math.max(...vals, 1);
  const span = max - min || 1;
  const x = (i: number) => pad.l + (i / Math.max(1, puntos.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - min) / span) * (H - pad.t - pad.b);
  const path = puntos.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${path} L${x(puntos.length - 1).toFixed(1)},${H - pad.b} L${x(0).toFixed(1)},${H - pad.b} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Rendimiento en ${unidad}`}>
      {[0, 0.5, 1].map((t) => (
        <line
          key={t}
          x1={pad.l}
          x2={W - pad.r}
          y1={pad.t + t * (H - pad.t - pad.b)}
          y2={pad.t + t * (H - pad.t - pad.b)}
          stroke="var(--line)"
          strokeDasharray="3 4"
        />
      ))}
      <text x={4} y={pad.t + 4} fontSize="9" fill="var(--ink-3)">
        {num(max, 1)}
      </text>
      <text x={4} y={H - pad.b} fontSize="9" fill="var(--ink-3)">
        {num(min, 1)}
      </text>
      {puntos.length > 1 && <path d={area} fill={color} opacity={0.1} />}
      <path d={path} fill="none" stroke={color} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
      {puntos.map((p, i) => (
        <g key={`${p.label}-${i}`}>
          <circle cx={x(i)} cy={y(p.value)} r={2.8} fill={color} />
          {(i === 0 || i === puntos.length - 1 || puntos.length <= 6) && (
            <text x={x(i)} y={H - 6} fontSize="9" fill="var(--ink-3)" textAnchor="middle">
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export function Sparkline({ valores, color = "var(--brand)" }: { valores: number[]; color?: string }) {
  const W = 120;
  const H = 32;
  const max = Math.max(...valores, 1);
  const min = Math.min(...valores, 0);
  const path = useMemo(
    () =>
      valores
        .map((v, i) => {
          const x = (i / Math.max(1, valores.length - 1)) * W;
          const y = H - ((v - min) / (max - min || 1)) * H;
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" "),
    [valores, max, min],
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProgressDual({
  label,
  pctKm,
  pctTiempo,
}: {
  label: string;
  pctKm: number;
  pctTiempo: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="ink-2 text-[0.7rem] font-semibold uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-2 text-xs">
        <span className="ink-3 w-10">km</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-3)]">
          <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${pctKm * 100}%` }} />
        </div>
        <span className="nums ink-2 w-8 text-right">{Math.round(pctKm * 100)}%</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="ink-3 w-10">tiempo</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-3)]">
          <div className="h-full rounded-full bg-[var(--info)]" style={{ width: `${pctTiempo * 100}%` }} />
        </div>
        <span className="nums ink-2 w-8 text-right">{Math.round(pctTiempo * 100)}%</span>
      </div>
    </div>
  );
}
