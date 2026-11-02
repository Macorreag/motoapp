import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BatteryCharging,
  Bike,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleDot,
  Command,
  Droplet,
  Fuel,
  Gauge,
  LayoutGrid,
  Link2,
  ListChecks,
  MapPin,
  MoreHorizontal,
  Package,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Timer,
  Wrench,
} from "lucide-react";
import type { CategoriaMantenimiento, Tarea } from "../types";
import { useApp } from "../store/AppStore";
import {
  desgastes,
  documentosConVencimiento,
  resumenCombustible,
  saludVehiculo,
  totalMes,
  totalPorMes,
  costoPorKm,
} from "../lib/calc";
import { formatDate, isoDate, money, moneyShort, num } from "../lib/format";
import { ciudadPorId, evaluarPicoPlaca } from "../lib/picoPlaca";
import { CAPACIDAD_TANQUE_L, CONSUMO_REF_KML, SUBSISTEMAS, TAREAS_SEED } from "../data/trail";
import { BarrasMensuales } from "../components/charts";
import { Chip, Ring, Segmented } from "../components/ui";
import { Icono } from "../components/iconos";

export type Seccion =
  | "menu"
  | "historial"
  | "plan"
  | "documentos"
  | "alertas"
  | "reportes"
  | "pico"
  | "talleres"
  | "ajustes"
  | "gastos";

/** Posiciones en % calculadas sobre el viewBox del SVG (15 45 375 140). */
const POS: Record<string, { x: number; y: number }> = {
  arrastre: { x: 30.5, y: 72 },
  motor: { x: 52.5, y: 58.5 },
  electrico: { x: 48, y: 35.5 },
  tablero: { x: 72.8, y: 18 },
  ruedas: { x: 80.8, y: 66.5 },
  chasis: { x: 62.5, y: 39.5 },
  seguridad: { x: 24.8, y: 39.5 },
};

