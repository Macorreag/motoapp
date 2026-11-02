import type {
  Alerta,
  AppState,
  CategoriaMantenimiento,
  Componente,
  Documento,
  EstadoComponente,
  Mantenimiento,
  Tanqueo,
} from "../types";
import { addMonths, daysBetween, daysUntil, isoDate, monthKey, parseISO } from "./format";

export const DIAS_MES = 30.44;

export interface Desgaste {
  componente: Componente;
  restantePct: number; // 0..1 vida útil restante del intervalo
  pctKm: number;
  pctTiempo: number;
  kmRestantes: number;
  kmExcedidos: number; // > 0 cuando ya se pasó del intervalo
  diasRestantes: number;
  proximoKm: number;
  proximoVencimiento: string;
  estado: EstadoComponente;
  kmRecorridos: number;
}

export function desgasteDe(c: Componente, kmActual: number, hoy = isoDate()): Desgaste {
  const kmRecorridos = Math.max(0, kmActual - c.ultimoKm);
  const pctKm = c.intervaloKm > 0 ? clamp(1 - kmRecorridos / c.intervaloKm, 0, 1) : 1;
  const diasIntervalo = c.intervaloMeses * DIAS_MES;
  const diasTranscurridos = Math.max(0, -daysUntil(c.ultimaFecha, hoy));
  const pctTiempo = diasIntervalo > 0 ? clamp(1 - diasTranscurridos / diasIntervalo, 0, 1) : 1;
  const restantePct = Math.min(pctKm, pctTiempo);
  const proximoKm = c.ultimoKm + c.intervaloKm;
  const proximoVencimiento = addMonths(c.ultimaFecha, c.intervaloMeses);
  const kmFaltan = proximoKm - kmActual;
  const kmRestantes = Math.max(0, kmFaltan);
  const diasRestantes = daysUntil(proximoVencimiento, hoy);
  return {
    componente: c,
    restantePct,
    pctKm,
    pctTiempo,
    kmRestantes,
    kmExcedidos: Math.max(0, -kmFaltan),
    diasRestantes,
    proximoKm,
    proximoVencimiento,
    estado: estado(restantePct, kmRestantes, diasRestantes),
    kmRecorridos,
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function estado(restante: number, kmRestantes: number, diasRestantes: number): EstadoComponente {
  if (kmRestantes <= 0 || diasRestantes <= 0 || restante <= 0.02) return "vencido";
  if (restante <= 0.15) return "urgente";
  if (restante <= 0.35) return "proximo";
  return "ok";
}

export const ESTADO_LABEL: Record<EstadoComponente, string> = {
  ok: "Al día",
  proximo: "Próximo",
  urgente: "Urgente",
  vencido: "Vencido",
};

export function desgastes(state: AppState): Desgaste[] {
  const km = state.vehiculo?.kmActual ?? 0;
  return state.componentes
    .filter((c) => c.activo)
    .map((c) => desgasteDe(c, km))
    .sort((a, b) => a.restantePct - b.restantePct);
}

/** Salud del vehículo: promedio ponderado de vida útil restante + castigo por vencimientos legales. */
export function saludVehiculo(state: AppState): number {
  const ds = desgastes(state);
  if (ds.length === 0) return 100;
  const promedio = (ds.reduce((acc, d) => acc + d.restantePct, 0) / ds.length) * 100;
  // Lo legal pesa: es lo que te puede dejar en patios.
  const docs = documentosConVencimiento(state);
  const legales = docs.length === 0 ? 100 : (docs.filter((d) => d.diasRestantes >= 0).length / docs.length) * 100;
  return Math.round(clamp(promedio * 0.55 + legales * 0.45, 0, 100));
}

export interface DocumentoConEstado {
  documento: Documento;
  diasRestantes: number;
  vencido: boolean;
  porVencer: boolean;
}

export function documentosConVencimiento(state: AppState, hoy = isoDate()): DocumentoConEstado[] {
  return state.documentos
    .filter((d) => Boolean(d.fechaVencimiento))
    .map((d) => {
      const diasRestantes = daysUntil(d.fechaVencimiento!, hoy);
      return {
        documento: d,
        diasRestantes,
        vencido: diasRestantes < 0,
        porVencer: diasRestantes >= 0 && diasRestantes <= 30,
      };
    })
    .sort((a, b) => a.diasRestantes - b.diasRestantes);
}

export interface Aviso {
  id: string;
  titulo: string;
  detalle: string;
  severidad: "info" | "atencion" | "critico";
  fecha?: string;
  km?: number;
  destino: "vehiculo" | "alertas" | "mantenimientos" | "pico";
}

/** Avisos del día para el inicio: legales vencidos/por vencer, componentes urgentes, km alto. */
export function avisosDelDia(state: AppState, hoy = isoDate()): Aviso[] {
  const out: Aviso[] = [];
  for (const d of documentosConVencimiento(state, hoy)) {
    if (d.diasRestantes < 0) {
      out.push({
        id: `doc-${d.documento.id}`,
        titulo: `${d.documento.nombre} vencido`,
        detalle: `Venció el ${d.documento.fechaVencimiento} (${Math.abs(d.diasRestantes)} días)`,
        severidad: "critico",
        fecha: d.documento.fechaVencimiento,
        destino: "alertas",
      });
    } else if (d.diasRestantes <= 30) {
      out.push({
        id: `doc-${d.documento.id}`,
        titulo: `${d.documento.nombre} por vencer`,
        detalle: `Vence en ${d.diasRestantes} días`,
        severidad: d.diasRestantes <= 7 ? "critico" : "atencion",
        fecha: d.documento.fechaVencimiento,
        destino: "alertas",
      });
    }
  }
  for (const d of desgastes(state)) {
    if (d.estado === "vencido") {
      out.push({
        id: `comp-${d.componente.id}`,
        titulo: `${d.componente.nombre}: mantenimiento vencido`,
        detalle:
          d.kmExcedidos > 0
            ? `Superaste el intervalo por ${Math.round(d.kmExcedidos)} km`
            : `Vencido por tiempo (${Math.abs(d.diasRestantes)} días)`,
        severidad: "critico",
        fecha: d.proximoVencimiento,
        destino: "mantenimientos",
      });
    } else if (d.estado === "urgente") {
      out.push({
        id: `comp-${d.componente.id}`,
        titulo: `${d.componente.nombre} al ${Math.round(d.restantePct * 100)}% de vida`,
        detalle: `Faltan ${Math.round(d.kmRestantes)} km o ${d.diasRestantes} días`,
        severidad: "atencion",
        fecha: d.proximoVencimiento,
        destino: "mantenimientos",
      });
    }
  }
  for (const a of state.alertas.filter((a) => a.activa && a.fechaVencimiento)) {
    const dias = daysUntil(a.fechaVencimiento!, hoy);
    if (dias < 0 || dias <= a.anticipacionDias) {
      out.push({
        id: `alerta-${a.id}`,
        titulo: a.titulo,
        detalle: dias < 0 ? `Venció hace ${Math.abs(dias)} días` : `Vence en ${dias} días`,
        severidad: dias < 0 ? "critico" : "atencion",
        fecha: a.fechaVencimiento,
        destino: "alertas",
      });
    }
  }
  const orden = { critico: 0, atencion: 1, info: 2 };
  return out.sort((a, b) => orden[a.severidad] - orden[b.severidad]);
}

/* ---------------- Gastos ---------------- */

export function gastos(state: AppState): Mantenimiento[] {
  return [...state.mantenimientos].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
}

export function totalPorMes(state: AppState, meses = 12): { key: string; total: number }[] {
  const hoy = new Date();
  const keys: string[] = [];
  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}`);
  }
  const acc = new Map(keys.map((k) => [k, 0]));
  for (const m of state.mantenimientos) {
    const k = monthKey(m.fecha);
    if (acc.has(k)) acc.set(k, (acc.get(k) ?? 0) + (m.costo || 0));
  }
  return keys.map((key) => ({ key, total: acc.get(key) ?? 0 }));
}

export function totalMes(state: AppState, offset = 0): number {
  const hoy = new Date();
  const d = new Date(hoy.getFullYear(), hoy.getMonth() - offset, 1);
  const k = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}`;
  return state.mantenimientos.filter((m) => monthKey(m.fecha) === k).reduce((a, m) => a + (m.costo || 0), 0);
}

export function combustiblePorMes(state: AppState, meses = 6): { key: string; total: number }[] {
  const hoy = new Date();
  const keys: string[] = [];
  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}`);
  }
  const acc = new Map(keys.map((k) => [k, 0]));
  for (const m of state.mantenimientos) {
    if (!m.tanqueo) continue;
    const k = monthKey(m.fecha);
    if (acc.has(k)) acc.set(k, (acc.get(k) ?? 0) + (m.costo || 0));
  }
  return keys.map((key) => ({ key, total: acc.get(key) ?? 0 }));
}

export function totalPorCategoria(state: AppState): { categoria: CategoriaMantenimiento; total: number; count: number }[] {
  const map = new Map<CategoriaMantenimiento, { total: number; count: number }>();
  for (const m of state.mantenimientos) {
    const prev = map.get(m.categoria) ?? { total: 0, count: 0 };
    map.set(m.categoria, { total: prev.total + (m.costo || 0), count: prev.count + 1 });
  }
  return [...map.entries()]
    .map(([categoria, v]) => ({ categoria, ...v }))
    .sort((a, b) => b.total - a.total);
}

/* ---------------- Combustible ---------------- */

export interface TanqueoConDatos {
  mantenimiento: Mantenimiento;
  tanqueo: Tanqueo;
  rendimientoKmL?: number;
  rendimientoKmGal?: number;
  precioLitro: number;
  costoPorKm?: number;
}

export function tanqueos(state: AppState): TanqueoConDatos[] {
  const lista = state.mantenimientos
    .filter((m) => m.tanqueo)
    .sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : a.km - b.km));

  const out: TanqueoConDatos[] = [];
  let previo: Mantenimiento | null = null;
  for (const m of lista) {
    const t = m.tanqueo!;
    const precioLitro = t.galones > 0 ? t.precioGalon / 3.78541 : 0;
    let rendimientoKmL: number | undefined;
    let costoPorKm: number | undefined;
    if (previo && previo.tanqueo && t.tanqueLleno && previo.tanqueo.tanqueLleno && m.km > previo.km && t.galones > 0) {
      const km = m.km - previo.km;
      rendimientoKmL = km / (t.galones * 3.78541);
      costoPorKm = m.costo / km;
    }
    out.push({
      mantenimiento: m,
      tanqueo: t,
      rendimientoKmL,
      rendimientoKmGal: rendimientoKmL !== undefined ? rendimientoKmL * 3.78541 : undefined,
      precioLitro,
      costoPorKm,
    });
    if (t.tanqueLleno) previo = m;
  }
  return out;
}

export function resumenCombustible(state: AppState) {
  const t = tanqueos(state).filter((x) => x.rendimientoKmL !== undefined);
  const ultimos = t.slice(-5);
  const promedioKmL = ultimos.length ? ultimos.reduce((a, x) => a + (x.rendimientoKmL ?? 0), 0) / ultimos.length : 0;
  const totalGalones = state.mantenimientos.reduce((a, m) => a + (m.tanqueo?.galones ?? 0), 0);
  const totalGasto = state.mantenimientos.reduce((a, m) => a + (m.tanqueo ? m.costo : 0), 0);
  return {
    promedioKmL,
    promedioKmGal: promedioKmL * 3.78541,
    totalGalones,
    totalGasto,
    mediciones: t,
  };
}

/* ---------------- Costos por km ---------------- */

export function costoPorKm(state: AppState): number {
  const v = state.vehiculo;
  if (!v) return 0;
  const candidatos = [
    ...state.mantenimientos.map((m) => m.km),
    ...(v.kmInicial !== undefined ? [v.kmInicial] : []),
  ].filter((n) => Number.isFinite(n));
  const base = candidatos.length ? Math.min(...candidatos) : v.kmActual;
  const kmRecorridos = Math.max(1, v.kmActual - base);
  const total = state.mantenimientos.reduce((a, m) => a + (m.costo || 0), 0);
  return total / kmRecorridos;
}

/* ---------------- Alertas ---------------- */

export function alertasActivas(state: AppState): Alerta[] {
  return state.alertas.filter((a) => a.activa);
}

export function proximoVencimientoLegal(state: AppState): DocumentoConEstado | undefined {
  return documentosConVencimiento(state)[0];
}

export function kmFaltantesProximo(state: AppState): number {
  const ds = desgastes(state);
  if (!ds.length) return 0;
  return Math.min(...ds.map((d) => d.kmRestantes));
}

/** Ritmo de uso en km/día, calculado con el historial real de la moto. */
export function ritmoKmDiario(state: AppState): number {
  const v = state.vehiculo;
  if (!v) return 0;
  const puntos = [
    ...state.mantenimientos.map((m) => ({ fecha: m.fecha, km: m.km })),
    { fecha: isoDate(), km: v.kmActual },
  ].sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  const primero = puntos[0];
  const ultimo = puntos[puntos.length - 1];
  if (!primero || !ultimo) return 0;
  const dias = Math.max(1, daysBetween(primero.fecha, ultimo.fecha));
  const km = Math.max(0, ultimo.km - primero.km);
  return km / dias;
}

/** Días estimados hasta el próximo servicio según el ritmo real de uso. */
export function diasProyectados(d: Desgaste, ritmo: number): number | null {
  if (ritmo <= 0.5) return null;
  return Math.round(d.kmRestantes / ritmo);
}

export function edadMeses(desde: string, hasta = isoDate()): number {
  const a = parseISO(desde);
  const b = parseISO(hasta);
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}
