export const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function money(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  return COP.format(Math.round(n)).replace(/\s/g, " ");
}

export function moneyShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (abs >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
}

export function num(n: number, decimals = 0): string {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** Fecha local en formato YYYY-MM-DD (sin desfase de zona horaria). */
export function isoDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addMonths(s: string, months: number): string {
  const d = parseISO(s);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) d.setDate(0);
  return isoDate(d);
}

export function daysBetween(from: string, to: string): number {
  const a = parseISO(from).getTime();
  const b = parseISO(to).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function daysUntil(dateISO: string, today = isoDate()): number {
  return daysBetween(today, dateISO);
}

export function formatDate(iso: string, style: "corto" | "largo" | "mes" = "corto"): string {
  if (!iso) return "—";
  const d = parseISO(iso);
  if (style === "largo") {
    return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
  }
  if (style === "mes") return `${MESES[d.getMonth()]} ${d.getFullYear()}`;
  return `${d.getDate()} ${MESES_CORTOS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Fecha corta: "16 nov" (con año solo si no es el actual). */
export function formatFechaCorta(iso: string): string {
  if (!iso) return "—";
  const d = parseISO(iso);
  const mismoAnio = d.getFullYear() === new Date().getFullYear();
  return `${d.getDate()} ${MESES_CORTOS[d.getMonth()].toLowerCase()}${mismoAnio ? "" : ` ${d.getFullYear()}`}`;
}

export function formatDayName(iso: string): string {
  return DIAS_CORTOS[parseISO(iso).getDay()];
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MESES_CORTOS[m - 1]} ${`${y}`.slice(2)}`;
}

export function monthShortLabel(key: string): string {
  const [, m] = key.split("-").map(Number);
  return MESES_CORTOS[m - 1];
}

export function relativeDays(days: number): string {
  if (days === 0) return "hoy";
  if (days === 1) return "mañana";
  if (days === -1) return "ayer";
  if (days > 1 && days < 30) return `en ${days} días`;
  if (days >= 30 && days < 365) return `en ${Math.round(days / 30)} meses`;
  if (days >= 365) return `en ${(days / 365).toFixed(1)} años`;
  const a = Math.abs(days);
  if (a < 30) return `hace ${a} días`;
  if (a < 365) return `hace ${Math.round(a / 30)} meses`;
  return `hace ${(a / 365).toFixed(1)} años`;
}

export function saludo(hour = new Date().getHours()): string {
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}
