import type { CategoriaMantenimiento, Tarea } from "../types";

/* ------------------------------------------------------------------ */
/*  Datos de ejemplo de la moto (demo pública, sin datos personales)    */
/* ------------------------------------------------------------------ */

export const MOTO_REAL = {
  placa: "ABC12D",
  apodo: "La XTZ",
  marca: "Yamaha",
  linea: "XTZ 250 ABS",
  modelo: 2023,
  color: "Azul Yamaha",
  cilindraje: 249,
  kmActual: 9420,
  kmInicial: 5000,
  fechaMatricula: "2023-03-15",
  ciudad: "Bogotá",
  notas:
    "Uso mixto: ciudad, carretera y off-road (Trail.Hacker). Aceite semisintético 10W-40 cada 5.000 km controlado con TRIP 2.",
};

export const CAPACIDAD_TANQUE_L = 13.6;
export const CONSUMO_REF_KML = 30;

/* ------------------------------------------------------------------ */
/*  Mapa de subsistemas (7 nodos, como el inspector táctico)           */
/* ------------------------------------------------------------------ */

export interface Subsistema {
  id: string;
  nombre: string;
  corto: string;
  icono: string;
  color: string;
  badge: string;
  manual?: string;
  specs: string[];
  alertas: string[];
  herramientas: string[];
  categorias: CategoriaMantenimiento[];
}

