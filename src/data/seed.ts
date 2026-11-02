import type {
  Alerta,
  AppState,
  Ajustes,
  Componente,
  Documento,
  Mantenimiento,
  PuntoEvento,
  Vehiculo,
} from "../types";
import { isoDate } from "../lib/format";
import { PLAN_XTZ250, type DefComponente } from "./catalogo";
import { HISTORIAL_REAL, MOTO_REAL, TALLERES_REALES, TAREAS_SEED } from "./trail";

export const VERSION_ESTADO = 1;

export function ajustesPorDefecto(): Ajustes {
  return {
    nombre: "",
    tema: "auto",
    ciudad: "bogota",
    tipoVehiculo: "moto",
    moneda: "COP",
    mostrarPuntos: true,
    picoPlacaDigitos: {},
    picoPlacaActivo: true,
  };
}

export function estadoInicial(): AppState {
  return {
    version: VERSION_ESTADO,
    vehiculo: null,
    documentos: [],
    componentes: [],
    mantenimientos: [],
    alertas: [],
    talleres: [],
    ordenes: [],
    puntos: [],
    tareas: [],
    ajustes: ajustesPorDefecto(),
    onboardingCompleto: false,
  };
}

export interface DatosOnboarding {
  apodo: string;
  placa: string;
  modelo: number;
  color: string;
  kmActual: number;
  fechaMatricula: string;
  ciudad: string;
  nombre: string;
  soatVence?: string;
  tecnoVence?: string;
  impuestoVence?: string;
}

export function crearVehiculo(d: DatosOnboarding): Vehiculo {
  return {
    id: crypto.randomUUID(),
    placa: d.placa.toUpperCase().trim() || "SIN-PLACA",
    apodo: d.apodo.trim() || "Mi XTZ 250",
    marca: "Yamaha",
    linea: "XTZ 250",
    modelo: d.modelo,
    color: d.color || "Azul",
    cilindraje: 249,
    kmActual: Math.max(0, Math.round(d.kmActual)),
    kmInicial: Math.max(0, Math.round(d.kmActual)),
    fechaMatricula: d.fechaMatricula || isoDate(),
    ciudad: d.ciudad,
    archivado: false,
    creado: isoDate(),
  };
}

export function componentesIniciales(vehiculoId: string, kmBase: number, fechaBase: string): Componente[] {
  return PLAN_XTZ250.map((def: DefComponente, i: number) => ({
    id: `${vehiculoId}-comp-${i}`,
    vehiculoId,
    nombre: def.nombre,
    categoria: def.categoria,
    intervaloKm: def.intervaloKm,
    intervaloMeses: def.intervaloMeses,
    vidaUtilKm: def.vidaUtilKm,
    costoEstimado: def.costoEstimado,
    ultimoKm: kmBase,
    ultimaFecha: fechaBase,
    notas: def.notas,
    activo: true,
    icono: def.categoria,
  }));
}

export function documentosIniciales(vehiculoId: string, d: DatosOnboarding): Documento[] {
  const docs: Documento[] = [];
  const base = { vehiculoId, nombre: "", tipo: "soat" as const };
  if (d.soatVence) {
    docs.push({
      ...base,
      id: crypto.randomUUID(),
      tipo: "soat",
      nombre: "SOAT",
      fechaVencimiento: d.soatVence,
      fechaExpedicion: "",
      entidad: "Aseguradora por confirmar",
      valor: 761400,
    });
  }
  if (d.tecnoVence) {
    docs.push({
      ...base,
      id: crypto.randomUUID(),
      tipo: "tecnomecanica",
      nombre: "Tecnomecánica",
      fechaVencimiento: d.tecnoVence,
    });
  }
  if (d.impuestoVence) {
    docs.push({
      ...base,
      id: crypto.randomUUID(),
      tipo: "impuesto",
      nombre: "Impuesto vehicular",
      fechaVencimiento: d.impuestoVence,
    });
  }
  docs.push({
    ...base,
    id: crypto.randomUUID(),
    tipo: "licencia_transito",
    nombre: "Licencia de tránsito",
    numero: d.placa.toUpperCase(),
  });
  docs.push({
    ...base,
    id: crypto.randomUUID(),
    tipo: "licencia_conduccion",
    nombre: "Licencia de conducción",
  });
  return docs;
}

export function migrar(s: AppState): AppState {
  const base = estadoInicial();
  return {
    ...base,
    ...s,
    documentos: s.documentos ?? [],
    componentes: s.componentes ?? [],
    mantenimientos: s.mantenimientos ?? [],
    alertas: s.alertas ?? [],
    talleres: s.talleres ?? [],
    ordenes: s.ordenes ?? [],
    puntos: s.puntos ?? [],
    tareas: s.tareas ?? [],
    ajustes: { ...ajustesPorDefecto(), ...(s.ajustes ?? {}) },
    version: VERSION_ESTADO,
  };
}

