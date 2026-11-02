import { useEffect, useState } from "react";
import { Bike, ExternalLink, Loader2, RefreshCw, TriangleAlert } from "lucide-react";
import { URL_EDITOR, URL_HOJA } from "./lib/entorno";
import { AppProvider, useApp } from "./store/AppStore";
import type { CategoriaMantenimiento } from "./types";
import { Onboarding } from "./screens/Onboarding";
import { Dashboard, type Seccion } from "./screens/Dashboard";
import { Mantenimientos } from "./screens/Mantenimientos";
import { Vehiculo } from "./screens/Vehiculo";
import { Alertas } from "./screens/Alertas";
import { Gastos } from "./screens/Gastos";
import { Reportes } from "./screens/Reportes";
import { PicoPlaca } from "./screens/PicoPlaca";
import { Talleres } from "./screens/Talleres";
import { Ajustes, ZonaMoto } from "./screens/Ajustes";
import { Sheet } from "./components/Sheet";
import { ModalMantenimiento, ModalTanqueo, ModalVehiculo } from "./components/formularios";
import { Icono } from "./components/iconos";

export default function App() {
  return (
    <AppProvider>
      <Contenido />
    </AppProvider>
  );
}

const TITULOS: Record<Seccion, { titulo: string; sub: string }> = {
  menu: { titulo: "Todo MotoApp", sub: "Las secciones de siempre, en un solo lugar" },
  historial: { titulo: "Historial", sub: "Registros, próximos y plan de mantenimiento" },
  plan: { titulo: "Plan de mantenimiento", sub: "Intervalos, costos y último servicio" },
  documentos: { titulo: "Hoja de vida", sub: "Guantera, indicadores y atributos" },
  alertas: { titulo: "Alertas", sub: "Legal, mantenimiento y pico y placa" },
  reportes: { titulo: "Reportes", sub: "Costos, combustible e historial vehicular" },
  pico: { titulo: "Pico y placa", sub: "Reglas por ciudad y festivos" },
  talleres: { titulo: "Talleres", sub: "Red de confianza y órdenes" },
  ajustes: { titulo: "Ajustes", sub: "Perfil, datos y reglas" },
  gastos: { titulo: "Gastos y tanqueos", sub: "Combustible y rendimiento" },
};