export const SUBSISTEMAS: Subsistema[] = [
  {
    id: "arrastre",
    nombre: "Kit de arrastre, cadena y basculante",
    corto: "Arrastre",
    icono: "Link2",
    color: "#f59e0b",
    badge: "Crítico en off-road",
    manual: "Manual de taller pág. 69",
    specs: [
      "Holgura y alineación según la pág. 69 del manual de taller.",
      "Limpiar el piñón de salida (retirar la tapa con copas): acumula barro y desgasta el kit.",
      "Lubricar siempre la cara interna de la cadena y esperar 20–30 min antes de rodar.",
      "Piñón 13 / catalina 40 · cadena 428 × 130.",
    ],
    alertas: [
      "Reemplazar la guía de cadena (pendiente).",
      "Poner plástico protector al basculante y retocar óxido con pintura negra.",
      "Falta candado de cadena de repuesto + herramienta para cadena rota.",
    ],
    herramientas: ["Copas tapa de piñón", "Cepillo 3 caras", "Queroseno", "Desengrasante O-ring", "Lubricante de cadena"],
    categorias: ["arrastre", "cadena"],
  },
  {
    id: "motor",
    nombre: "Motor 249 cc, aceite y filtro",
    corto: "Motor",
    icono: "Droplet",
    color: "#3b82f6",
    badge: "Cada 5.000 km",
    manual: "Manual pág. 52",
    specs: [
      "Aceite semisintético 10W-40 · 1,45 L con filtro.",
      "Control estricto con TRIP 2 cada 5.000 km.",
      "Último mantenimiento oficial de 5.000 km: 17 dic 2024 (concesionario Yamaha).",
      "Filtro de aire lateral: revisión y limpieza en cada servicio.",
    ],
    alertas: ["Mantenimiento de los 10.000 km pendiente (manual pág. 52)."],
    herramientas: ["Copa filtro", "Embudo", "Llave de bujía", "Torquímetro"],
    categorias: ["aceite", "filtro_aceite", "filtro_aire", "bujia", "valvulas"],
  },
  {
    id: "electrico",
    nombre: "Batería, silla y sistema eléctrico",
    corto: "Eléctrico",
    icono: "BatteryCharging",
    color: "#f43f5e",
    badge: "Polaridad crítica",
    manual: "Copa #8",
    specs: [
      "REGLA DE ORO: en la XTZ 250 el borne POSITIVO (+) va a la IZQUIERDA.",
      "Acceso a la batería: retirar la silla con copa #8 (caja roja + extensor).",
      "Kit eléctrico EDC: cinta aislante en lápiz, cables para puentes, fusibles y tester.",
    ],
    alertas: ["Revisar cables que rocen el chasis y forrarlos con cinta de carrocería."],
    herramientas: ["Copa #8", "Ratchet + extensor", "Tester", "Cinta aislante"],
    categorias: ["bateria"],
  },
  {
    id: "tablero",
    nombre: "Tablero LCD, manubrio y tanque",
    corto: "Tablero",
    icono: "Gauge",
    color: "#10b981",
    badge: "TRIP 1 y TRIP 2",
    manual: "Bristol #4",
    specs: [
      "TRIP 1: autonomía de combustible (300–350 km antes de reserva).",
      "TRIP 2: control de los 5.000 km del aceite.",
      "SELECT corto: ODO → TRIP 1 → TRIP 2 → Km/L → AVE → RELOJ. SELECT largo: reinicia el TRIP activo.",
      "Portacelular: ajuste con llave Bristol #4.",
    ],
    alertas: ["Manetas off-road que no se partan en caídas (pendiente).", "Tankbag con ligas para llevar el impermeable a mano."],
    herramientas: ["Bristol #4"],
    categorias: [],
  },
  {
    id: "ruedas",
    nombre: "Llantas Metzeler, frenos y ABS",
    corto: "Ruedas",
    icono: "CircleDot",
    color: "#a855f7",
    badge: "Metzeler nueva",
    manual: "Bristol #6",
    specs: [
      "Llanta trasera Metzeler instalada el 23 sep 2026 en Yamaha: $480.000 COP.",
      "Presión: 18/22 psi solo · 22/29 psi con pasajero (en frío).",
      "Freno trasero: ajuste con llave Bristol #6.",
      "EDC: palancas de coraza, llaves de llantas, parches y bomba eléctrica.",
    ],
    alertas: ["Comprar cámara de repuesto y practicar el cambio completo (pendiente)."],
    herramientas: ["Bristol #6", "Palancas", "Bomba eléctrica", "Parches"],
    categorias: ["llantas", "frenos"],
  },
  {
    id: "chasis",
    nombre: "Chasis, defensas Armo Parts y suspensión",
    corto: "Chasis",
    icono: "Wrench",
    color: "#06b6d4",
    badge: "Copa #8 + Bristol #5",
    manual: "Armo Parts",
    specs: [
      "Defensas Armo Parts: ajuste con copa #8 + Bristol #5.",
      "Mantenimiento preventivo: lijar puntos de óxido en chasis y amortiguadores y pintar con anticorrosivo negro.",
      "Rastreo instalado: Tag Samsung + Tag Android ocultos.",
    ],
    alertas: ["Instalar GPS de Self Security y mantener el expediente fotográfico al día."],
    herramientas: ["Copa #8", "Bristol #5", "Lija", "Pintura anticorrosiva"],
    categorias: ["suspension"],
  },
  {
    id: "seguridad",
    nombre: "Seguridad, seguros y SOS",
    corto: "Seguridad",
    icono: "ShieldCheck",
    color: "#64748b",
    badge: "Tags activos",
    manual: "Pólizas",
    specs: [
      "Tags ocultos: Samsung + Android.",
      "Póliza todo riesgo: registrar número y vigencia en la guantera de documentos.",
      "Protocolo antirrobo: rastrear, denuncia en Fiscalía/SIJIN (SPOA), fotos y cadena.",
    ],
    alertas: ["Instalar GPS Self Security (pendiente)."],
    herramientas: ["Tags", "Cadena", "Expediente fotográfico"],
    categorias: [],
  },
];

/* ------------------------------------------------------------------ */
/*  Tareas semilla: checklist 10k, cadena, kit y pendientes            */
/* ------------------------------------------------------------------ */

function t(
  tipo: Tarea["tipo"],
  titulo: string,
  orden: number,
  hecho = false,
  detalle?: string,
  prioridad?: Tarea["prioridad"],
): Tarea {
  return { id: `${tipo}-${orden}`, tipo, titulo, detalle, hecho, prioridad, orden };
}

