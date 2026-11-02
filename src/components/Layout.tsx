import React from "react";
import {
  Bell,
  Bike,
  ChartNoAxesColumn,
  Cog,
  Gauge,
  House,
  MapPin,
  Store,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { Ruta } from "../lib/router";
import { useApp } from "../store/AppStore";
import { avisosDelDia, saludVehiculo } from "../lib/calc";
import { num } from "../lib/format";
import { Ring } from "./ui";
import { RefreshCw } from "lucide-react";

const NAV: { ruta: Ruta; label: string; corto: string; icon: React.ReactNode }[] = [
  { ruta: "inicio", label: "Inicio", corto: "Inicio", icon: <House size={19} /> },
  { ruta: "vehiculo", label: "Mi moto", corto: "Moto", icon: <Bike size={19} /> },
  { ruta: "mantenimientos", label: "Mantenimientos", corto: "Mant.", icon: <Gauge size={19} /> },
  { ruta: "alertas", label: "Alertas", corto: "Alertas", icon: <Bell size={19} /> },
  { ruta: "reportes", label: "Reportes", corto: "Reportes", icon: <ChartNoAxesColumn size={19} /> },
];

const EXTRA: { ruta: Ruta; label: string; icon: React.ReactNode }[] = [
  { ruta: "gastos", label: "Gastos y tanqueos", icon: <Wallet size={18} /> },
  { ruta: "pico", label: "Pico y placa", icon: <MapPin size={18} /> },
  { ruta: "talleres", label: "Talleres y órdenes", icon: <Store size={18} /> },
  { ruta: "ajustes", label: "Ajustes", icon: <Cog size={18} /> },
];

export function Layout({
  ruta,
  ir,
  children,
  onAbrirPuntos,
}: {
  ruta: Ruta;
  ir: (r: Ruta) => void;
  children: React.ReactNode;
  onAbrirPuntos: () => void;
}) {
  const { state, recargar, guardando } = useApp();
  const v = state.vehiculo;
  const avisos = avisosDelDia(state);
  const criticos = avisos.filter((a) => a.severidad === "critico").length;
  const salud = saludVehiculo(state);
  const puntos = state.puntos.reduce((a, p) => a + p.puntos, 0);

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Sidebar escritorio */}
      <aside className="no-print sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface)] px-4 py-5 lg:flex">
        <button onClick={() => ir("inicio")} className="mb-6 flex items-center gap-2.5 px-1 text-left">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-white"
            style={{ background: "linear-gradient(135deg, #fb923c, #ea580c)" }}
          >
            <Bike size={21} />
          </span>
          <span>
            <span className="ink block text-[1.02rem] font-extrabold leading-tight tracking-tight">MotoApp</span>
            <span className="ink-3 block text-[0.66rem] font-semibold uppercase tracking-wider">
              XTZ 250 · hoja de vida
            </span>
          </span>
        </button>

        <nav className="flex flex-col gap-1">
          {[...NAV, ...EXTRA].map((item) => {
            const activo = ruta === item.ruta;
            return (
              <button
                key={item.ruta}
                onClick={() => ir(item.ruta)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.88rem] font-semibold transition-colors"
                style={{
                  background: activo ? "var(--brand-soft)" : "transparent",
                  color: activo ? "var(--brand)" : "var(--ink-2)",
                }}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {item.ruta === "alertas" && criticos > 0 && (
                  <span
                    className="nums rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold text-white"
                    style={{ background: "var(--bad)" }}
                  >
                    {criticos}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          {v && (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
              <div className="flex items-center gap-2.5">
                <Ring value={salud / 100} size={40} stroke={4} />
                <div className="min-w-0">
                  <div className="ink truncate text-[0.8rem] font-bold">{v.apodo || v.linea}</div>
                  <div className="ink-3 nums text-[0.7rem]">
                    {v.placa} · {num(v.kmActual)} km
                  </div>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => void recargar()}
            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold"
            style={{ background: "var(--surface-2)", color: "var(--ink-2)" }}
          >
            <span className="flex items-center gap-2">
              <RefreshCw size={15} className={guardando ? "animate-spin" : ""} /> Actualizar
            </span>
            <span className="ink-3 text-[0.66rem]">hoja</span>
          </button>
          <button onClick={onAbrirPuntos} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
            <span className="flex items-center gap-2">
              <Sparkles size={16} /> Zona Moto
            </span>
            <span className="nums">{num(puntos)} pts</span>
          </button>
        </div>
      </aside>

      {/* Header móvil */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--bg)]/85 px-4 py-3 backdrop-blur-md lg:hidden">
          <button onClick={() => ir("inicio")} className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white"
              style={{ background: "linear-gradient(135deg, #fb923c, #ea580c)" }}
            >
              <Bike size={17} />
            </span>
            <span className="ink text-[0.95rem] font-extrabold tracking-tight">MotoApp</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onAbrirPuntos}
              className="nums flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.72rem] font-bold"
              style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
            >
              <Sparkles size={12} /> {num(puntos)}
            </button>
            <button className="icon-btn" onClick={() => void recargar()} aria-label="Actualizar datos" title="Actualizar desde la hoja">
              <RefreshCw size={16} className={guardando ? "animate-spin" : ""} />
            </button>
            <button className="icon-btn relative" onClick={() => ir("alertas")} aria-label="Alertas">
              <Bell size={17} />
              {criticos > 0 && (
                <span
                  className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
                  style={{ background: "var(--bad)", boxShadow: "0 0 0 2px var(--bg)" }}
                />
              )}
            </button>
            <button
              onClick={() => ir("ajustes")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[0.72rem] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#334155,#0f172a)" }}
              aria-label="Ajustes"
            >
              {(state.ajustes.nombre || "M").slice(0, 1).toUpperCase()}
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-4 sm:px-6 lg:py-8">{children}</main>

        {/* Nav inferior móvil */}
        <nav
          className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line)] bg-[var(--surface)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
          aria-label="Navegación principal"
        >
          <div className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1.5" data-criticos={criticos}>
            {NAV.map((item) => {
              const activo = ruta === item.ruta;
              return (
                <button
                  key={item.ruta}
                  onClick={() => ir(item.ruta)}
                  className="relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5"
                  style={{ color: activo ? "var(--brand)" : "var(--ink-3)" }}
                  aria-current={activo ? "page" : undefined}
                >
                  <span
                    className="flex h-8 w-12 items-center justify-center rounded-full transition-colors"
                    style={{ background: activo ? "var(--brand-soft)" : "transparent" }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[0.63rem] font-semibold">{item.corto}</span>
                  {item.ruta === "alertas" && criticos > 0 && (
                    <span
                      className="absolute right-3 top-1 h-1.5 w-1.5 rounded-full"
                      style={{ background: "var(--bad)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
