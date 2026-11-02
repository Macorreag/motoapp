import { useState } from "react";
import { BellPlus, CalendarClock, ChevronRight, CircleCheck, Info, MapPin, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import type { Alerta } from "../types";
import { useApp } from "../store/AppStore";
import { Chip, EmptyState, Ring, SectionTitle } from "../components/ui";
import { documentosConVencimiento, desgastes } from "../lib/calc";
import { DOCUMENTOS_META } from "../data/catalogo";
import { formatDate, isoDate, num } from "../lib/format";
import { Icono } from "../components/iconos";
import { ModalAlerta } from "../components/formularios";
import { CIUDADES, ciudadPorId, evaluarPicoPlaca, proximosDias } from "../lib/picoPlaca";
import type { Ruta } from "../lib/router";

export function Alertas({ ir }: { ir: (r: Ruta) => void }) {
  const { state, guardarAlerta, borrarAlerta } = useApp();
  const [nueva, setNueva] = useState(false);
  const [edit, setEdit] = useState<Alerta | undefined>();
  const v = state.vehiculo;
  if (!v) return null;

  const legales = documentosConVencimiento(state);
  const legalesMoto = legales.filter((d) => ["soat", "tecnomecanica", "impuesto"].includes(d.documento.tipo));
  const urgentes = desgastes(state).filter((d) => d.estado === "vencido" || d.estado === "urgente");
  const ciudad = ciudadPorId(state.ajustes.ciudad);
  const hoy = isoDate();
  const semana = proximosDias(hoy, 7).map((f) => ({
    fecha: f,
    r: evaluarPicoPlaca(v.placa, f, ciudad, state.ajustes.tipoVehiculo === "moto", state.ajustes.picoPlacaDigitos),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="ink text-[1.35rem] font-extrabold tracking-tight">Alertas</h1>
          <p className="ink-2 text-[0.8rem]">Legal, mantenimiento y pico y placa</p>
        </div>
        <button className="btn btn-soft" onClick={() => setNueva(true)}>
          <BellPlus size={15} /> Alerta
        </button>
      </div>

      <div className="flex items-start gap-2 rounded-2xl px-3.5 py-3" style={{ background: "var(--info-soft)" }}>
        <Info size={15} className="mt-0.5 shrink-0" style={{ color: "var(--info)" }} />
        <p className="text-[0.72rem] leading-relaxed" style={{ color: "var(--info)" }}>
          MotoApp no es una entidad gubernamental. Las fechas y reglas son de referencia: confírmalas siempre en el
          RUNT, el SIMIT o la secretaría de movilidad de tu ciudad.
        </p>
      </div>

      {/* Legal */}
      <div>
        <SectionTitle title="Legal" hint="SOAT, tecnomecánica e impuesto" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {legalesMoto.length === 0 && (
            <div className="col-span-2 sm:col-span-3">
              <EmptyState
                icon={<ShieldCheck size={22} />}
                title="Sin fechas legales registradas"
                description="Agrega el vencimiento del SOAT, la tecnomecánica y el impuesto en la guantera de tu moto."
                action={
                  <button className="btn btn-primary" onClick={() => ir("vehiculo")}>
                    Ir a la guantera
                  </button>
                }
              />
            </div>
          )}
          {legalesMoto.map((d) => {
            const meta = DOCUMENTOS_META[d.documento.tipo];
            const totalDias = 365;
            const restante = Math.max(0, Math.min(1, d.diasRestantes / totalDias));
            return (
              <button
                key={d.documento.id}
                onClick={() => ir("vehiculo")}
                className="card flex flex-col items-start gap-1.5 p-3.5 text-left"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
                    <Icono nombre={meta.icono} size={16} />
                  </span>
                  <Ring value={d.diasRestantes < 0 ? 0 : restante} size={34} stroke={3.5} tono={d.diasRestantes < 0 ? "bad" : d.diasRestantes <= 30 ? "warn" : "ok"} />
                </div>
                <span className="ink text-[0.82rem] font-bold leading-tight">{meta.label}</span>
                <span className="ink-2 text-[0.68rem]">
                  {d.diasRestantes < 0
                    ? `Venció hace ${Math.abs(d.diasRestantes)} días`
                    : `Vigente · ${d.diasRestantes} días`}
                </span>
                <span className="chip chip-info nums mt-0.5">{formatDate(d.documento.fechaVencimiento ?? "")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mantenimiento urgente */}
      {urgentes.length > 0 && (
        <div>
          <SectionTitle title="Mantenimiento" hint="Componentes vencidos o urgentes" action={
            <button className="ink-2 text-xs font-semibold" onClick={() => ir("mantenimientos")}>
              Ver plan
            </button>
          } />
          <div className="card divide-y divide-[var(--line)]">
            {urgentes.map((d) => (
              <button key={d.componente.id} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left" onClick={() => ir("mantenimientos")}>
                <Ring value={d.restantePct} size={36} stroke={4} />
                <div className="min-w-0 flex-1">
                  <div className="ink truncate text-[0.82rem] font-semibold">{d.componente.nombre}</div>
                  <div className="ink-3 nums text-[0.68rem]">
                    {d.kmRestantes > 0 ? `${num(d.kmRestantes)} km` : `+${num(d.kmExcedidos)} km`} ·{" "}
                    {d.diasRestantes > 0 ? `${d.diasRestantes} días` : "vencido"}
                  </div>
                </div>
                <Chip tono={d.estado === "vencido" ? "bad" : "warn"}>{d.estado === "vencido" ? "Vencido" : "Urgente"}</Chip>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tus alertas */}
      <div>
        <SectionTitle title="Tus alertas" hint="Avisos que tú creas" />
        {state.alertas.length === 0 ? (
          <div className="card flex items-center gap-3 px-4 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
              <CalendarClock size={18} />
            </span>
            <div className="flex-1">
              <p className="ink text-[0.85rem] font-semibold">Sin alertas personalizadas</p>
              <p className="ink-2 text-xs">Crea una para la presión de llantas, el aceite o lo que se te ocurra.</p>
            </div>
            <button className="btn btn-soft text-xs" onClick={() => setNueva(true)}>
              Crear
            </button>
          </div>
        ) : (
          <div className="card divide-y divide-[var(--line)]">
            {state.alertas.map((a) => {
              const dias = a.fechaVencimiento
                ? Math.round((new Date(a.fechaVencimiento).getTime() - new Date(hoy).getTime()) / 86_400_000)
                : 0;
              return (
                <div key={a.id} className="flex items-center gap-3 px-3.5 py-2.5">
                  <button
                    onClick={() => guardarAlerta({ ...a, activa: !a.activa })}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: a.activa ? "var(--ok-soft)" : "var(--surface-3)",
                      color: a.activa ? "var(--ok)" : "var(--ink-3)",
                    }}
                    aria-label={a.activa ? "Desactivar alerta" : "Activar alerta"}
                  >
                    <CircleCheck size={16} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="ink truncate text-[0.84rem] font-semibold">{a.titulo}</div>
                    <div className="ink-3 text-[0.68rem]">
                      {a.fechaVencimiento ? `${formatDate(a.fechaVencimiento)} · ${dias < 0 ? `venció hace ${Math.abs(dias)} d` : `en ${dias} d`}` : "Sin fecha"}
                      {a.detalle ? ` · ${a.detalle}` : ""}
                    </div>
                  </div>
                  <button className="icon-btn h-8 w-8" onClick={() => setEdit(a)} aria-label="Editar alerta">
                    <Pencil size={13} />
                  </button>
                  <button className="icon-btn h-8 w-8" onClick={() => borrarAlerta(a.id)} aria-label="Eliminar alerta">
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Día a día */}
      <div>
        <SectionTitle title="Día a día" hint="Pico y placa" action={
          <button className="ink-2 text-xs font-semibold" onClick={() => ir("pico")}>
            Ver semana
          </button>
        } />
        <button className="card flex w-full items-center gap-3 p-3.5 text-left" onClick={() => ir("pico")}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: semana[0].r.restringido ? "var(--bad-soft)" : "var(--ok-soft)", color: semana[0].r.restringido ? "var(--bad)" : "var(--ok)" }}>
            <MapPin size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="ink text-[0.85rem] font-bold">
              {semana[0].r.motivo === "sin-restriccion-ciudad"
                ? `Sin pico y placa para motos en ${ciudad.nombre}`
                : semana[0].r.restringido
                  ? "Hoy tienes restricción"
                  : "Hoy circulas sin problema"}
            </p>
            <p className="ink-2 text-[0.7rem]">
              {semana[0].r.motivo === "sin-restriccion-ciudad"
                ? "La medida aplica a carros particulares"
                : `${ciudad.nombre} · ${semana[0].r.horario}`}
            </p>
          </div>
          <Chip tono="neutral">{state.vehiculo?.placa}</Chip>
          <ChevronRight size={15} style={{ color: "var(--ink-3)" }} />
        </button>
        <p className="ink-3 mt-1.5 px-1 text-[0.66rem]">
          Ciudades disponibles: {CIUDADES.filter((c) => c.id !== "otra").map((c) => c.nombre).join(", ")}. Cambia la tuya en Ajustes.
        </p>
      </div>

      <ModalAlerta open={nueva} onClose={() => setNueva(false)} />
      <ModalAlerta open={Boolean(edit)} onClose={() => setEdit(undefined)} alerta={edit} />
    </div>
  );
}