export const TAREAS_SEED: Tarea[] = [
  // Checklist mantenimiento 10.000 km (manual pág. 52)
  t("checklist10k", "Cambiar aceite 10W-40 y filtro de aceite", 1),
  t("checklist10k", "Limpiar o cambiar filtro de aire", 2),
  t("checklist10k", "Cambiar bujía NGK DR8EA", 3),
  t("checklist10k", "Calibrar válvulas (motor frío)", 4),
  t("checklist10k", "Revisar holgura y lubricar cadena (pág. 69)", 5),
  t("checklist10k", "Revisar kit de arrastre: piñón, catalina y guía", 6),
  t("checklist10k", "Revisar pastillas de freno delanteras y traseras", 7),
  t("checklist10k", "Cambiar líquido de frenos DOT 4 (cada 2 años)", 8),
  t("checklist10k", "Revisar presión y estado de las llantas", 9),
  t("checklist10k", "Revisar batería y voltaje de carga", 10),
  t("checklist10k", "Revisar suspensión y fugas de horquilla", 11),
  t("checklist10k", "Reapretar fijaciones del bastidor", 12),
  t("checklist10k", "Revisar luces, pito e interruptor de caballete", 13),
  t("checklist10k", "Prueba de ruta y registrar el kilometraje", 14),

  // Asistente de cadena (14 pasos, Notion + Samsung Notes)
  t("cadena", "Limpiar el cepillo en casa con desengrasante o queroseno (con guantes)", 1, true),
  t("cadena", "Calentar la cadena rodando 5–10 min", 2),
  t("cadena", "Retirar la tapa con copas y limpiar a fondo el piñón de salida", 3),
  t("cadena", "Aplicar desengrasante para O-ring y dejar actuar 2–3 min", 4),
  t("cadena", "Pasar el primer trapo desechable (la grasa debe salir suave)", 5),
  t("cadena", "Aplicar desengrasante al cepillo y refregar las zonas difíciles", 6),
  t("cadena", "Pasar el segundo trapo para retirar residuos", 7),
  t("cadena", "Secar por completo con trapo limpio", 8),
  t("cadena", "Con gato lateral, girar la rueda y lubricar la cara interna", 9),
  t("cadena", "Revisar holgura y alineación (pág. 69)", 10),
  t("cadena", "Esperar 20–30 min antes de rodar", 11),
  t("cadena", "Limpieza rápida intermedia: trapo seco + reaplicar lubricante", 12),
  t("cadena", "Anotar el kilometraje del odómetro al terminar", 13),
  t("cadena", "Rotar el punto de inicio para cubrir el 100% de los eslabones", 14),

  // EDC / bodega
  t("kit", "Leatherman Wave+ y ratchet", 1, true, "En moto"),
  t("kit", "Chalecos reflectivos", 2, true, "En moto"),
  t("kit", "Impermeable completo", 3, true, "En moto"),
  t("kit", "Palancas de coraza, parches y llaves de llantas", 4, true, "En moto"),
  t("kit", "Guantes livianos, cuello frío y trapos", 5, true, "En moto"),
  t("kit", "Copas #8 + Bristol #4, #5 y #6", 6, true, "En moto"),
  t("kit", "Cinta aislante (en lápiz) y cables para puentes", 7, true, "En moto"),
  t("kit", "Fusibles de repuesto y tester", 8, true, "Tester en casa"),
  t("kit", "Bomba eléctrica de neumáticos", 9, true, "En moto"),
  t("kit", "Rodilleras, agua y power bank en bolsa estanca", 10, true, "En moto"),
  t("kit", "4 tarros de aceite y 2 filtros", 11, true, "Bodega casa"),
  t("kit", "Guía de cadena XTZ 250", 12, true, "Bodega casa"),
  t("kit", "Plástico protector de basculante", 13, true, "Bodega casa"),
  t("kit", "Pintura anticorrosiva negra", 14, true, "Bodega casa"),
  t("kit", "Maletica EDC que abra completa y se ancle a la moto", 15, false, "Por comprar"),
  t("kit", "Botas de caucho y guantes muy impermeables", 16, false, "Por comprar"),
  t("kit", "Tankbag ajustado con ligas", 17, false, "Por comprar"),
  t("kit", "Candado de cadena + herramienta para cadena rota", 18, false, "Por comprar"),
  t("kit", "Cámara (neumático) de repuesto", 19, false, "Por comprar"),
  t("kit", "Bomba manual de neumáticos", 20, false, "Por comprar"),
  t("kit", "Celular rugerizado para off-road", 21, false, "Por comprar"),

  // Pendientes / backlog
  t("pendiente", "Mantenimiento de los 10.000 km", 1, false, "Manual pág. 52 · próximo hito", "alta"),
  t("pendiente", "Reemplazar guía de cadena", 2, false, "Kit de arrastre", "alta"),
  t("pendiente", "Comprar candado de cadena y herramienta", 3, false, "Off-road", "alta"),
  t("pendiente", "Practicar cambio de cámara en ruta", 4, false, "Salida con bomba y palancas", "alta"),
  t("pendiente", "Instalar GPS Self Security", 5, false, "Seguridad", "alta"),
  t("pendiente", "Plástico protector de basculante", 6, false, "Ya está en casa", "media"),
  t("pendiente", "Lijar y pintar óxido del chasis y amortiguadores", 7, false, "Anticorrosivo negro", "media"),
  t("pendiente", "Manetas off-road que no se partan", 8, false, "Accesorio", "media"),
  t("pendiente", "Tankbag con ligas para el impermeable", 9, false, "Accesorio", "baja"),
];

