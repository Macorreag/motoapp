import { isoDate, parseISO } from "./format";

export interface ReglaCiudad {
  id: string;
  nombre: string;
  aplicaMotos: boolean;
  /** Día de la semana (0=domingo … 6=sábado) → dígitos restringidos */
  digitosPorDia: Record<number, number[]>;
  usaPrimerDigito: boolean;
  horario: string;
  vigenteDesde: string;
  fuente: string;
  nota: string;
}

/** Rotación vigente en Medellín desde el 3 de agosto de 2026 (motos: primer dígito). */
const MEDELLIN_DIGITOS: Record<number, number[]> = {
  1: [5, 8],
  2: [1, 4],
  3: [0, 2],
  4: [3, 6],
  5: [7, 9],
};

export const CIUDADES: ReglaCiudad[] = [
  {
    id: "bogota",
    nombre: "Bogotá",
    aplicaMotos: false,
    digitosPorDia: {},
    usaPrimerDigito: false,
    horario: "Lunes a viernes, 6:00 a. m. – 9:00 p. m. (solo carros particulares)",
    vigenteDesde: "2026-01-01",
    fuente: "https://www.movilidadbogota.gov.co/",
    nota:
      "En Bogotá las motocicletas no tienen pico y placa. La restricción aplica a vehículos particulares (carros) según el último dígito de la placa. Verifica siempre en la Secretaría de Movilidad.",
  },
  {
    id: "medellin",
    nombre: "Medellín",
    aplicaMotos: true,
    digitosPorDia: MEDELLIN_DIGITOS,
    usaPrimerDigito: true,
    horario: "Lunes a viernes, 5:00 a. m. – 8:00 p. m.",
    vigenteDesde: "2026-08-03",
    fuente: "https://telemedellin.tv/pico-y-placa-medellin/",
    nota:
      "En Medellín las motos sí tienen pico y placa: se restringen dos dígitos por día y cuenta el PRIMER dígito de la placa. Rotación semestral; puedes ajustar los dígitos en Ajustes.",
  },
  {
    id: "cali",
    nombre: "Cali",
    aplicaMotos: false,
    digitosPorDia: {},
    usaPrimerDigito: false,
    horario: "Sin restricción vigente para motos",
    vigenteDesde: "2026-01-01",
    fuente: "https://www.cali.gov.co/",
    nota: "Cali no tiene pico y placa vigente para motocicletas. Consulta la Secretaría de Movilidad por cambios.",
  },
  {
    id: "otra",
    nombre: "Otra ciudad",
    aplicaMotos: false,
    digitosPorDia: {},
    usaPrimerDigito: false,
    horario: "Sin datos locales",
    vigenteDesde: "2026-01-01",
    fuente: "https://www.movilidadbogota.gov.co/",
    nota:
      "No tenemos la rotación de tu ciudad. Configura manualmente los dígitos en Ajustes → Pico y placa para que la app calcule bien.",
  },
];

/** Festivos Colombia 2026 (Ley Emiliani). */
export const FESTIVOS_2026 = new Set([
  "2026-01-01",
  "2026-01-12",
  "2026-03-23",
  "2026-04-02",
  "2026-04-03",
  "2026-05-01",
  "2026-05-18",
  "2026-06-08",
  "2026-06-15",
  "2026-06-29",
  "2026-07-20",
  "2026-08-07",
  "2026-08-17",
  "2026-10-12",
  "2026-11-02",
  "2026-11-16",
  "2026-12-08",
  "2026-12-25",
]);

export function esFestivo(iso: string): boolean {
  return FESTIVOS_2026.has(iso);
}

export function ciudadPorId(id: string): ReglaCiudad {
  return CIUDADES.find((c) => c.id === id) ?? CIUDADES[0];
}

export function primerDigitoPlaca(placa: string): number | null {
  const limpia = placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const m = limpia.match(/\d/);
  return m ? Number(m[0]) : null;
}

export function ultimoDigitoPlaca(placa: string): number | null {
  const digitos = placa.replace(/\D/g, "");
  return digitos.length ? Number(digitos[digitos.length - 1]) : null;
}

export interface ResultadoPico {
  fecha: string;
  diaSemana: number;
  aplica: boolean;
  restringido: boolean;
  digitos: number[];
  digitoVehiculo: number | null;
  horario: string;
  motivo: "sin-restriccion-ciudad" | "no-aplica-dia" | "restringido" | "exceptuado" | "sin-placa";
}

export function evaluarPicoPlaca(
  placa: string,
  fechaISO: string,
  ciudad: ReglaCiudad,
  esMoto: boolean,
  overrides?: Record<string, number[]>,
): ResultadoPico {
  const d = parseISO(fechaISO);
  const dia = d.getDay();
  const digito = ciudad.usaPrimerDigito ? primerDigitoPlaca(placa) : ultimoDigitoPlaca(placa);
  const base: ResultadoPico = {
    fecha: fechaISO,
    diaSemana: dia,
    aplica: esMoto ? ciudad.aplicaMotos : true,
    restringido: false,
    digitos: [],
    digitoVehiculo: digito,
    horario: ciudad.horario,
    motivo: "no-aplica-dia",
  };

  if (esMoto && !ciudad.aplicaMotos) {
    return { ...base, motivo: "sin-restriccion-ciudad" };
  }
  if (dia === 0 || dia === 6) {
    return { ...base, motivo: "no-aplica-dia" };
  }
  if (esFestivo(fechaISO)) {
    return { ...base, motivo: "exceptuado" };
  }

  const digitos = overrides?.[String(dia)] ?? ciudad.digitosPorDia[dia] ?? [];
  if (digitos.length === 0) {
    return { ...base, motivo: "no-aplica-dia" };
  }
  if (digito === null) {
    return { ...base, digitos, motivo: "sin-placa" };
  }
  return {
    ...base,
    digitos,
    restringido: digitos.includes(digito),
    motivo: digitos.includes(digito) ? "restringido" : "no-aplica-dia",
  };
}

export function proximosDias(desde = isoDate(), n = 7): string[] {
  const out: string[] = [];
  const base = parseISO(desde);
  for (let i = 0; i < n; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    out.push(isoDate(d));
  }
  return out;
}