function Contenido() {
  const { state, cargado, cargarDemo, aviso, guardando, limpiarAviso, errorCarga, recargar } = useApp();
  const [seccion, setSeccion] = useState<Seccion | null>(null);
  const [puntos, setPuntos] = useState(false);
  const [mant, setMant] = useState<{ open: boolean; categoria?: CategoriaMantenimiento }>({ open: false });
  const [tanqueo, setTanqueo] = useState(false);
  const [vehiculoModal, setVehiculoModal] = useState(false);

  useEffect(() => {
    if (!cargado) return;
    const params = new URLSearchParams(window.location.search);
    const demo = params.get("demo") === "1" || (window as { __MOTOAPP_DEMO__?: boolean }).__MOTOAPP_DEMO__ === true;
    if (demo && !state.onboardingCompleto) cargarDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargado]);

  if (!cargado) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3" style={{ background: "var(--bg)" }}>
        <span
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
          style={{ background: "linear-gradient(135deg,#fb923c,#ea580c)" }}
        >
          <Bike size={24} />
        </span>
        <span className="ink-3 flex items-center gap-2 text-xs font-semibold">
          <Loader2 size={13} className="animate-spin" /> Abriendo tu hoja de vida…
        </span>
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4 py-10" style={{ background: "var(--bg)" }}>
        <div className="card w-full max-w-lg overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 pb-4 pt-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: "var(--warn-soft)", color: "var(--warn)" }}>
              <TriangleAlert size={20} />
            </span>
            <div>
              <h1 className="ink text-[1.1rem] font-extrabold leading-tight">Falta autorizar la hoja</h1>
              <p className="ink-2 text-xs">La app ya está instalada, pero tu cuenta aún no le dio permiso al libro.</p>
            </div>
          </div>
          <div className="px-5 pb-5">
            <div className="rounded-xl px-3 py-2 text-[0.72rem] leading-relaxed" style={{ background: "var(--surface-2)", color: "var(--ink-2)" }}>
              <strong className="ink">Detalle técnico:</strong> {errorCarga}
            </div>
            <ol className="ink mt-4 flex flex-col gap-2.5 text-[0.82rem] leading-relaxed">
              <li className="flex gap-2">
                <span className="chip chip-brand h-5 w-5 shrink-0 justify-center p-0">1</span>
                Abre el editor de Apps Script y ejecuta la función <code className="ink rounded bg-[var(--surface-3)] px-1">setup</code> una sola vez.
              </li>
              <li className="flex gap-2">
                <span className="chip chip-brand h-5 w-5 shrink-0 justify-center p-0">2</span>
                Acepta los permisos de Google Sheets cuando te los pida.
              </li>
              <li className="flex gap-2">
                <span className="chip chip-brand h-5 w-5 shrink-0 justify-center p-0">3</span>
                Vuelve a esta página y pulsa «Reintentar».
              </li>
            </ol>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              {URL_EDITOR && (
                <a className="btn btn-primary flex-1" href={URL_EDITOR} target="_blank" rel="noreferrer">
                  Abrir editor <ExternalLink size={14} />
                </a>
              )}
              {URL_HOJA && (
                <a className="btn btn-ghost flex-1" href={URL_HOJA} target="_blank" rel="noreferrer">
                  Abrir la hoja <ExternalLink size={14} />
                </a>
              )}
              <button className="btn btn-ghost" onClick={() => void recargar()}>
                <RefreshCw size={14} /> Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!state.onboardingCompleto || !state.vehiculo) return <Onboarding />;

  const abrirServicio = (categoria?: CategoriaMantenimiento) => setMant({ open: true, categoria });

  return (
    <>
      <main className="mx-auto w-full max-w-5xl px-3 pt-3 sm:px-5">
        <Dashboard
          onServicio={abrirServicio}
          onTanqueo={() => setTanqueo(true)}
          onAbrir={setSeccion}
          onPuntos={() => setPuntos(true)}
          onEditarKm={() => setVehiculoModal(true)}
        />
      </main>

      <Sheet
        open={seccion !== null}
        titulo={seccion ? TITULOS[seccion].titulo : ""}
        sub={seccion ? TITULOS[seccion].sub : ""}
        onClose={() => setSeccion(null)}
      >
        {seccion === "menu" && <Menu onAbrir={setSeccion} />}
        {seccion === "historial" && <Mantenimientos onServicio={abrirServicio} />}
        {seccion === "plan" && <Mantenimientos onServicio={abrirServicio} />}
        {seccion === "documentos" && <Vehiculo onServicio={abrirServicio} />}
        {seccion === "alertas" && (
          <Alertas
            ir={(r) => {
              if (r === "vehiculo") setSeccion("documentos");
              else if (r === "pico") setSeccion("pico");
              else if (r === "mantenimientos") setSeccion("historial");
              else setSeccion("menu");
            }}
          />
        )}
        {seccion === "reportes" && <Reportes />}
        {seccion === "gastos" && <Gastos />}
        {seccion === "pico" && <PicoPlaca />}
        {seccion === "talleres" && <Talleres />}
        {seccion === "ajustes" && <Ajustes />}
      </Sheet>

      <ModalMantenimiento open={mant.open} onClose={() => setMant({ open: false })} categoriaInicial={mant.categoria} />
      <ModalTanqueo open={tanqueo} onClose={() => setTanqueo(false)} />
      <ModalVehiculo open={vehiculoModal} onClose={() => setVehiculoModal(false)} />
      <ZonaMoto open={puntos} onClose={() => setPuntos(false)} />

      {aviso && (
        <div className="no-print fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 lg:bottom-8">
          <button
            onClick={limpiarAviso}
            className="pop flex max-w-md items-center gap-2 rounded-2xl px-4 py-2.5 text-[0.78rem] font-semibold text-white shadow-lg"
            style={{ background: aviso.tono === "error" ? "var(--bad)" : aviso.tono === "ok" ? "var(--ok)" : "var(--ink)" }}
          >
            {aviso.texto}
          </button>
        </div>
      )}

      {guardando && (
        <div
          className="no-print fixed left-1/2 top-3 z-[60] flex -translate-x-1/2 items-center gap-1.5 rounded-full px-3 py-1 text-[0.68rem] font-bold"
          style={{ background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--line)" }}
        >
          <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: "var(--brand)" }} />
          Guardando en la hoja…
        </div>
      )}
    </>
  );
}

const MENU: { id: Seccion; label: string; icono: string }[] = [
  { id: "documentos", label: "Hoja de vida", icono: "Bike" },
  { id: "historial", label: "Mantenimientos", icono: "Wrench" },
  { id: "gastos", label: "Gastos y tanqueos", icono: "Fuel" },
  { id: "reportes", label: "Reportes", icono: "Landmark" },
  { id: "alertas", label: "Alertas", icono: "ShieldCheck" },
  { id: "pico", label: "Pico y placa", icono: "MapPin" },
  { id: "talleres", label: "Talleres", icono: "Store" },
  { id: "ajustes", label: "Ajustes", icono: "CircleDot" },
];

function Menu({ onAbrir }: { onAbrir: (s: Seccion) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {MENU.map((m) => (
        <button key={m.id} onClick={() => onAbrir(m.id)} className="card flex flex-col items-start gap-2 p-3.5 text-left">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
            <Icono nombre={m.icono} size={17} />
          </span>
          <span className="ink text-[0.82rem] font-semibold leading-tight">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
