import type { CategoriaMantenimiento, TipoDocumento } from "../types";

export interface MetaCategoria {
  label: string;
  corto: string;
  color: string;
  icono: string;
}

export const CATEGORIAS: Record<CategoriaMantenimiento, MetaCategoria> = {
  aceite: { label: "Cambio de aceite", corto: "Aceite", color: "#f97316", icono: "Droplet" },
  filtro_aceite: { label: "Filtro de aceite", corto: "F. aceite", color: "#fb923c", icono: "Filter" },
  filtro_aire: { label: "Filtro de aire", corto: "F. aire", color: "#0891b2", icono: "Wind" },
  bujia: { label: "Bujía", corto: "Bujía", color: "#ca8a04", icono: "Zap" },
  arrastre: { label: "Kit de arrastre", corto: "Arrastre", color: "#7c3aed", icono: "Link2" },
  frenos: { label: "Pastillas de freno", corto: "Frenos", color: "#e11d48", icono: "Disc" },
  llantas: { label: "Llantas", corto: "Llantas", color: "#334155", icono: "CircleDot" },
  valvulas: { label: "Válvulas y sincronización", corto: "Válvulas", color: "#2563eb", icono: "Wrench" },
  suspension: { label: "Suspensión", corto: "Suspensión", color: "#0d9488", icono: "MoveVertical" },
  bateria: { label: "Batería", corto: "Batería", color: "#16a34a", icono: "BatteryCharging" },
  cadena: { label: "Cadena (lubricación y tensión)", corto: "Cadena", color: "#64748b", icono: "Link" },
  lavado: { label: "Lavado", corto: "Lavado", color: "#38bdf8", icono: "SprayCan" },
  combustible: { label: "Tanqueo de combustible", corto: "Combustible", color: "#dc2626", icono: "Fuel" },
  soat: { label: "SOAT", corto: "SOAT", color: "#2563eb", icono: "ShieldCheck" },
  tecnomecanica: { label: "Tecnomecánica", corto: "Tecno", color: "#16a34a", icono: "ClipboardCheck" },
  impuesto: { label: "Impuesto vehicular", corto: "Impuesto", color: "#7c3aed", icono: "Landmark" },
  otro: { label: "Otro", corto: "Otro", color: "#64748b", icono: "Wrench" },
};

export const CATEGORIAS_LISTA = Object.entries(CATEGORIAS).map(([id, meta]) => ({
  id: id as CategoriaMantenimiento,
  ...meta,
}));

export const DOCUMENTOS_META: Record<
  TipoDocumento,
  { label: string; corto: string; icono: string; legal: boolean; mesesVigencia?: number }
> = {
  soat: { label: "SOAT", corto: "SOAT", icono: "ShieldCheck", legal: true, mesesVigencia: 12 },
  tecnomecanica: { label: "Tecnomecánica", corto: "Tecno", icono: "ClipboardCheck", legal: true, mesesVigencia: 12 },
  licencia_transito: { label: "Licencia de tránsito", corto: "Licencia", icono: "CreditCard", legal: true },
  licencia_conduccion: { label: "Licencia de conducción", corto: "Conducción", icono: "IdCard", legal: true },
  seguro: { label: "Seguro todo riesgo", corto: "Seguro", icono: "Shield", legal: false, mesesVigencia: 12 },
  impuesto: { label: "Impuesto vehicular", corto: "Impuesto", icono: "Landmark", legal: true, mesesVigencia: 12 },
  otro: { label: "Otro documento", corto: "Otro", icono: "FileText", legal: false },
};

/** Las 5 posiciones de la guantera (como en Tucamo). */
export const GUANTERA: TipoDocumento[] = [
  "soat",
  "tecnomecanica",
  "seguro",
  "licencia_transito",
  "impuesto",
];

/** Plan de mantenimiento semilla para la Yamaha XTZ 250 (ajustable en la app). */
export interface DefComponente {
  categoria: CategoriaMantenimiento;
  nombre: string;
  intervaloKm: number;
  intervaloMeses: number;
  vidaUtilKm: number;
  costoEstimado: number;
  notas?: string;
}

/**
 * Plan basado en el manual del propietario XTZ250 ABS (B8L-F8199-S0) y en la
 * práctica de talleres de Bogotá. Los km son la referencia oficial; en uso
 * urbano exigente conviene acortarlos (ver notas).
 */
