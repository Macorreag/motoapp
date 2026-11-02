export interface FilaFicha {
  label: string;
  valor: string;
  nota?: string;
}

export interface GrupoFicha {
  titulo: string;
  filas: FilaFicha[];
}

/**
 * Ficha técnica — Yamaha XTZ 250 ABS (manual del propietario B8L-F8199-S0,
 * ficha Yamaha Colombia y manual de taller de la versión carburada 4B41).
 * Ver docs/research/02-xtz250-mantenimiento.md
 */
export const FICHA_XTZ250: GrupoFicha[] = [
  {
    titulo: "Motor",
    filas: [
      { label: "Tipo", valor: "Monocilíndrico 4T, SOHC, 2 válvulas" },
      { label: "Cilindraje", valor: "249 cc", nota: "74,0 × 58,0 mm · 9,8:1" },
      { label: "Refrigeración", valor: "Aire + enfriador de aceite" },
      { label: "Potencia", valor: "20,4 hp @ 8.000 rpm" },
      { label: "Torque", valor: "20,5 N·m @ 6.500 rpm" },
      { label: "Alimentación", valor: "Inyección electrónica", nota: "carburador en 2016–2020" },
      { label: "Transmisión", valor: "5 velocidades · cadena 13/40" },
      { label: "Ralentí", valor: "1.300 – 1.500 rpm" },
    ],
  },
  {
    titulo: "Aceite y filtros",
    filas: [
      { label: "Aceite recomendado", valor: "10W-40 JASO MA/MA2", nota: "API SG o superior" },
      { label: "Capacidad sin filtro", valor: "1,35 L" },
      { label: "Capacidad con filtro", valor: "1,45 L" },
      { label: "Cambio de aceite", valor: "5.000 km o 6 meses", nota: "Bogotá: 3.000–4.000 km" },
      { label: "Filtro de aceite", valor: "Cada 10.000 km", nota: "ref. 38B-E3440-00-00" },
      { label: "Filtro de aire", valor: "Limpiar 5.000 · cambiar 10.000 km" },
      { label: "Bujía", valor: "NGK DR8EA", nota: "gap 0,6–0,7 mm · par 18 N·m" },
    ],
  },
  {
    titulo: "Transmisión y ruedas",
    filas: [
      { label: "Cadena", valor: "428 × 130 eslabones", nota: "holgura 30–40 mm" },
      { label: "Piñón / catalina", valor: "13 / 40 dientes" },
      { label: "Kit de arrastre", valor: "Cambiar ~22.000 km", nota: "13/40 · kit 520H×122 o 428×130" },
      { label: "Llanta delantera", valor: "80/90-21 48S" },
      { label: "Llanta trasera", valor: "120/80-18 62S" },
      { label: "Presión solo", valor: "18 psi delantera · 22 psi trasera" },
      { label: "Presión con pasajero", valor: "22 psi delantera · 29 psi trasera" },
    ],
  },
  {
    titulo: "Frenos y suspensión",
    filas: [
      { label: "Freno delantero", valor: "Disco 245 × 3,5 mm · ABS" },
      { label: "Freno trasero", valor: "Disco 203 × 4,5 mm" },
      { label: "Líquido de frenos", valor: "DOT 4 · cada 2 años", nota: "tubo de freno cada 4 años" },
      { label: "Horquilla", valor: "Telescópica 41 mm · 220 mm" },
      { label: "Suspensión trasera", valor: "Monocross · 205 mm" },
      { label: "Aceite de horquilla", valor: "541 cc por barra" },
    ],
  },
  {
    titulo: "Eléctrico y capacidades",
    filas: [
      { label: "Batería", valor: "12 V · 6 Ah (XTZ7L)", nota: "VRLA libre de mantenimiento" },
      { label: "Tanque", valor: "13,6 L (14 L comercial)", nota: "reserva 3,7 L" },
      { label: "Peso en marcha", valor: "151 – 152 kg" },
      { label: "Altura del asiento", valor: "875 mm" },
      { label: "Altura al suelo", valor: "270 mm" },
      { label: "Consumo real", valor: "28 – 33 km/l", nota: "105 – 125 km/galón" },
    ],
  },
];

export const ENLACES_UTILES = [
  { label: "Manual del propietario (Yamaha)", url: "https://www.yamaha-motor.com.ar/modelo/descargar-manual-de-servicio/xtz-250-abs" },
  { label: "Consulta SOAT y RTM (RUNT)", url: "https://www.runt.gov.co/" },
  { label: "Consulta de multas (SIMIT)", url: "https://www.simit.org.co/" },
  { label: "Pico y placa Bogotá", url: "https://www.movilidadbogota.gov.co/" },
];