/* ------------------------------------------------------------------ */
/*  Historial real registrado                                          */
/* ------------------------------------------------------------------ */

export interface RegistroReal {
  fecha: string;
  km: number;
  categoria: CategoriaMantenimiento;
  titulo: string;
  tipo: "preventivo" | "correctivo" | "revision";
  costo: number;
  taller?: string;
  descripcion?: string;
  tanqueo?: { galones: number; precioGalon: number; odometro: number; tanqueLleno: boolean };
}

export const HISTORIAL_REAL: RegistroReal[] = [
  {
    fecha: "2026-10-27",
    km: 9278,
    categoria: "combustible",
    titulo: "Tanqueo corriente",
    tipo: "preventivo",
    costo: 24800,
    tanqueo: { galones: 1.24, precioGalon: 20000, odometro: 9278, tanqueLleno: true },
    descripcion: "TRIP 1 en 142,5 km",
  },
  {
    fecha: "2026-10-10",
    km: 9100,
    categoria: "cadena",
    titulo: "Engrase y tensión de cadena",
    tipo: "preventivo",
    costo: 15000,
    taller: "Casa / gato lateral",
    descripcion: "Protocolo de 14 pasos · holgura pág. 69",
  },
  {
    fecha: "2026-09-23",
    km: 9300,
    categoria: "llantas",
    titulo: "Llanta trasera Metzeler",
    tipo: "correctivo",
    costo: 480000,
    taller: "Yamaha",
    descripcion: "Instalada en concesionario Yamaha · factura archivada",
  },
  {
    fecha: "2025-12-05",
    km: 7050,
    categoria: "otro",
    titulo: "Mantenimiento y diagnóstico (taller de confianza)",
    tipo: "preventivo",
    costo: 395000,
    taller: "Taller de confianza",
    descripcion: "Kilometraje estimado al momento del servicio",
  },
  {
    fecha: "2024-12-17",
    km: 5000,
    categoria: "aceite",
    titulo: "Mantenimiento oficial 5.000 km",
    tipo: "preventivo",
    costo: 110000,
    taller: "Concesionario Yamaha",
    descripcion: "Aceite semisintético 10W-40",
  },
];

export const TALLERES_REALES = [
  { nombre: "Concesionario Yamaha", especialidad: "Servicio autorizado Yamaha", calificacion: 5 },
  { nombre: "Taller de confianza", especialidad: "Mantenimiento y diagnóstico", calificacion: 4 },
  { nombre: "Almacén de repuestos", especialidad: "Repuestos y accesorios", calificacion: 4 },
];
