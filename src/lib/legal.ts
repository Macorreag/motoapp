import { isoDate, parseISO } from "./format";

/** Valores verificados a octubre de 2026 (ver docs/research/03-normativa-colombia.md). */

export const SOAT_2026 = {
  ciclomotor: 124100,
  hasta100: 256200,
  de101a200: 343300,
  mas200: 761400,
  motocarro: 386900,
};

export function soatPorCilindraje(cc: number): number {
  if (cc <= 0) return 0;
  if (cc < 100) return SOAT_2026.hasta100;
  if (cc <= 200) return SOAT_2026.de101a200;
  return SOAT_2026.mas200;
}

export const UVB_2026 = 12110;

export interface Comparendo {
  codigo: string;
  descripcion: string;
  grupo: "A" | "B" | "C" | "D";
  valor: number;
}

export const COMPARENDOS: Comparendo[] = [
  { codigo: "D.2", descripcion: "Conducir sin SOAT vigente", grupo: "D", valor: 1266100 },
  { codigo: "D.1", descripcion: "Conducir sin licencia de conducción", grupo: "D", valor: 1266100 },
  { codigo: "C.35", descripcion: "No portar o no tener revisión técnico-mecánica vigente", grupo: "C", valor: 633200 },
  { codigo: "C.24", descripcion: "No usar casco, luces o llevar parrillero donde no se permite", grupo: "C", valor: 633200 },
  { codigo: "C.14", descripcion: "Circular en pico y placa o Día sin Carro y sin Moto", grupo: "C", valor: 633200 },
  { codigo: "B.1", descripcion: "No portar la licencia de conducción", grupo: "B", valor: 337385 },
];

/** Costo estimado de la RTM en Bogotá 2026 (varía por CDA). */
export const RTM_BOGOTA_2026 = { min: 217781, max: 247490 };

/**
 * Próxima revisión técnico-mecánica de una moto:
 * primera a los 2 años de la matrícula, luego en cada aniversario de matrícula.
 */
export function proximaRTM(
  fechaMatricula: string,
  ultimaRTM: string | null = null,
  hoy = isoDate(),
): string | null {
  const mat = parseISO(fechaMatricula);
  if (Number.isNaN(mat.getTime())) return null;
  const base = new Date(mat.getFullYear() + 2, mat.getMonth(), mat.getDate());
  const actual = parseISO(hoy);
  let candidata = ultimaRTM ? new Date(parseISO(ultimaRTM).getFullYear() + 1, parseISO(ultimaRTM).getMonth(), parseISO(ultimaRTM).getDate()) : base;
  if (ultimaRTM) {
    while (candidata < actual) candidata = new Date(candidata.getFullYear() + 1, candidata.getMonth(), candidata.getDate());
  } else {
    while (candidata < actual) candidata = new Date(candidata.getFullYear() + 1, candidata.getMonth(), candidata.getDate());
  }
  const y = candidata.getFullYear();
  const m = `${candidata.getMonth() + 1}`.padStart(2, "0");
  const d = `${candidata.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const IMPUESTO = {
  bogota: { tarifa: 0.015, etiqueta: "1,5% del avalúo" },
  cundinamarca: { tarifa: 0.017, etiqueta: "1,7% del avalúo (incluye 0,2% Regiotram)" },
};

export function impuestoEstimado(avaluo: number, ciudadId: string, cilindraje: number) {
  if (cilindraje > 0 && cilindraje <= 125) {
    return { exento: true, valor: 0, tarifa: 0, etiqueta: "Motos de 125 cc o menos: exentas" };
  }
  const regla = ciudadId === "bogota" ? IMPUESTO.bogota : IMPUESTO.cundinamarca;
  return {
    exento: false,
    valor: Math.round(avaluo * regla.tarifa),
    tarifa: regla.tarifa,
    etiqueta: regla.etiqueta,
  };
}

export const TRAMITES = {
  licencia: {
    categoria: "A2",
    nota: "Para motos de más de 125 cc. Edad mínima 16 años (art. 19 CNT, Ley 2251 de 2022). Vigencia 10 años para menores de 60.",
    costo: "Aproximado $900.000 – $1.000.000",
  },
  traspaso: "Aproximado $145.500 en Bogotá + retefuente del 1% del avalúo. Exige SOAT y RTM vigentes, paz y salvo de multas e impuesto.",
  guantera:
    "El artículo 135 del Código Nacional de Tránsito permite verificar los documentos por sistemas: no es obligatorio portarlos en físico, pero la app te ayuda a tenerlos a mano y vigentes.",
};

export const DIA_SIN_CARRO_2026 = "2026-02-05";
