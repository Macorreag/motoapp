import type {
  Ajustes,
  Alerta,
  AppState,
  Tarea,
  Componente,
  Documento,
  ID,
  Mantenimiento,
  OrdenServicio,
  Taller,
  Vehiculo,
} from "../types";
import { estadoInicial, migrar } from "../data/seed";
import { isoDate } from "../lib/format";

export const PUNTOS = {
  mantenimiento: 10,
  tanqueo: 5,
  documento: 25,
  alerta: 5,
  onboarding: 50,
  reporte: 3,
} as const;

export function puntosTotales(state: AppState): number {
  return state.puntos.reduce((a, p) => a + p.puntos, 0);
}

function nuevoId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `id-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  }
}

function punto(motivo: string, puntos: number) {
  return { id: nuevoId(), fecha: isoDate(), motivo, puntos };
}

/** Punto único de verdad de las mutaciones: idéntico en navegador y en Apps Script. */
export function aplicarMutacion(state: AppState, accion: string, datos: unknown): AppState {
  switch (accion) {
    case "vehiculo": {
      const patch = datos as Partial<Vehiculo>;
      if (!state.vehiculo) return state;
      return { ...state, vehiculo: { ...state.vehiculo, ...patch } };
    }

    case "mantenimiento:crear": {
      const m = datos as Omit<Mantenimiento, "id" | "vehiculoId">;
      if (!state.vehiculo) return state;
      const nuevo: Mantenimiento = { ...m, id: nuevoId(), vehiculoId: state.vehiculo.id };
      const componentes = state.componentes.map((c) =>
        c.id === m.componenteId
          ? {
              ...c,
              ultimoKm: Math.max(c.ultimoKm, m.km),
              ultimaFecha: m.fecha > c.ultimaFecha ? m.fecha : c.ultimaFecha,
            }
          : c,
      );
      return {
        ...state,
        mantenimientos: [nuevo, ...state.mantenimientos],
        componentes,
        vehiculo: { ...state.vehiculo, kmActual: Math.max(state.vehiculo.kmActual, m.km) },
        puntos: [punto(m.titulo, m.tanqueo ? PUNTOS.tanqueo : PUNTOS.mantenimiento), ...state.puntos],
      };
    }

    case "mantenimiento:actualizar": {
      const { id, patch } = datos as { id: ID; patch: Partial<Mantenimiento> };
      return {
        ...state,
        mantenimientos: state.mantenimientos.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      };
    }

    case "mantenimiento:borrar": {
      const id = datos as ID;
      return { ...state, mantenimientos: state.mantenimientos.filter((m) => m.id !== id) };
    }

    case "documento:guardar": {
      const d = datos as Documento;
      const existe = state.documentos.some((x) => x.id === d.id);
      return {
        ...state,
        documentos: existe ? state.documentos.map((x) => (x.id === d.id ? d : x)) : [...state.documentos, d],
        puntos: existe ? state.puntos : [punto(`Documento: ${d.nombre}`, PUNTOS.documento), ...state.puntos],
      };
    }

    case "documento:borrar": {
      const id = datos as ID;
      return { ...state, documentos: state.documentos.filter((d) => d.id !== id) };
    }

    case "componente:guardar": {
      const c = datos as Componente;
      return {
        ...state,
        componentes: state.componentes.some((x) => x.id === c.id)
          ? state.componentes.map((x) => (x.id === c.id ? c : x))
          : [...state.componentes, c],
      };
    }

    case "componente:borrar": {
      const id = datos as ID;
      return { ...state, componentes: state.componentes.filter((c) => c.id !== id) };
    }

    case "alerta:guardar": {
      const a = datos as Alerta;
      const existe = state.alertas.some((x) => x.id === a.id);
      return {
        ...state,
        alertas: existe ? state.alertas.map((x) => (x.id === a.id ? a : x)) : [...state.alertas, a],
        puntos: existe ? state.puntos : [punto(`Alerta: ${a.titulo}`, PUNTOS.alerta), ...state.puntos],
      };
    }

    case "alerta:borrar": {
      const id = datos as ID;
      return { ...state, alertas: state.alertas.filter((a) => a.id !== id) };
    }

    case "taller:guardar": {
      const t = datos as Taller;
      return {
        ...state,
        talleres: state.talleres.some((x) => x.id === t.id)
          ? state.talleres.map((x) => (x.id === t.id ? t : x))
          : [...state.talleres, t],
      };
    }

    case "taller:borrar": {
      const id = datos as ID;
      return { ...state, talleres: state.talleres.filter((t) => t.id !== id) };
    }

    case "orden:guardar": {
      const o = datos as OrdenServicio;
      return {
        ...state,
        ordenes: state.ordenes.some((x) => x.id === o.id)
          ? state.ordenes.map((x) => (x.id === o.id ? o : x))
          : [o, ...state.ordenes],
      };
    }

    case "orden:borrar": {
      const id = datos as ID;
      return { ...state, ordenes: state.ordenes.filter((o) => o.id !== id) };
    }

    case "tarea:guardar": {
      const t = datos as Tarea;
      return {
        ...state,
        tareas: state.tareas.some((x) => x.id === t.id)
          ? state.tareas.map((x) => (x.id === t.id ? t : x))
          : [...state.tareas, t],
      };
    }

    case "tarea:borrar": {
      const id = datos as ID;
      return { ...state, tareas: state.tareas.filter((t) => t.id !== id) };
    }

    case "tareas:inicializar": {
      const nuevas = datos as Tarea[];
      if (state.tareas.length > 0) return state;
      return { ...state, tareas: nuevas };
    }

    case "tareas:reiniciar": {
      return { ...state, tareas: datos as Tarea[] };
    }

    case "ajustes": {
      const patch = datos as Partial<Ajustes>;
      return { ...state, ajustes: { ...state.ajustes, ...patch } };
    }

    case "puntos": {
      const { motivo, puntos } = datos as { motivo: string; puntos: number };
      return { ...state, puntos: [punto(motivo, puntos), ...state.puntos] };
    }

    case "onboarding": {
      const d = datos as {
        vehiculo: Vehiculo;
        componentes: Componente[];
        documentos: Documento[];
        ajustes: Partial<Ajustes>;
      };
      return {
        ...state,
        vehiculo: d.vehiculo,
        componentes: d.componentes,
        documentos: d.documentos,
        ajustes: { ...state.ajustes, ...d.ajustes },
        onboardingCompleto: true,
        esDemo: false,
        puntos: [punto("Configuraste tu moto", PUNTOS.onboarding), ...state.puntos],
      };
    }

    case "reemplazar": {
      return migrar(datos as AppState);
    }

    case "reiniciar": {
      const base = estadoInicial();
      return { ...base, ajustes: { ...base.ajustes, nombre: state.ajustes.nombre } };
    }

    default:
      return state;
  }
}