export const PLAN_XTZ250: DefComponente[] = [
  {
    categoria: "aceite",
    nombre: "Cambio de aceite",
    intervaloKm: 5000,
    intervaloMeses: 6,
    vidaUtilKm: 5000,
    costoEstimado: 85000,
    notas: "10W-40 semisintético JASO MA/MA2 (1,45 L con filtro). Oficial: 5.000 km o 6 meses. En Bogotá se puede acortar a 4.000 km.",
  },
  {
    categoria: "filtro_aceite",
    nombre: "Filtro de aceite",
    intervaloKm: 10000,
    intervaloMeses: 12,
    vidaUtilKm: 10000,
    costoEstimado: 25000,
    notas: "Cartucho 38B-E3440-00-00. Se cambia a los 10.000 km, no en cada cambio de aceite.",
  },
  {
    categoria: "filtro_aire",
    nombre: "Filtro de aire",
    intervaloKm: 10000,
    intervaloMeses: 12,
    vidaUtilKm: 10000,
    costoEstimado: 25000,
    notas: "Limpiar cada 5.000 km (2.500–3.000 en polvo) y cambiar a los 10.000 km.",
  },
  {
    categoria: "bujia",
    nombre: "Bujía",
    intervaloKm: 10000,
    intervaloMeses: 24,
    vidaUtilKm: 10000,
    costoEstimado: 20000,
    notas: "NGK DR8EA, gap 0,6–0,7 mm. Revisar en cada servicio.",
  },
  {
    categoria: "valvulas",
    nombre: "Calibración de válvulas",
    intervaloKm: 10000,
    intervaloMeses: 12,
    vidaUtilKm: 10000,
    costoEstimado: 90000,
    notas: "Motor frío. El manual la pide en cada servicio; en la práctica, cada 8.000–10.000 km o si hay ruido.",
  },
  {
    categoria: "arrastre",
    nombre: "Kit de arrastre",
    intervaloKm: 22000,
    intervaloMeses: 48,
    vidaUtilKm: 22000,
    costoEstimado: 250000,
    notas: "Piñón 13 / catalina 40. Cambiar el kit completo; una cadena estirada desgasta la caja.",
  },
  {
    categoria: "cadena",
    nombre: "Lubricación de cadena",
    intervaloKm: 500,
    intervaloMeses: 1,
    vidaUtilKm: 500,
    costoEstimado: 10000,
    notas: "Holgura 30–40 mm. Lubricar cada 500 km y después de lluvia, lavado o polvo.",
  },
  {
    categoria: "frenos",
    nombre: "Pastillas de freno delanteras",
    intervaloKm: 15000,
    intervaloMeses: 24,
    vidaUtilKm: 15000,
    costoEstimado: 60000,
    notas: "Disco de 245 mm. Revisar espesor cada 3.000 km; en ciudad duran menos.",
  },
  {
    categoria: "frenos",
    nombre: "Pastillas de freno traseras",
    intervaloKm: 18000,
    intervaloMeses: 24,
    vidaUtilKm: 18000,
    costoEstimado: 60000,
    notas: "Disco de 203 mm.",
  },
  {
    categoria: "frenos",
    nombre: "Líquido de frenos",
    intervaloKm: 24000,
    intervaloMeses: 24,
    vidaUtilKm: 24000,
    costoEstimado: 60000,
    notas: "DOT 4, cambio cada 2 años. El tubo de freno se cambia cada 4 años.",
  },
  {
    categoria: "llantas",
    nombre: "Llanta delantera",
    intervaloKm: 18000,
    intervaloMeses: 48,
    vidaUtilKm: 18000,
    costoEstimado: 275000,
    notas: "80/90-21. Presión 18 psi solo / 22 psi con pasajero, siempre en frío.",
  },
  {
    categoria: "llantas",
    nombre: "Llanta trasera",
    intervaloKm: 15000,
    intervaloMeses: 36,
    vidaUtilKm: 15000,
    costoEstimado: 430000,
    notas: "120/80-18. Presión 22 psi solo / 29 psi con pasajero.",
  },
  {
    categoria: "llantas",
    nombre: "Presión de llantas",
    intervaloKm: 500,
    intervaloMeses: 1,
    vidaUtilKm: 500,
    costoEstimado: 0,
    notas: "Revisar semanalmente en frío: 18/22 psi (solo) · 22/29 psi (con pasajero).",
  },
  {
    categoria: "suspension",
    nombre: "Aceite de horquilla y retenes",
    intervaloKm: 20000,
    intervaloMeses: 48,
    vidaUtilKm: 20000,
    costoEstimado: 200000,
    notas: "541 cc por barra. Revisar fugas en cada servicio.",
  },
  {
    categoria: "bateria",
    nombre: "Batería",
    intervaloKm: 24000,
    intervaloMeses: 36,
    vidaUtilKm: 24000,
    costoEstimado: 120000,
    notas: "XTZ7L 12 V 6 Ah VRLA. En Bogotá dura 2–3 años; revisar voltaje cada 3 meses.",
  },
  {
    categoria: "lavado",
    nombre: "Limpieza y revisión general",
    intervaloKm: 2000,
    intervaloMeses: 1,
    vidaUtilKm: 2000,
    costoEstimado: 25000,
    notas: "Revisar luces, frenos, cadena, fugas y apriete de fijaciones.",
  },
];

export const LICENCIA_REQUERIDA = {
  cilindraje: 250,
  categoria: "A2",
  nota: "Para motos de más de 125 cc se requiere licencia categoría A2.",
};
