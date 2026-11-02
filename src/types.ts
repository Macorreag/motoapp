export type ID = string;

/** Un documento de la "guantera" del vehículo. */
export type TipoDocumento =
  | "soat"
  | "tecnomecanica"
  | "licencia_transito"
  | "licencia_conduccion"
  | "seguro"
  | "impuesto"
  | "otro";

export interface Documento {
  id: ID;
  vehiculoId: ID;
  tipo: TipoDocumento;
  nombre: string;
  numero?: string;
  entidad?: string;
  fechaExpedicion?: string; // YYYY-MM-DD
  fechaVencimiento?: string; // YYYY-MM-DD (vacío = no vence)
  valor?: number;
  notas?: string;
  adjuntoNombre?: string;
  adjuntoDataUrl?: string;
}

export type EstadoComponente = "ok" | "proximo" | "urgente" | "vencido";

/** Componente de desgaste con su plan de mantenimiento. */
export interface Componente {
  id: ID;
  vehiculoId: ID;
  nombre: string;
  categoria: CategoriaMantenimiento;
  intervaloKm: number;
  intervaloMeses: number;
  vidaUtilKm: number; // km de vida total del componente (para el anillo)
  costoEstimado: number; // COP
  ultimoKm: number;
  ultimaFecha: string; // YYYY-MM-DD
  notas?: string;
  activo: boolean;
  icono?: string;
}

export type CategoriaMantenimiento =
  | "aceite"
  | "filtro_aceite"
  | "filtro_aire"
  | "bujia"
  | "arrastre"
  | "frenos"
  | "llantas"
  | "valvulas"
  | "suspension"
  | "bateria"
  | "cadena"
  | "lavado"
  | "combustible"
  | "soat"
  | "tecnomecanica"
  | "impuesto"
  | "otro";

export type TipoMantenimiento = "preventivo" | "correctivo" | "revision";

export interface Tanqueo {
  galones: number;
  precioGalon: number;
  odometro: number;
  tanqueLleno: boolean;
}

export interface Mantenimiento {
  id: ID;
  vehiculoId: ID;
  fecha: string; // YYYY-MM-DD
  km: number;
  categoria: CategoriaMantenimiento;
  titulo: string;
  tipo: TipoMantenimiento;
  costo: number;
  taller?: string;
  descripcion?: string;
  evidencia?: string; // data URL comprimida
  tanqueo?: Tanqueo;
  componenteId?: ID; // si el registro "reinicia" un componente
}

export interface Alerta {
  id: ID;
  vehiculoId: ID;
  titulo: string;
  detalle?: string;
  tipo: "legal" | "mantenimiento" | "personalizada";
  fechaVencimiento?: string;
  kmVencimiento?: number;
  anticipacionDias: number;
  activa: boolean;
  creada: string;
}

export interface Taller {
  id: ID;
  nombre: string;
  telefono?: string;
  direccion?: string;
  especialidad?: string;
  calificacion: number; // 1..5
  notas?: string;
}

export interface OrdenServicio {
  id: ID;
  vehiculoId: ID;
  tallerId?: ID;
  fecha: string;
  km: number;
  concepto: string;
  costo: number;
  calificacion?: number;
  estado: "abierta" | "cerrada";
  notas?: string;
}

export interface Vehiculo {
  id: ID;
  placa: string;
  apodo: string;
  marca: string;
  linea: string;
  modelo: number; // año
  color: string;
  cilindraje: number;
  vin?: string;
  numeroMotor?: string;
  kmActual: number;
  kmInicial?: number; // km al momento de empezar a usar la app (para costo por km)
  fechaMatricula: string; // YYYY-MM-DD
  fechaCompra?: string;
  ciudad: string;
  foto?: string; // data URL
  notas?: string;
  archivado: boolean;
  creado: string;
}

export type TipoTarea = "checklist10k" | "cadena" | "kit" | "pendiente";

export interface Tarea {
  id: ID;
  tipo: TipoTarea;
  titulo: string;
  detalle?: string;
  hecho: boolean;
  prioridad?: "alta" | "media" | "baja";
  orden: number;
}

export interface PuntoEvento {
  id: ID;
  fecha: string;
  motivo: string;
  puntos: number;
}

export interface Ajustes {
  nombre: string;
  tema: "claro" | "oscuro" | "auto";
  ciudad: string;
  tipoVehiculo: "moto" | "carro";
  moneda: "COP";
  mostrarPuntos: boolean;
  picoPlacaDigitos: Record<string, number[]>; // override: dia -> dígitos restringidos
  picoPlacaActivo: boolean;
}

export interface AppState {
  version: number;
  vehiculo: Vehiculo | null;
  documentos: Documento[];
  componentes: Componente[];
  mantenimientos: Mantenimiento[];
  alertas: Alerta[];
  talleres: Taller[];
  ordenes: OrdenServicio[];
  puntos: PuntoEvento[];
  tareas: Tarea[];
  ajustes: Ajustes;
  onboardingCompleto: boolean;
  esDemo?: boolean;
}
