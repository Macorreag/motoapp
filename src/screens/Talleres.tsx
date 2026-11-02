import { useState } from "react";
import { MapPin, Pencil, Phone, Plus, Star, Store, Wrench } from "lucide-react";
import type { OrdenServicio, Taller } from "../types";
import { useApp } from "../store/AppStore";
import { Chip, EmptyState, Field, Modal, Segmented } from "../components/ui";
import { ModalTaller } from "../components/formularios";
import { formatDate, isoDate, money, num } from "../lib/format";

export function Talleres() {
  const { state, guardarOrden, borrarOrden } = useApp();
  const [tallerModal, setTallerModal] = useState<Taller | undefined>();
  const [abrirTaller, setAbrirTaller] = useState(false);
  const [abrirOrden, setAbrirOrden] = useState(false);
  const [vista, setVista] = useState<"talleres" | "ordenes">("talleres");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="ink text-[1.35rem] font-extrabold tracking-tight">Talleres</h1>
          <p className="ink-2 text-[0.8rem]">Tu red de confianza y sus órdenes</p>
        </div>
        <div className="flex gap-1.5">
          <button className="icon-btn" onClick={() => setAbrirOrden(true)} aria-label="Nueva orden">
            <Wrench size={16} />
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setTallerModal(undefined);
              setAbrirTaller(true);
            }}
          >
            <Plus size={16} /> Taller
          </button>
        </div>
      </div>

      <Segmented
        value={vista}
        onChange={setVista}
        options={[
          { value: "talleres", label: "Talleres" },
          { value: "ordenes", label: "Órdenes" },
        ]}
      />

      {vista === "talleres" && (
        <div className="flex flex-col gap-2">
          {state.talleres.length === 0 ? (
            <EmptyState
              icon={<Store size={22} />}
              title="Sin talleres guardados"
              description="Guarda el taller de confianza, el de frenos y el electricista. Así no pierdes el teléfono cuando la moto falla."
              action={
                <button className="btn btn-primary" onClick={() => setAbrirTaller(true)}>
                  Agregar taller
                </button>
              }
            />
          ) : (
            state.talleres.map((t) => (
              <div key={t.id} className="card p-3.5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
                    <Store size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="ink text-[0.88rem] font-bold leading-snug">{t.nombre}</h3>
                      <Chip tono="warn">
                        <Star size={11} /> {t.calificacion}
                      </Chip>
                    </div>
                    {t.especialidad && <p className="ink-2 text-[0.72rem]">{t.especialidad}</p>}
                    <div className="ink-3 mt-1 flex flex-col gap-0.5 text-[0.68rem]">
                      {t.direccion && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {t.direccion}
                        </span>
                      )}
                      {t.telefono && (
                        <a className="flex items-center gap-1" href={`tel:${t.telefono.replace(/\s/g, "")}`}>
                          <Phone size={11} /> {t.telefono}
                        </a>
                      )}
                    </div>
                    {t.notas && <p className="ink-2 mt-1.5 text-[0.7rem]">{t.notas}</p>}
                  </div>
                  <button
                    className="icon-btn shrink-0"
                    onClick={() => {
                      setTallerModal(t);
                      setAbrirTaller(true);
                    }}
                    aria-label={`Editar ${t.nombre}`}
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
          <p className="ink-3 px-1 text-[0.68rem] leading-relaxed">
            Tip: agenda el próximo servicio con el taller y guárdalo como orden abierta. Cuando lo cierres, lo
            registras como mantenimiento y queda en la hoja de vida.
          </p>
        </div>
      )}

      {vista === "ordenes" && (
        <div className="flex flex-col gap-2">
          {state.ordenes.length === 0 ? (
            <EmptyState
              icon={<Wrench size={22} />}
              title="Sin órdenes de servicio"
              description="Registra lo que le pediste al taller: concepto, costo, calificación y si ya quedó cerrada."
              action={
                <button className="btn btn-primary" onClick={() => setAbrirOrden(true)}>
                  Crear orden
                </button>
              }
            />
          ) : (
            state.ordenes.map((o) => (
              <div key={o.id} className="card p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="ink text-[0.86rem] font-bold">{o.concepto}</h3>
                    <p className="ink-3 nums text-[0.68rem]">
                      {formatDate(o.fecha)} · {num(o.km)} km · {state.talleres.find((t) => t.id === o.tallerId)?.nombre ?? "Sin taller"}
                    </p>
                  </div>
                  <Chip tono={o.estado === "cerrada" ? "ok" : "warn"}>{o.estado}</Chip>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="nums ink text-[0.85rem] font-bold">{money(o.costo)}</span>
                  <div className="flex items-center gap-1.5">
                    {o.calificacion ? (
                      <span className="ink-3 nums flex items-center gap-0.5 text-[0.7rem]">
                        <Star size={11} /> {o.calificacion}
                      </span>
                    ) : null}
                    <button
                      className="btn btn-ghost px-2 py-1 text-[0.66rem]"
                      onClick={() => guardarOrden({ ...o, estado: o.estado === "abierta" ? "cerrada" : "abierta" })}
                    >
                      {o.estado === "abierta" ? "Cerrar" : "Reabrir"}
                    </button>
                    <button className="btn btn-danger px-2 py-1 text-[0.66rem]" onClick={() => borrarOrden(o.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ModalTaller open={abrirTaller} onClose={() => setAbrirTaller(false)} taller={tallerModal} />
      <ModalOrden open={abrirOrden} onClose={() => setAbrirOrden(false)} />
    </div>
  );
}

function ModalOrden({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, guardarOrden } = useApp();
  const [concepto, setConcepto] = useState("");
  const [tallerId, setTallerId] = useState("");
  const [fecha, setFecha] = useState(isoDate());
  const [km, setKm] = useState(String(state.vehiculo?.kmActual ?? 0));
  const [costo, setCosto] = useState("");
  const [estado, setEstado] = useState<OrdenServicio["estado"]>("abierta");
  const [calificacion, setCalificacion] = useState(0);
  const [notas, setNotas] = useState("");

  const v = state.vehiculo;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva orden de servicio"
      footer={
        <div className="flex gap-2">
          <button className="btn btn-ghost flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary flex-1"
            onClick={() => {
              if (!v || !concepto.trim()) return;
              guardarOrden({
                id: crypto.randomUUID(),
                vehiculoId: v.id,
                tallerId: tallerId || undefined,
                fecha,
                km: Number(km) || v.kmActual,
                concepto: concepto.trim(),
                costo: Number(costo.replace(/[^\d]/g, "")) || 0,
                calificacion: calificacion || undefined,
                estado,
                notas: notas.trim() || undefined,
              });
              setConcepto("");
              setCosto("");
              setNotas("");
              onClose();
            }}
          >
            Guardar
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Concepto">
          <input className="input" value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Ej: cambio de kit de arrastre" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Taller">
            <select className="input" value={tallerId} onChange={(e) => setTallerId(e.target.value)}>
              <option value="">Sin taller</option>
              {state.talleres.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estado">
            <select className="input" value={estado} onChange={(e) => setEstado(e.target.value as OrdenServicio["estado"])}>
              <option value="abierta">Abierta</option>
              <option value="cerrada">Cerrada</option>
            </select>
          </Field>
          <Field label="Fecha">
            <input className="input" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </Field>
          <Field label="Km">
            <input className="input nums" inputMode="numeric" value={km} onChange={(e) => setKm(e.target.value)} />
          </Field>
          <Field label="Costo">
            <input className="input nums" inputMode="numeric" value={costo} onChange={(e) => setCosto(e.target.value)} />
          </Field>
          <Field label="Calificación">
            <select className="input" value={calificacion} onChange={(e) => setCalificacion(Number(e.target.value))}>
              <option value={0}>Sin calificar</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Notas">
          <input className="input" value={notas} onChange={(e) => setNotas(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