export function Dashboard({
  onServicio,
  onTanqueo,
  onAbrir,
  onPuntos,
  onEditarKm,
}: {
  onServicio: (categoria?: CategoriaMantenimiento) => void;
  onTanqueo: () => void;
  onAbrir: (s: Seccion) => void;
  onPuntos: () => void;
  onEditarKm: () => void;
}) {
  const {
    state,
    capacidades,
    guardarVehiculo,
    guardarTarea,
    borrarTarea,
    inicializarTareas,
    reiniciarTareas,
  } = useApp();
  const v = state.vehiculo;

  const [lcd, setLcd] = useState(0);
  const [subId, setSubId] = useState<string>("motor");
  const [verChecklist, setVerChecklist] = useState(false);
  const [verCadena, setVerCadena] = useState(false);
  const [tab, setTab] = useState<"kit" | "pendiente">("kit");
  const [verKit, setVerKit] = useState(false);
  const [nuevoPendiente, setNuevoPendiente] = useState("");
  const [ahora, setAhora] = useState(new Date());
  const [cmd, setCmd] = useState("");
  const [msg, setMsg] = useState("");
  const [timer, setTimer] = useState<{ nombre: string; total: number; restante: number; activo: boolean } | null>(null);
  const [dockVisible, setDockVisible] = useState(true);
  const relojRef = useRef<number | null>(null);
  const sembradoRef = useRef(false);

  useEffect(() => {
    let anterior = window.scrollY;
    const alScroll = () => {
      const y = window.scrollY;
      if (y < 90) setDockVisible(true);
      else if (y > anterior + 14) setDockVisible(false);
      else if (y < anterior - 14) setDockVisible(true);
      anterior = y;
    };
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setAhora(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (sembradoRef.current) return;
    if (state.tareas.length === 0 && state.vehiculo) {
      sembradoRef.current = true;
      inicializarTareas(TAREAS_SEED.map((t) => ({ ...t })));
    }
  }, [state.tareas.length, state.vehiculo, inicializarTareas]);

  useEffect(() => {
    if (!timer || !timer.activo) return;
    relojRef.current = window.setInterval(() => {
      setTimer((t) => {
        if (!t || !t.activo) return t;
        if (t.restante <= 1) return { ...t, restante: 0, activo: false };
        return { ...t, restante: t.restante - 1 };
      });
    }, 1000);
    return () => {
      if (relojRef.current) window.clearInterval(relojRef.current);
    };
  }, [timer]);

  const ds = useMemo(() => desgastes(state), [state]);
  const salud = saludVehiculo(state);
  if (!v) return null;

  const aceite = state.componentes.find((c) => c.categoria === "aceite");
  const cadena = state.componentes.find((c) => c.categoria === "cadena");
  const ultimoTanqueo = [...state.mantenimientos]
    .filter((m) => m.tanqueo)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0];
  const comb = resumenCombustible(state);
  const kmL = comb.promedioKmL > 0 ? comb.promedioKmL : CONSUMO_REF_KML;

  const trip1 = ultimoTanqueo ? Math.max(0, v.kmActual - ultimoTanqueo.km) : 0;
  const trip2 = aceite ? Math.max(0, v.kmActual - aceite.ultimoKm) : 0;
  const litrosUsados = Math.min(CAPACIDAD_TANQUE_L, trip1 / kmL);
  const fuelPct = Math.max(0, Math.min(1, 1 - litrosUsados / CAPACIDAD_TANQUE_L));
  const autonomia = Math.max(0, Math.round((CAPACIDAD_TANQUE_L - litrosUsados) * kmL));
  const hito = Math.ceil((v.kmActual + 1) / 5000) * 5000;
  const faltanHito = hito - v.kmActual;
  const aceitePct = Math.max(0, Math.min(1, 1 - trip2 / 5000));

  const tareas = state.tareas;
  const check = tareas.filter((t) => t.tipo === "checklist10k").sort((a, b) => a.orden - b.orden);
  const cadenaPasos = tareas.filter((t) => t.tipo === "cadena").sort((a, b) => a.orden - b.orden);
  const kit = tareas.filter((t) => t.tipo === "kit").sort((a, b) => a.orden - b.orden);
  const pendientes = tareas
    .filter((t) => t.tipo === "pendiente")
    .sort((a, b) => Number(a.hecho) - Number(b.hecho) || (a.prioridad === "alta" ? -1 : 1) - (b.prioridad === "alta" ? -1 : 1) || a.orden - b.orden);

  const hechos = check.filter((t) => t.hecho).length;
  const cadenaHechos = cadenaPasos.filter((t) => t.hecho).length;
  const kitListos = kit.filter((t) => t.hecho).length;
  const pendientesHechos = pendientes.filter((t) => t.hecho).length;

  const manual = state.documentos.filter((d) => ["soat", "tecnomecanica", "impuesto"].includes(d.tipo) && d.fechaVencimiento);
  const docsVenc = documentosConVencimiento(state);
  const ciudad = ciudadPorId(state.ajustes.ciudad);
  const pico = evaluarPicoPlaca(v.placa, isoDate(), ciudad, true, state.ajustes.picoPlacaDigitos);
  const mes = totalMes(state, 0);
  const porKm = costoPorKm(state);
  const serie = totalPorMes(state, 6).map((m) => ({ label: m.key.slice(5), value: m.total }));

  const lcdItems = [
    { etiqueta: "ODO", valor: num(v.kmActual), unidad: "km" },
    { etiqueta: "TRIP 1 · GAS", valor: num(trip1, 1), unidad: "km" },
    { etiqueta: "TRIP 2 · ACEITE", valor: num(trip2), unidad: "km" },
    { etiqueta: "RENDIMIENTO", valor: num(kmL, 1), unidad: "km/l" },
    { etiqueta: "AUTONOMÍA", valor: num(autonomia), unidad: "km" },
    { etiqueta: "RELOJ", valor: ahora.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }), unidad: "" },
  ];
  const actual = lcdItems[lcd % lcdItems.length];

  function estadoSub(s: (typeof SUBSISTEMAS)[number]) {
    const rel = ds.filter((d) => s.categorias.includes(d.componente.categoria));
    if (rel.length === 0) return { tono: "info" as const, texto: "Sin datos" };
    if (rel.some((d) => d.estado === "vencido")) return { tono: "bad" as const, texto: "Vencido" };
    const min = Math.min(...rel.map((d) => d.restantePct));
    if (min <= 0.15) return { tono: "bad" as const, texto: "Urgente" };
    if (min <= 0.35) return { tono: "warn" as const, texto: "Próximo" };
    return { tono: "ok" as const, texto: "Al día" };
  }

  const sub = SUBSISTEMAS.find((s) => s.id === subId) ?? SUBSISTEMAS[0];
  const subEstado = estadoSub(sub);

  function alternar(t: Tarea) {
    guardarTarea({ ...t, hecho: !t.hecho });
  }

  function iniciarTimer(nombre: string, minutos: number) {
    setTimer({ nombre, total: minutos * 60, restante: minutos * 60, activo: true });
  }

  function ejecutar(e: React.FormEvent) {
    e.preventDefault();
    const texto = cmd.trim();
    if (!texto) return;
    const [k, ...resto] = texto.toLowerCase().split(/\s+/);
    const moto = state.vehiculo;
    if (!moto) return;
    if (k === "km" || k === "odometro" || k === "odómetro") {
      const n = Math.round(Number(resto[0]));
      if (!Number.isFinite(n) || n < 0) return setMsg("Uso: km 9500");
      if (n < moto.kmActual - 200 && !window.confirm(`El odómetro bajaría de ${num(moto.kmActual)} a ${num(n)} km. ¿Seguro?`)) return;
      guardarVehiculo({ kmActual: n });
      setMsg(`Odómetro actualizado a ${num(n)} km.`);
    } else if (k === "nodo") {
      const n = Number(resto[0]);
      const s = SUBSISTEMAS[n - 1];
      if (!s) return setMsg("Uso: nodo 1 a 7");
      setSubId(s.id);
      document.getElementById("mapa")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setMsg(`Nodo ${n}: ${s.nombre}`);
    } else if (k === "cadena") {
      document.getElementById("cadena")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setMsg("Asistente de cadena listo.");
    } else if (k === "servicio" || k === "mantenimiento") {
      onServicio();
      setMsg("Abriendo registro de servicio…");
    } else if (k === "tanqueo" || k === "gasolina") {
      onTanqueo();
      setMsg("Abriendo tanqueo…");
    } else if (k === "checklist") {
      document.getElementById("checklist")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setMsg("Checklist de los 10.000 km.");
    } else if (k === "ayuda" || k === "help" || k === "?") {
      setMsg("Comandos: km 9500 · nodo 3 · cadena · checklist · servicio · tanqueo");
    } else {
      setMsg(`No reconozco “${texto}”. Escribe “ayuda”.`);
    }
    setCmd("");
  }

  return (
    <div className="flex flex-col gap-4 pb-32">
      {/* ---------------- Barra superior ---------------- */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
            style={{ background: "linear-gradient(135deg,#fb923c,#ea580c)" }}
          >
            <Bike size={18} />
          </span>
          <div className="leading-tight">
            <p className="ink text-[0.86rem] font-extrabold tracking-tight">MotoApp</p>
            <p className="ink-3 text-[0.58rem] font-bold uppercase tracking-[0.18em]">Trail.Hacker OS</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="icon-btn" onClick={() => onAbrir("ajustes")} aria-label="Ajustes">
            <Wrench size={15} />
          </button>
          <button
            className="icon-btn"
            onClick={() => onAbrir("alertas")}
            aria-label="Alertas"
          >
            <ShieldCheck size={15} />
          </button>
        </div>
      </div>

      {/* ---------------- HUD ---------------- */}
      <div className="hud p-4 sm:p-5">
        <div className="hud-glow" style={{ background: "#0ea5e9", top: -120, right: -80 }} />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <span className="chip-dark" style={{ background: "rgba(16,185,129,.16)", color: "#6ee7b7", borderColor: "rgba(16,185,129,.35)" }}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> OPERATIVA
              </span>
              <span className="chip-dark">ABS OK</span>
              <span className="chip-dark">TAGS ✓</span>
            </div>
            <h1 className="truncate text-[1.15rem] font-extrabold leading-tight text-white">
              {v.marca} {v.linea}
            </h1>
            <p className="nums text-[0.74rem] text-slate-400">
              {v.placa} · {num(v.kmActual)} km · {v.ciudad}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Ring value={salud / 100} size={58} stroke={5}>
              <span className="nums text-[0.8rem] font-extrabold text-white">{salud}%</span>
            </Ring>
            <span className="mt-0.5 text-[0.56rem] font-bold uppercase tracking-widest text-slate-500">Salud</span>
          </div>
        </div>

        <div className="relative mt-4 grid gap-3 sm:grid-cols-[1.15fr_1fr]">
          {/* LCD */}
          <button
            onClick={() => setLcd((n) => n + 1)}
            className="lcd p-3.5 text-left"
            aria-label="Cambiar dato del tablero"
          >
            <div className="flex items-center justify-between text-[0.58rem] font-bold uppercase tracking-widest opacity-70">
              <span>XTZ 250 · HUD</span>
              <span>{v.placa}</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="lcd-seg nums text-[2.05rem] font-extrabold leading-none">{actual.valor}</span>
              <span className="text-[0.72rem] font-bold opacity-70">{actual.unidad}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[0.6rem] font-bold uppercase tracking-widest opacity-70">{actual.etiqueta}</span>
              <span className="rounded border border-black/20 px-1.5 py-0.5 text-[0.55rem] font-bold">SELECT</span>
            </div>
            <div className="mt-2 flex gap-1">
              {lcdItems.map((_, i) => (
                <span
                  key={i}
                  className="h-1 flex-1 rounded-full"
                  style={{ background: i === lcd % lcdItems.length ? "#0a1a11" : "rgba(10,26,17,.22)" }}
                />
              ))}
            </div>
          </button>

          {/* Barras */}
          <div className="flex flex-col justify-between gap-2.5">
            <div>
              <div className="flex items-center justify-between text-[0.66rem] font-semibold text-slate-400">
                <span className="flex items-center gap-1">
                  <Fuel size={11} /> Combustible
                </span>
                <span className="nums text-slate-300">{Math.round(fuelPct * 100)}%</span>
              </div>
              <div className="mt-1 flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="h-2 flex-1 rounded-sm"
                    style={{ background: fuelPct * 5 > i ? "#34d399" : "rgba(148,163,184,.18)" }}
                  />
                ))}
              </div>
              <p className="nums mt-1 text-[0.62rem] text-slate-500">≈ {num(autonomia)} km de autonomía</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-[0.66rem] font-semibold text-slate-400">
                <span className="flex items-center gap-1">
                  <Droplet size={11} /> Aceite
                </span>
                <span className="nums text-slate-300">
                  {num(trip2)} / 5.000 km
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-700/40">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{ width: `${Math.max(2, aceitePct * 100)}%`, background: aceitePct > 0.35 ? "#38bdf8" : aceitePct > 0.15 ? "#fbbf24" : "#f87171" }}
                />
              </div>
              <p className="nums mt-1 text-[0.62rem] text-slate-500">
                {aceitePct > 0.02 ? `Faltan ${num(5000 - trip2)} km para el cambio` : "Cambio de aceite vencido"}
              </p>
            </div>

            <div className="rounded-xl border border-orange-400/25 bg-orange-400/10 px-2.5 py-2">
              <p className="text-[0.58rem] font-bold uppercase tracking-widest text-orange-300">Próximo hito</p>
              <p className="nums text-[0.9rem] font-extrabold text-white">
                {num(hito)} km · faltan {num(faltanHito)}
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2">
          <HudStat etiqueta="Registros" valor={String(state.mantenimientos.length)} />
          <HudStat etiqueta="Invertido" valor={moneyShort(state.mantenimientos.reduce((a, m) => a + m.costo, 0))} />
          <HudStat etiqueta="Puntos" valor={num(state.puntos.reduce((a, p) => a + p.puntos, 0))} onClick={onPuntos} />
        </div>

        <div className="relative mt-3 flex gap-2">
          <button className="btn btn-primary flex-1 py-2.5 text-[0.8rem]" onClick={() => onServicio()}>
            <Plus size={15} /> Servicio
          </button>
          <button className="btn flex-1 border border-slate-600/60 bg-slate-800/60 py-2.5 text-[0.8rem] text-slate-200 hover:bg-slate-700/60" onClick={onTanqueo}>
            <Fuel size={15} /> Tanqueo
          </button>
          <button
            className="btn border border-slate-600/60 bg-slate-800/60 px-3 py-2.5 text-slate-200 hover:bg-slate-700/60"
            onClick={onEditarKm}
            aria-label="Editar kilometraje"
          >
            <Gauge size={15} />
          </button>
        </div>
      </div>

      {/* ---------------- Mapa de subsistemas ---------------- */}
      <div id="mapa" className="bike-map p-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[0.92rem] font-bold text-slate-100">Mapa de subsistemas</h2>
          <span className="chip-dark">7 nodos</span>
        </div>

        <div className="relative mt-2 overflow-hidden rounded-xl">
          <svg viewBox="15 45 375 140" className="w-full" role="img" aria-label="Esquema de la Yamaha XTZ 250">
            <defs>
              <linearGradient id="motoGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            {/* piso */}
            <line x1="20" y1="172" x2="380" y2="172" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 6" />
            {/* ruedas */}
            <circle cx="82" cy="138" r="34" fill="none" stroke="#334155" strokeWidth="7" />
            <circle cx="82" cy="138" r="22" fill="none" stroke="#1e293b" strokeWidth="1.5" />
            <circle cx="318" cy="138" r="36" fill="none" stroke="#334155" strokeWidth="7" />
            <circle cx="318" cy="138" r="24" fill="none" stroke="#1e293b" strokeWidth="1.5" />
            {/* basculante */}
            <line x1="82" y1="138" x2="182" y2="126" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
            {/* cadena */}
            <path d="M82 152 L182 140" stroke="#f59e0b" strokeWidth="2.6" strokeDasharray="3 3" strokeLinecap="round" />
            {/* chasis */}
            <path d="M182 126 L214 96 L262 96 L286 118" fill="none" stroke="url(#motoGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {/* motor */}
            <rect x="186" y="112" width="52" height="30" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <line x1="196" y1="112" x2="196" y2="142" stroke="#334155" strokeWidth="2" />
            <line x1="208" y1="112" x2="208" y2="142" stroke="#334155" strokeWidth="2" />
            <line x1="220" y1="112" x2="220" y2="142" stroke="#334155" strokeWidth="2" />
            {/* tanque y silla */}
            <path d="M212 92 L246 78 L272 82 L282 96 L252 100 Z" fill="#0b3f8f" stroke="#3b82f6" strokeWidth="1.5" opacity="0.9" />
            <path d="M168 92 L214 92 L222 100 L176 104 Z" fill="#111827" stroke="#334155" strokeWidth="1.5" />
            {/* horquilla y manubrio */}
            <line x1="318" y1="138" x2="292" y2="76" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
            <line x1="292" y1="76" x2="268" y2="66" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            <path d="M286 70 L306 64" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
            {/* faro */}
            <circle cx="306" cy="70" r="9" fill="#fde68a" opacity="0.9" />
            <circle cx="306" cy="70" r="14" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.5" />
            {/* escape */}
            <path d="M206 146 L150 152 L120 150" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            {/* defensas */}
            <path d="M212 112 C204 100 206 92 214 86" stroke="#22d3ee" strokeWidth="2.5" fill="none" />
            <path d="M262 112 C270 100 268 92 260 86" stroke="#22d3ee" strokeWidth="2.5" fill="none" />
            {/* guardabarros alto */}
            <path d="M286 92 C300 88 312 92 316 100" stroke="#38bdf8" strokeWidth="3" fill="none" />
            {/* portaplaca */}
            <rect x="98" y="96" width="20" height="12" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
          </svg>

          {SUBSISTEMAS.map((s, i) => {
            const p = POS[s.id] ?? { x: 50, y: 50 };
            return (
              <button
                key={s.id}
                className={`hotspot ${subId === s.id ? "active" : ""}`}
                style={{ left: `${p.x}%`, top: `${p.y}%`, color: subId === s.id ? "#1a1005" : s.color }}
                onClick={() => setSubId(s.id)}
                aria-label={s.nombre}
                title={s.nombre}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-3 rounded-xl border border-slate-700/70 bg-slate-900/60 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-[0.88rem] font-bold leading-snug text-white">{sub.nombre}</h3>
              <p className="mt-0.5 text-[0.66rem] text-slate-400">
                {sub.badge}
                {sub.manual ? ` · ${sub.manual}` : ""}
              </p>
            </div>
            <Chip tono={subEstado.tono}>{subEstado.texto}</Chip>
          </div>

          <ul className="mt-2 flex flex-col gap-1">
            {sub.specs.slice(0, verCadena ? sub.specs.length : 3).map((s) => (
              <li key={s} className="flex gap-1.5 text-[0.72rem] leading-relaxed text-slate-300">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-400" />
                {s}
              </li>
            ))}
          </ul>

          {sub.alertas.length > 0 && (
            <div className="mt-2 flex flex-col gap-1">
              {sub.alertas.map((a) => (
                <p key={a} className="flex items-start gap-1.5 rounded-lg bg-amber-400/10 px-2 py-1.5 text-[0.68rem] leading-snug text-amber-200">
                  <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                  {a}
                </p>
              ))}
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-1">
            {sub.herramientas.map((h) => (
              <span key={h} className="chip-dark">
                {h}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- Próximos servicios ---------------- */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="ink text-[0.95rem] font-bold">Próximos servicios</h2>
          <button className="ink-2 flex items-center gap-0.5 text-xs font-semibold" onClick={() => onAbrir("historial")}>
            Ver plan <ChevronRight size={14} />
          </button>
        </div>
        <div className="mt-1.5 divide-y divide-[var(--line)]">
          {ds.slice(0, 3).map((d) => (
            <button key={d.componente.id} className="flex w-full items-center gap-3 py-2 text-left" onClick={() => onAbrir("historial")}>
              <Ring value={d.restantePct} size={34} stroke={3.5} />
              <span className="min-w-0 flex-1">
                <span className="ink block truncate text-[0.8rem] font-semibold">{d.componente.nombre}</span>
                <span className="ink-3 nums block text-[0.66rem]">
                  {d.kmRestantes > 0 ? `${num(d.kmRestantes)} km` : `+${num(d.kmExcedidos)} km`} · {formatDate(d.proximoVencimiento)}
                </span>
              </span>
              <span className="nums ink-3 text-[0.66rem]">{money(d.componente.costoEstimado)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
      {/* ---------------- Checklist 10k ---------------- */}
      <div id="checklist" className="card p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="ink flex items-center gap-1.5 text-[0.95rem] font-bold">
              <ListChecks size={16} style={{ color: "var(--brand)" }} /> Mantenimiento 10.000 km
            </h2>
            <p className="ink-2 text-[0.72rem]">
              {hechos} de {check.length} puntos · faltan {num(faltanHito)} km
            </p>
          </div>
          <Chip tono={hechos === check.length && check.length > 0 ? "ok" : "warn"}>{Math.round((hechos / Math.max(1, check.length)) * 100)}%</Chip>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ background: "var(--surface-3)" }}>
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${(hechos / Math.max(1, check.length)) * 100}%`, background: hechos === check.length ? "var(--ok)" : "var(--brand)" }}
          />
        </div>

        <div className="mt-2">
          {(verChecklist ? check : check.slice(0, 5)).map((t) => (
            <button key={t.id} className={`check-row ${t.hecho ? "hecho" : ""}`} onClick={() => alternar(t)}>
              <span className="check-box">
                <Check size={13} strokeWidth={3} />
              </span>
              <span className="check-texto ink text-[0.8rem] leading-snug">{t.titulo}</span>
            </button>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <button className="btn btn-ghost flex-1 text-xs" onClick={() => setVerChecklist((x) => !x)}>
            {verChecklist ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {verChecklist ? "Ver menos" : `Ver los ${check.length}`}
          </button>
          <button className="btn btn-primary text-xs" onClick={() => onServicio("aceite")}>
            <Wrench size={14} /> Registrar
          </button>
        </div>

        {hechos > 0 && (
          <button
            className="ink-3 mt-1.5 flex items-center gap-1 text-[0.66rem]"
            onClick={() => {
              if (window.confirm("¿Desmarcar todos los puntos del checklist?")) reiniciarTareas(check.map((t) => ({ ...t, hecho: false })).concat(cadenaPasos).concat(kit).concat(pendientes));
            }}
          >
            <RotateCcw size={11} /> Reiniciar checklist
          </button>
        )}
      </div>

      {/* ---------------- Cadena ---------------- */}
      <div id="cadena" className="card p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="ink flex items-center gap-1.5 text-[0.95rem] font-bold">
              <Link2 size={16} style={{ color: "var(--warn)" }} /> Cadena y kit de arrastre
            </h2>
            <p className="ink-2 text-[0.72rem]">
              {cadena ? `Último engrase a los ${num(cadena.ultimoKm)} km · hace ${num(v.kmActual - cadena.ultimoKm)} km` : "Sin registro de engrase"}
            </p>
          </div>
          <Chip tono={cadenaHechos === cadenaPasos.length ? "ok" : "info"}>
            {cadenaHechos}/{cadenaPasos.length}
          </Chip>
        </div>

        <div className="mt-2">
          {cadenaPasos
            .filter((t) => !t.hecho)
            .slice(0, verCadena ? cadenaPasos.length : 3)
            .map((t) => (
              <button key={t.id} className="check-row" onClick={() => alternar(t)}>
                <span className="check-box">
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className="check-texto ink text-[0.8rem] leading-snug">
                  <span className="ink-3 nums mr-1 text-[0.68rem] font-bold">P{t.orden}</span>
                  {t.titulo}
                </span>
              </button>
            ))}
          {cadenaHechos === cadenaPasos.length && <p className="ink-2 py-2 text-center text-xs">Cadena lista. Registra el engrase para no perder la cuenta.</p>}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <button className="btn btn-ghost text-[0.7rem]" onClick={() => iniciarTimer("Desengrasante", 3)}>
            <Timer size={13} /> Desengrasante 3:00
          </button>
          <button className="btn btn-ghost text-[0.7rem]" onClick={() => iniciarTimer("Secado", 25)}>
            <Timer size={13} /> Secado 25:00
          </button>
          <button className="btn btn-ghost text-[0.7rem]" onClick={() => setVerCadena((x) => !x)}>
            {verCadena ? "Ver menos" : "Ver los 14"}
          </button>
        </div>

        {timer && (
          <div className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2" style={{ background: "var(--surface-2)" }}>
            <span className="nums text-lg font-extrabold" style={{ color: timer.restante === 0 ? "var(--ok)" : "var(--ink)" }}>
              {String(Math.floor(timer.restante / 60)).padStart(2, "0")}:{String(timer.restante % 60).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="ink text-[0.78rem] font-semibold">{timer.nombre}</p>
              <p className="ink-3 text-[0.66rem]">{timer.restante === 0 ? "¡Listo!" : "En curso"}</p>
            </div>
            <button className="icon-btn h-8 w-8" onClick={() => setTimer({ ...timer, activo: !timer.activo })} aria-label="Pausar o seguir">
              {timer.activo ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button className="icon-btn h-8 w-8" onClick={() => setTimer(null)} aria-label="Cerrar cronómetro">
              <RotateCcw size={14} />
            </button>
          </div>
        )}

        <button className="btn btn-soft mt-2 w-full text-xs" onClick={() => onServicio("cadena")}>
          <Check size={14} /> Registrar engrase de cadena
        </button>
      </div>

      </div>

      {/* ---------------- Kit / Pendientes ---------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
      <div className="card p-4">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "kit", label: `Kit · ${kitListos}/${kit.length}` },
            { value: "pendiente", label: `Pendientes · ${pendientes.length - pendientesHechos}` },
          ]}
        />

        {tab === "kit" ? (
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between">
              <p className="ink-3 text-[0.66rem] font-bold uppercase tracking-wide">En moto / casa</p>
              <span className="chip chip-ok">{kitListos} listos</span>
            </div>
            {kit
              .filter((t) => t.hecho)
              .slice(0, verKit ? 99 : 5)
              .map((t) => (
                <button key={t.id} className="check-row hecho" onClick={() => alternar(t)}>
                  <span className="check-box">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span className="check-texto ink text-[0.8rem] leading-snug">
                    {t.titulo}
                    {t.detalle && <span className="ink-3 block text-[0.64rem]">{t.detalle}</span>}
                  </span>
                </button>
              ))}

            <div className="mb-1 mt-3 flex items-center justify-between">
              <p className="ink-3 text-[0.66rem] font-bold uppercase tracking-wide">Por comprar</p>
              <span className="chip chip-bad">{kit.length - kitListos} faltan</span>
            </div>
            {kit
              .filter((t) => !t.hecho)
              .slice(0, verKit ? 99 : 5)
              .map((t) => (
                <button key={t.id} className="check-row" onClick={() => alternar(t)}>
                  <span className="check-box">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span className="check-texto ink text-[0.8rem] leading-snug">
                    {t.titulo}
                    {t.detalle && <span className="ink-3 block text-[0.64rem]">{t.detalle}</span>}
                  </span>
                </button>
              ))}

            <button className="btn btn-ghost mt-2 w-full text-xs" onClick={() => setVerKit((x) => !x)}>
              {verKit ? <ChevronDown size={14} /> : <ChevronRight size={14} />} {verKit ? "Ver menos" : "Ver todo el kit"}
            </button>
          </div>
        ) : (
          <div className="mt-2">
            {pendientes.map((t) => (
              <div key={t.id} className={`check-row ${t.hecho ? "hecho" : ""}`}>
                <button onClick={() => alternar(t)} className="check-box" aria-label={t.hecho ? "Marcar pendiente" : "Completar"}>
                  <Check size={13} strokeWidth={3} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="check-texto ink text-[0.8rem] leading-snug">
                    {t.titulo}
                    {t.prioridad === "alta" && !t.hecho && (
                      <span className="chip chip-bad ml-1.5 align-middle text-[0.58rem]">alta</span>
                    )}
                  </p>
                  {t.detalle && <p className="ink-3 text-[0.64rem]">{t.detalle}</p>}
                </div>
                <button className="ink-3 px-1" onClick={() => borrarTarea(t.id)} aria-label="Eliminar pendiente">
                  ×
                </button>
              </div>
            ))}

            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const titulo = nuevoPendiente.trim();
                if (!titulo) return;
                guardarTarea({
                  id: `pend-${Date.now()}`,
                  tipo: "pendiente",
                  titulo,
                  hecho: false,
                  prioridad: "media",
                  orden: pendientes.length + 1,
                });
                setNuevoPendiente("");
              }}
            >
              <input className="input flex-1" placeholder="Agregar pendiente…" value={nuevoPendiente} onChange={(e) => setNuevoPendiente(e.target.value)} />
              <button className="btn btn-soft" type="submit" aria-label="Agregar pendiente">
                <Plus size={15} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ---------------- Costos ---------------- */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="ink text-[0.95rem] font-bold">Costos</h2>
          <button className="ink-2 flex items-center gap-0.5 text-xs font-semibold" onClick={() => onAbrir("reportes")}>
            Reportes <ChevronRight size={14} />
          </button>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <MiniStat etiqueta="Este mes" valor={moneyShort(mes)} />
          <MiniStat etiqueta="Costo/km" valor={money(porKm)} />
          <MiniStat etiqueta="Por galón" valor={comb.promedioKmGal > 0 ? `${num(comb.promedioKmGal, 0)} km` : "—"} />
        </div>
        <div className="mt-3">
          <BarrasMensuales data={serie} height={110} />
        </div>
      </div>

      </div>

      <div className="grid gap-4 lg:grid-cols-2">
      {/* ---------------- Actividad reciente ---------------- */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="ink text-[0.95rem] font-bold">Actividad reciente</h2>
          <button className="ink-2 flex items-center gap-0.5 text-xs font-semibold" onClick={() => onAbrir("historial")}>
            Historial <ChevronRight size={14} />
          </button>
        </div>
        <div className="mt-1 divide-y divide-[var(--line)]">
          {[...state.mantenimientos]
            .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
            .slice(0, 3)
            .map((m) => (
              <div key={m.id} className="flex items-center gap-2 py-2">
                <span className="ink-3 nums w-16 shrink-0 text-[0.64rem]">{formatDate(m.fecha)}</span>
                <span className="ink min-w-0 flex-1 truncate text-[0.76rem] font-semibold">{m.titulo}</span>
                <span className="nums ink-2 text-[0.72rem] font-bold">{money(m.costo)}</span>
              </div>
            ))}
        </div>
      </div>

      {/* ---------------- Legal ---------------- */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="ink flex items-center gap-1.5 text-[0.95rem] font-bold">
            <ShieldCheck size={16} style={{ color: "var(--info)" }} /> Legal y día a día
          </h2>
          <button className="ink-2 flex items-center gap-0.5 text-xs font-semibold" onClick={() => onAbrir("documentos")}>
            Guantera <ChevronRight size={14} />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2">
          {["soat", "tecnomecanica", "impuesto"].map((tipo) => {
            const d = docsVenc.find((x) => x.documento.tipo === tipo);
            const etiqueta = tipo === "soat" ? "SOAT" : tipo === "tecnomecanica" ? "Tecno" : "Impuesto";
            const tono = !d ? "neutral" : d.diasRestantes < 0 ? "bad" : d.diasRestantes <= 30 ? "warn" : "ok";
            return (
              <button key={tipo} className="card-flat px-2 py-2 text-left" onClick={() => onAbrir("documentos")}>
                <p className="ink-3 text-[0.6rem] font-bold uppercase tracking-wide">{etiqueta}</p>
                <p className="ink nums text-[0.78rem] font-bold">
                  {!d ? "Registrar" : d.diasRestantes < 0 ? "Vencido" : `${d.diasRestantes} días`}
                </p>
                {d ? (
                  <span className="mt-1 inline-block">
                    <Chip tono={tono}>{formatDate(d.documento.fechaVencimiento ?? "")}</Chip>
                  </span>
                ) : (
                  <span className="ink-3 mt-1 block text-[0.58rem]">sin fecha</span>
                )}
              </button>
            );
          })}
        </div>

        <button className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left" style={{ background: "var(--surface-2)" }} onClick={() => onAbrir("pico")}>
          <MapPin size={15} style={{ color: "var(--ok)" }} />
          <span className="min-w-0 flex-1">
            <span className="ink block text-[0.78rem] font-semibold">
              {pico.motivo === "sin-restriccion-ciudad" ? `Sin pico y placa para motos en ${ciudad.nombre}` : pico.restringido ? "Hoy con restricción" : "Hoy sin restricción"}
            </span>
            <span className="ink-2 block text-[0.66rem]">{pico.motivo === "sin-restriccion-ciudad" ? "La medida aplica a carros" : `${ciudad.nombre} · ${ciudad.horario}`}</span>
          </span>
          <ChevronRight size={14} style={{ color: "var(--ink-3)" }} />
        </button>

        {manual.length < 3 && (
          <p className="ink-3 mt-2 flex items-start gap-1 text-[0.66rem]">
            <CircleAlert size={11} className="mt-0.5 shrink-0" /> Faltan fechas legales por registrar; el semáforo y las alertas se activan cuando las agregues.
          </p>
        )}
      </div>

      </div>

      {/* ---------------- Consola ---------------- */}
      <div className="panel-dark p-3.5">
        <div className="flex items-center gap-2">
          <Command size={14} style={{ color: "#38bdf8" }} />
          <p className="text-[0.74rem] font-bold uppercase tracking-widest text-slate-400">Consola</p>
        </div>
        <form onSubmit={ejecutar} className="mt-2 flex gap-2">
          <input
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            placeholder="km 9500 · nodo 3 · cadena · ayuda"
            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-2 font-mono text-[0.78rem] text-slate-200 outline-none placeholder:text-slate-600 focus:border-sky-500"
            aria-label="Comando"
          />
          <button type="submit" className="btn btn-primary px-3 py-2 text-xs" aria-label="Ejecutar comando">
            <ArrowRight size={14} />
          </button>
        </form>
        {msg && <p className="mt-1.5 font-mono text-[0.68rem] text-sky-300">{msg}</p>}
        <div className="mt-2 flex flex-wrap gap-1">
          {["km 9500", "nodo 3", "cadena", "checklist", "servicio", "tanqueo"].map((c) => (
            <button key={c} className="chip-dark" onClick={() => setCmd(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="ink-3 text-[0.64rem]">
          {capacidades.backend === "gas" ? "Datos en Google Sheets · se actualiza solo" : "Datos en este navegador"}
        </p>
        <button className="ink-2 flex items-center gap-1 text-[0.68rem] font-semibold" onClick={() => onAbrir("menu")}>
          <LayoutGrid size={13} /> Todo
        </button>
      </div>

      {/* ---------------- Dock ---------------- */}
      <nav
        className="dock no-print"
        aria-label="Acciones rápidas"
        aria-hidden={!dockVisible}
        style={{
          transform: dockVisible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(140%)",
          transition: "transform .28s cubic-bezier(.16,1,.3,1), opacity .2s",
          opacity: dockVisible ? 1 : 0,
        }}
      >
        <button className="dock-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Gauge size={17} style={{ color: "var(--brand)" }} />
          Inicio
        </button>
        <button className="dock-btn primario" onClick={() => onServicio()}>
          <Plus size={18} />
          Servicio
        </button>
        <button className="dock-btn" onClick={onTanqueo}>
          <Fuel size={17} />
          Tanqueo
        </button>
        <button
          className="dock-btn"
          onClick={() => document.getElementById("cadena")?.scrollIntoView({ behavior: "smooth", block: "start" })}
        >
          <Link2 size={17} />
          Cadena
        </button>
        <button className="dock-btn" onClick={() => onAbrir("menu")}>
          <MoreHorizontal size={17} />
          Más
        </button>
      </nav>
    </div>
  );
}

function HudStat({ etiqueta, valor, onClick }: { etiqueta: string; valor: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-slate-700/60 bg-slate-900/50 px-2 py-1.5 text-left disabled:cursor-default"
      disabled={!onClick}
    >
      <p className="text-[0.55rem] font-bold uppercase tracking-widest text-slate-500">{etiqueta}</p>
      <p className="nums text-[0.86rem] font-extrabold text-slate-100">{valor}</p>
    </button>
  );
}

function MiniStat({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="card-flat px-2.5 py-2">
      <p className="ink-3 text-[0.58rem] font-bold uppercase tracking-wide">{etiqueta}</p>
      <p className="ink nums text-[0.82rem] font-bold">{valor}</p>
    </div>
  );
}

/* Iconos reexportados para el menú "Más" */
export const ICONOS_MENU = { Package, Bike, BatteryCharging, CircleDot, Sparkles, Wrench, Icono };
