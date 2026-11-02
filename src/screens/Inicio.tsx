import React from "react";
import {
  ArrowRight,
  ChevronRight,
  CircleAlert,
  Droplets,
  Fuel,
  Gauge,
  MapPin,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { Ruta } from "../lib/router";
import { useApp } from "../store/AppStore";
import { avisosDelDia, desgastes, diasProyectados, ritmoKmDiario, saludVehiculo, totalMes, totalPorMes, resumenCombustible } from "../lib/calc";
import { formatDate, isoDate, money, moneyShort, num, saludo } from "../lib/format";
import { Chip, Ring, SectionTitle } from "../components/ui";
import { Sparkline } from "../components/charts";
import { ciudadPorId, evaluarPicoPlaca, proximosDias } from "../lib/picoPlaca";

export function Inicio({
  ir,
  onNuevoMantenimiento,
  onNuevoTanqueo,
  onEditarKm,
  onPuntos,
}: {
  ir: (r: Ruta) => void;
  onNuevoMantenimiento: () => void;
  onNuevoTanqueo: () => void;
  onEditarKm: () => void;
  onPuntos: () => void;
}) {
  const { state } = useApp();
  const v = state.vehiculo;
  if (!v) return null;

  const salud = saludVehiculo(state);
  const avisos = avisosDelDia(state).slice(0, 3);
  const proximos = desgastes(state).slice(0, 4);
  const siguiente = proximos.find((p) => p.estado !== "vencido") ?? proximos[0];
  const ritmo = ritmoKmDiario(state);
  const gastoMes = totalMes(state, 0);
  const gastoMesAnterior = totalMes(state, 1);
  const delta = gastoMesAnterior > 0 ? (gastoMes - gastoMesAnterior) / gastoMesAnterior : 0;
  const serie = totalPorMes(state, 6).map((m) => m.total);
  const comb = resumenCombustible(state);
  const puntos = state.puntos.reduce((a, p) => a + p.puntos, 0);
  const ciudad = ciudadPorId(state.ajustes.ciudad);
  const hoy = isoDate();
  const picoHoy = evaluarPicoPlaca(v.placa, hoy, ciudad, state.ajustes.tipoVehiculo === "moto", state.ajustes.picoPlacaDigitos);
  const picoProximo = proximosDias(hoy, 8)
    .map((f) => ({
      fecha: f,
      r: evaluarPicoPlaca(v.placa, f, ciudad, state.ajustes.tipoVehiculo === "moto", state.ajustes.picoPlacaDigitos),
    }))
    .find((x) => x.r.restringido && x.fecha !== hoy);

  const soat = state.documentos.find((d) => d.tipo === "soat");
  const tecno = state.documentos.find((d) => d.tipo === "tecnomecanica");

  return (
    <div className="flex flex-col gap-5">
      {/* Saludo */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="ink-3 text-[0.78rem] font-medium">{capitalizar(formatDate(hoy, "largo"))}</p>
          <h1 className="ink text-[1.45rem] font-extrabold leading-tight tracking-tight">
            {saludo()}
            {state.ajustes.nombre ? `, ${state.ajustes.nombre.split(" ")[0]}` : ""}
          </h1>
        </div>
        <button
          onClick={onPuntos}
          className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.72rem] font-bold"
          style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
        >
          <Sparkles size={13} /> {num(puntos)} pts
        </button>
      </div>

      {state.esDemo && (
        <div className="flex items-start gap-2 rounded-2xl px-3.5 py-2.5" style={{ background: "var(--warn-soft)" }}>
          <Sparkles size={14} className="mt-0.5 shrink-0" style={{ color: "var(--warn)" }} />
          <p className="text-[0.72rem] leading-relaxed" style={{ color: "var(--warn)" }}>
            Estás viendo datos de ejemplo. En Ajustes puedes borrarlos y empezar con los datos reales de tu moto.
          </p>
        </div>
      )}

      {/* Avisos del día */}
      {avisos.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionTitle
            title="Hoy"
            action={
              <button className="ink-2 flex items-center gap-0.5 text-xs font-semibold" onClick={() => ir("alertas")}>
                Ver todo <ChevronRight size={14} />
              </button>
            }
          />
          {avisos.map((a) => {
            const tono = a.severidad === "critico" ? "bad" : a.severidad === "atencion" ? "warn" : "info";
            const color = tono === "bad" ? "var(--bad)" : tono === "warn" ? "var(--warn)" : "var(--info)";
            const fondo = tono === "bad" ? "var(--bad-soft)" : tono === "warn" ? "var(--warn-soft)" : "var(--info-soft)";
            return (
              <button
                key={a.id}
                onClick={() => ir(a.destino)}
                className="rise flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left"
                style={{ borderColor: "var(--line)", background: "var(--surface)" }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: fondo, color }}>
                  <CircleAlert size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="ink block text-[0.86rem] font-semibold leading-snug">{a.titulo}</span>
                  <span className="ink-2 mt-0.5 block text-xs leading-snug">{a.detalle}</span>
                </span>
                <ChevronRight size={16} className="shrink-0" style={{ color: "var(--ink-3)" }} />
              </button>
            );
          })}
        </div>
      )}

      {/* Vehículo */}
      <div className="card overflow-hidden">
        <div className="relative px-4 pb-3 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Chip tono="brand">{v.placa}</Chip>
              <h2 className="ink mt-1.5 text-[1.15rem] font-extrabold leading-tight">{v.apodo}</h2>
              <p className="ink-2 text-[0.8rem]">
                {v.marca} {v.linea} · {v.modelo}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Ring value={salud / 100} size={56} stroke={5}>
                <span className="nums ink text-[0.8rem] font-extrabold">{salud}%</span>
              </Ring>
              <span className="ink-3 mt-0.5 text-[0.6rem] font-semibold uppercase tracking-wide">Salud</span>
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between gap-3">
            <button onClick={onEditarKm} className="group text-left">
              <span className="ink-3 flex items-center gap-1 text-[0.68rem] font-semibold uppercase tracking-wide">
                <Gauge size={12} /> Kilometraje
              </span>
              <span className="nums ink group-hover:text-[var(--brand)] text-xl font-extrabold">
                {num(v.kmActual)} <span className="ink-2 text-sm font-semibold">km</span>
              </span>
            </button>
            <div className="flex flex-wrap justify-end gap-1.5">
              {soat?.fechaVencimiento && (
                <DocChip nombre="SOAT" fecha={soat.fechaVencimiento} />
              )}
              {tecno?.fechaVencimiento && <DocChip nombre="Tecno" fecha={tecno.fechaVencimiento} />}
            </div>
          </div>

          <div className="mt-3">
            <div className="ink-2 mb-1 flex items-center justify-between text-[0.68rem] font-semibold">
              <span>{siguiente?.estado === "vencido" ? "Servicio vencido" : "Próximo servicio"}</span>
              <span>
                {!siguiente
                  ? "—"
                  : siguiente.estado === "vencido"
                    ? `+${num(siguiente.kmExcedidos)} km`
                    : `${num(siguiente.kmRestantes)} km`}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-3)" }}>
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: `${Math.max(2, (siguiente?.restantePct ?? 1) * 100)}%`,
                  background:
                    (siguiente?.restantePct ?? 1) > 0.35
                      ? "var(--ok)"
                      : (siguiente?.restantePct ?? 1) > 0.15
                        ? "var(--warn)"
                        : "var(--bad)",
                }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => ir("vehiculo")}
          className="flex w-full items-center justify-between border-t border-[var(--line)] px-4 py-2.5 text-[0.78rem] font-bold"
          style={{ color: "var(--brand)", background: "var(--brand-soft)" }}
        >
          Ver hoja de vida completa <ArrowRight size={15} />
        </button>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-4 gap-2">
        <Accion icon={<Plus size={18} />} label="Servicio" onClick={onNuevoMantenimiento} destacado />
        <Accion icon={<Fuel size={18} />} label="Tanqueo" onClick={onNuevoTanqueo} />
        <Accion icon={<Gauge size={18} />} label="Km" onClick={onEditarKm} />
        <Accion icon={<MapPin size={18} />} label="Pico" onClick={() => ir("pico")} />
      </div>

      {/* Próximos mantenimientos */}
      <div>
        <SectionTitle
          title="Próximos mantenimientos"
          hint="Por kilómetros y tiempo"
          action={
            <button className="ink-2 flex items-center gap-0.5 text-xs font-semibold" onClick={() => ir("mantenimientos")}>
              Ver todos <ChevronRight size={14} />
            </button>
          }
        />
        <div className="card divide-y divide-[var(--line)]">
          {proximos.map((d) => (
            <button
              key={d.componente.id}
              onClick={() => ir("mantenimientos")}
              className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
            >
              <Ring value={d.restantePct} size={44} stroke={4.5} />
              <div className="min-w-0 flex-1">
                <div className="ink truncate text-[0.86rem] font-semibold">{d.componente.nombre}</div>
                <div className="ink-2 mt-0.5 flex items-center gap-2 text-[0.72rem]">
                  <span className="nums">
                    {d.kmRestantes > 0 ? `en ${num(d.kmRestantes)} km` : "km vencidos"}
                  </span>
                  <span className="ink-3">·</span>
                  <span>
                    {d.diasRestantes > 0
                      ? diasProyectados(d, ritmo) !== null
                        ? `≈ ${diasProyectados(d, ritmo)} días`
                        : `${d.diasRestantes} días`
                      : "vencido"}
                  </span>
                </div>
                <div className="mt-1.5">
                  <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-3)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(2, d.restantePct * 100)}%`,
                        background: d.restantePct > 0.35 ? "var(--ok)" : d.restantePct > 0.15 ? "var(--warn)" : "var(--bad)",
                      }}
                    />
                  </div>
                </div>
              </div>
              <span className="ink-3 shrink-0 text-[0.68rem] font-semibold">{money(d.componente.costoEstimado)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Gastos + pico y placa */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="ink-3 text-[0.68rem] font-bold uppercase tracking-wide">Gastos de este mes</p>
              <p className="nums ink mt-0.5 text-2xl font-extrabold">{money(gastoMes)}</p>
            </div>
            <Sparkline valores={serie} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            {gastoMesAnterior > 0 ? (
              <Chip tono={delta <= 0 ? "ok" : "warn"}>
                {delta <= 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                {Math.abs(Math.round(delta * 100))}% vs mes anterior
              </Chip>
            ) : (
              <Chip tono="neutral">Sin historial previo</Chip>
            )}
          </div>
          <button
            className="mt-3 flex w-full items-center justify-between text-xs font-bold"
            style={{ color: "var(--brand)" }}
            onClick={() => ir("reportes")}
          >
            Ver reportes <ChevronRight size={14} />
          </button>
        </div>

        <div className="card p-4">
          <div className="flex items-start justify-between">
            <p className="ink-3 text-[0.68rem] font-bold uppercase tracking-wide">
              {picoHoy.restringido ? "Pico y placa hoy" : "Pico y placa"}
            </p>
            <Chip tono={picoHoy.restringido ? "bad" : "ok"}>
              {ciudad.nombre}
            </Chip>
          </div>
          {picoHoy.motivo === "sin-restriccion-ciudad" ? (
            <>
              <p className="ink mt-1.5 text-[0.95rem] font-bold leading-snug">Tu moto no tiene pico y placa</p>
              <p className="ink-2 mt-1 text-xs leading-relaxed">
                En {ciudad.nombre} la restricción aplica a carros particulares. Circula tranquilo.
              </p>
            </>
          ) : picoHoy.restringido ? (
            <>
              <p className="ink mt-1.5 text-[0.95rem] font-bold" style={{ color: "var(--bad)" }}>
                Hoy no puedes circular
              </p>
              <p className="ink-2 mt-1 text-xs">
                Dígitos {picoHoy.digitos.join(" y ")} · {picoHoy.horario}
              </p>
            </>
          ) : (
            <>
              <p className="ink mt-1.5 text-[0.95rem] font-bold" style={{ color: "var(--ok)" }}>
                Sin restricción hoy
              </p>
              <p className="ink-2 mt-1 text-xs">
                {picoProximo
                  ? `Te toca el ${formatDate(picoProximo.fecha)} (${picoProximo.r.digitos.join(" y ")})`
                  : "Sin restricciones esta semana"}
              </p>
            </>
          )}
          <button
            className="mt-3 flex w-full items-center justify-between text-xs font-bold"
            style={{ color: "var(--brand)" }}
            onClick={() => ir("pico")}
          >
            Ver semana <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Combustible */}
      {comb.mediciones.length > 0 && (
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--info-soft)", color: "var(--info)" }}>
            <Droplets size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="ink text-[0.86rem] font-semibold">Rendimiento promedio</p>
            <p className="ink-2 text-xs">
              {num(comb.promedioKmL, 1)} km/l · {num(comb.promedioKmGal, 1)} km/galón · {moneyShort(comb.totalGasto)} en combustible
            </p>
          </div>
          <button className="icon-btn" onClick={() => ir("gastos")} aria-label="Ver combustible">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <p className="ink-3 px-1 text-center text-[0.66rem] leading-relaxed">
        Clon web personal inspirado en Tucamo · Plan de mantenimiento XTZ 250 editable ·{" "}
        <span className="font-semibold">No sustituye el manual del fabricante</span>
      </p>
    </div>
  );
}

function capitalizar(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function Accion({
  icon,
  label,
  onClick,
  destacado,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destacado?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-2xl px-1 py-3 text-[0.68rem] font-bold transition-transform active:scale-95"
      style={{
        background: destacado ? "var(--brand)" : "var(--surface)",
        color: destacado ? "#fff" : "var(--ink-2)",
        border: `1px solid ${destacado ? "transparent" : "var(--line)"}`,
        boxShadow: destacado ? "0 10px 20px -14px rgba(249,115,22,.9)" : "var(--shadow)",
      }}
    >
      {icon}
      <span className="leading-none">{label}</span>
    </button>
  );
}

function DocChip({ nombre, fecha }: { nombre: string; fecha: string }) {
  const dias = Math.round((new Date(fecha).getTime() - new Date(isoDate()).getTime()) / 86_400_000);
  const tono = dias < 0 ? "bad" : dias <= 30 ? "warn" : "ok";
  return (
    <Chip tono={tono}>
      {nombre} {dias < 0 ? "vencido" : `${dias} d`}
    </Chip>
  );
}