/* ------------------------------------------------------------------ */
/*  Datos de ejemplo (para ver la app llena sin esperar meses de uso)  */
/* ------------------------------------------------------------------ */

function enDias(dias: number): string {
  const h = new Date();
  h.setDate(h.getDate() + dias);
  return isoDate(h);
}

export function estadoDemo(): AppState {
  const hoy = isoDate();
  const vehiculoId = "moto-cam53h";

  const vehiculo: Vehiculo = {
    id: vehiculoId,
    ...MOTO_REAL,
    vin: "",
    numeroMotor: "",
    fechaCompra: "2023-03-20",
    archivado: false,
    creado: "2023-03-15",
  };

  // Componentes: el último servicio conocido es el de 5.000 km (17 dic 2024).
  const base = componentesIniciales(vehiculoId, 5000, "2024-12-17");
  const ajustes: Record<string, Partial<Componente>> = {
    "Llanta trasera": { ultimoKm: 9300, ultimaFecha: "2026-09-23", costoEstimado: 480000 },
    "Lubricación de cadena": { ultimoKm: 9100, ultimaFecha: "2026-10-10" },
    "Presión de llantas": { ultimoKm: 9420, ultimaFecha: hoy },
    "Limpieza y revisión general": { ultimoKm: 9400, ultimaFecha: hoy },
  };
  const componentes: Componente[] = base.map((c) => ({ ...c, ...(ajustes[c.nombre] ?? {}) }));

  const mantenimientos: Mantenimiento[] = HISTORIAL_REAL.map((r, i) => ({
    id: `real-${i}`,
    vehiculoId,
    fecha: r.fecha,
    km: r.km,
    categoria: r.categoria,
    titulo: r.titulo,
    tipo: r.tipo,
    costo: r.costo,
    taller: r.taller,
    descripcion: r.descripcion,
    tanqueo: r.tanqueo,
  }));

  const documentos: Documento[] = [
    {
      id: "doc-lic",
      vehiculoId,
      tipo: "licencia_transito",
      nombre: "Licencia de tránsito",
      numero: MOTO_REAL.placa,
      entidad: "Secretaría de Movilidad de Bogotá",
    },
    {
      id: "doc-seguro",
      vehiculoId,
      tipo: "seguro",
      nombre: "Seguro todo riesgo",
      numero: "PÓLIZA-000000",
      entidad: "Aseguradora",
      notas: "Ejemplo de póliza cancelada · ajusta número y vigencia",
    },
    {
      id: "doc-condu",
      vehiculoId,
      tipo: "licencia_conduccion",
      nombre: "Licencia de conducción",
      numero: "A2",
    },
  ];

  const alertas: Alerta[] = [
    {
      id: "alerta-10k",
      vehiculoId,
      titulo: "Mantenimiento de los 10.000 km",
      detalle: `Faltan ${10000 - MOTO_REAL.kmActual} km. Checklist de 14 puntos en el dashboard.`,
      tipo: "mantenimiento",
      fechaVencimiento: enDias(30),
      anticipacionDias: 30,
      activa: true,
      creada: hoy,
    },
    {
      id: "alerta-gps",
      vehiculoId,
      titulo: "Instalar GPS Self Security",
      detalle: "Tags Samsung y Android ya están ocultos en la moto.",
      tipo: "personalizada",
      fechaVencimiento: enDias(20),
      anticipacionDias: 7,
      activa: true,
      creada: hoy,
    },
  ];

  const puntos: PuntoEvento[] = [
    { id: "p-1", fecha: "2026-10-27", motivo: "Tanqueo registrado", puntos: 5 },
    { id: "p-2", fecha: "2026-10-10", motivo: "Engrase de cadena", puntos: 10 },
    { id: "p-3", fecha: "2026-09-23", motivo: "Llanta Metzeler registrada", puntos: 10 },
    { id: "p-4", fecha: "2024-12-17", motivo: "Mantenimiento 5.000 km", puntos: 10 },
    { id: "p-5", fecha: "2023-03-15", motivo: "Configuraste tu moto", puntos: 50 },
  ];

  return {
    version: VERSION_ESTADO,
    vehiculo,
    documentos,
    componentes,
    mantenimientos,
    alertas,
    talleres: TALLERES_REALES.map((t, i) => ({
      id: `taller-${i}`,
      nombre: t.nombre,
      especialidad: t.especialidad,
      calificacion: t.calificacion,
    })),
    ordenes: [],
    puntos,
    tareas: TAREAS_SEED.map((t) => ({ ...t })),
    ajustes: {
      ...ajustesPorDefecto(),
      nombre: "Miller",
      tema: "oscuro",
      ciudad: "bogota",
      mostrarPuntos: true,
    },
    onboardingCompleto: true,
    esDemo: true,
  };
}
