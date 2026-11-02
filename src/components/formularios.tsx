import { useEffect, useMemo, useState } from "react";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import type {
  Alerta,
  CategoriaMantenimiento,
  Componente,
  Documento,
  Mantenimiento,
  Taller,
  TipoDocumento,
} from "../types";
import { CATEGORIAS, CATEGORIAS_LISTA, DOCUMENTOS_META } from "../data/catalogo";
import { useApp } from "../store/AppStore";
import { Field, Modal, Segmented } from "./ui";
import { Icono } from "./iconos";
import { isoDate, money, num } from "../lib/format";
import { comprimirImagen } from "../lib/archivos";
import { evaluarPicoPlaca, ciudadPorId, primerDigitoPlaca } from "../lib/picoPlaca";

function aNumero(s: string): number {
  const limpio = s.replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(limpio);
  return Number.isFinite(n) ? n : 0;
}

/* ------------------------------------------------------------------ */
/*  Mantenimiento                                                      */
/* ------------------------------------------------------------------ */

export function ModalMantenimiento({
  open,
  onClose,
  inicial,
  categoriaInicial,
}: {
  open: boolean;
  onClose: () => void;
  inicial?: Mantenimiento;
  categoriaInicial?: CategoriaMantenimiento;
}) {
  const { state, capacidades, registrarMantenimiento, actualizarMantenimiento, borrarMantenimiento } = useApp();
  const v = state.vehiculo;
  const [fecha, setFecha] = useState(isoDate());
  const [km, setKm] = useState("");
  const [categoria, setCategoria] = useState<CategoriaMantenimiento>("aceite");
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<Mantenimiento["tipo"]>("preventivo");
  const [costo, setCosto] = useState("");
  const [taller, setTaller] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [evidencia, setEvidencia] = useState<string | undefined>();
  const [componenteId, setComponenteId] = useState<string>("");
  const [galones, setGalones] = useState("");
  const [precioGalon, setPrecioGalon] = useState("");
  const [tanqueLleno, setTanqueLleno] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    if (inicial) {
      setFecha(inicial.fecha);
      setKm(String(inicial.km));
      setCategoria(inicial.categoria);
      setTitulo(inicial.titulo);
      setTipo(inicial.tipo);
      setCosto(String(inicial.costo));
      setTaller(inicial.taller ?? "");
      setDescripcion(inicial.descripcion ?? "");
      setEvidencia(inicial.evidencia);
      setComponenteId(inicial.componenteId ?? "");
      setGalones(inicial.tanqueo ? String(inicial.tanqueo.galones) : "");
      setPrecioGalon(inicial.tanqueo ? String(inicial.tanqueo.precioGalon) : "");
      setTanqueLleno(inicial.tanqueo?.tanqueLleno ?? true);
    } else {
      const base = categoriaInicial ?? "aceite";
      setFecha(isoDate());
      setKm(v ? String(v.kmActual) : "");
      setCategoria(base);
      setTitulo(CATEGORIAS[base].label);
      setTipo("preventivo");
      setCosto("");
      setTaller(state.talleres[0]?.nombre ?? "");
      setDescripcion("");
      setEvidencia(undefined);
      const comp = state.componentes.find((c) => c.categoria === base);
      setComponenteId(comp?.id ?? "");
      setGalones("");
      setPrecioGalon("");
      setTanqueLleno(true);
    }
  }, [open, inicial, categoriaInicial, v, state.talleres, state.componentes]);

  const esCombustible = categoria === "combustible";
  const totalTanqueo = aNumero(galones) * aNumero(precioGalon);
  const componentesCompatibles = useMemo(
    () => state.componentes.filter((c) => c.activo && (c.categoria === categoria || categoria === "otro")),
    [state.componentes, categoria],
  );

  function elegirCategoria(c: CategoriaMantenimiento) {
    setCategoria(c);
    setTitulo(CATEGORIAS[c].label);
    const comp = state.componentes.find((x) => x.categoria === c);
    setComponenteId(comp?.id ?? "");
    if (c === "combustible") setCosto(String(Math.round(totalTanqueo)));
  }

  async function cargarEvidencia(f: File | undefined) {
    if (!f) return;
    const d = await comprimirImagen(f, 900, 0.7);
    setEvidencia(d);
  }

  function guardar() {
    const kmNum = Math.round(aNumero(km));
    if (!fecha) return setError("Pon la fecha del servicio.");
    if (!v) return setError("Primero configura tu moto.");
    if (kmNum <= 0) return setError("Escribe el kilometraje de la moto.");
    if (kmNum < 100 && v.kmActual > 1000) return setError("Ese kilometraje parece muy bajo. Revísalo.");
    const costoNum = esCombustible ? totalTanqueo : aNumero(costo);
    if (esCombustible && (aNumero(galones) <= 0 || aNumero(precioGalon) <= 0)) {
      return setError("Completa galones y precio por galón.");
    }
    const data = {
      fecha,
      km: kmNum,
      categoria,
      titulo: titulo.trim() || CATEGORIAS[categoria].label,
      tipo,
      costo: Math.round(costoNum),
      taller: taller.trim() || undefined,
      descripcion: descripcion.trim() || undefined,
      evidencia,
      componenteId: componenteId || undefined,
      tanqueo: esCombustible
        ? {
            galones: aNumero(galones),
            precioGalon: aNumero(precioGalon),
            odometro: kmNum,
            tanqueLleno,
          }
        : undefined,
    };
    if (inicial) actualizarMantenimiento(inicial.id, data);
    else registrarMantenimiento(data);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={inicial ? "Editar registro" : "Registrar mantenimiento"}
      footer={
        <div className="flex items-center gap-2">
          {inicial && (
            <button
              className="btn btn-danger"
              onClick={() => {
                borrarMantenimiento(inicial.id);
                onClose();
              }}
              aria-label="Eliminar registro"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button className="btn btn-ghost flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary flex-1" onClick={guardar}>
            {inicial ? "Guardar cambios" : "Guardar"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <span className="label">¿Qué le hiciste a la moto?</span>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {CATEGORIAS_LISTA.filter((c) => c.id !== "soat" && c.id !== "tecnomecanica" && c.id !== "impuesto").map((c) => {
              const activo = categoria === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => elegirCategoria(c.id)}
                  className="flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-center transition-all"
                  style={{
                    borderColor: activo ? "var(--brand)" : "var(--line)",
                    background: activo ? "var(--brand-soft)" : "var(--surface-2)",
                    color: activo ? "var(--brand)" : "var(--ink-2)",
                  }}
                >
                  <Icono nombre={c.icono} size={17} />
                  <span className="text-[0.63rem] font-semibold leading-tight">{c.corto}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha">
            <input className="input" type="date" value={fecha} max={isoDate()} onChange={(e) => setFecha(e.target.value)} />
          </Field>
          <Field label="Kilometraje" hint={v ? `Actual: ${num(v.kmActual)} km` : undefined}>
            <input
              className="input nums"
              inputMode="numeric"
              placeholder={v ? String(v.kmActual) : "0"}
              value={km}
              onChange={(e) => setKm(e.target.value)}
            />
          </Field>
        </div>

        {esCombustible ? (
          <div className="rounded-2xl border border-[var(--line)] p-3" style={{ background: "var(--surface-2)" }}>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Icono nombre="Fuel" size={16} /> Tanqueo
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Galones">
                <input className="input nums" inputMode="decimal" placeholder="3.1" value={galones} onChange={(e) => setGalones(e.target.value)} />
              </Field>
              <Field label="Precio por galón">
                <input
                  className="input nums"
                  inputMode="numeric"
                  placeholder="20000"
                  value={precioGalon}
                  onChange={(e) => setPrecioGalon(e.target.value)}
                />
              </Field>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <label className="ink-2 flex items-center gap-2 text-xs font-medium">
                <input type="checkbox" checked={tanqueLleno} onChange={(e) => setTanqueLleno(e.target.checked)} />
                Tanque lleno (para calcular rendimiento)
              </label>
              <span className="nums ink text-sm font-bold">{money(totalTanqueo)}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Costo total (COP)">
              <input className="input nums" inputMode="numeric" placeholder="0" value={costo} onChange={(e) => setCosto(e.target.value)} />
            </Field>
            <Field label="Taller / lugar">
              <input className="input" list="talleres-lista" placeholder="Opcional" value={taller} onChange={(e) => setTaller(e.target.value)} />
              <datalist id="talleres-lista">
                {state.talleres.map((t) => (
                  <option key={t.id} value={t.nombre} />
                ))}
              </datalist>
            </Field>
          </div>
        )}

        <Field label="Descripción">
          <input
            className="input"
            placeholder="Ej: Yamalube 10W-40 + filtro"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </Field>

        {!esCombustible && (
          <>
            <Field label="Tipo">
              <Segmented
                value={tipo}
                onChange={setTipo}
                options={[
                  { value: "preventivo", label: "Preventivo" },
                  { value: "correctivo", label: "Correctivo" },
                  { value: "revision", label: "Revisión" },
                ]}
              />
            </Field>

            {componentesCompatibles.length > 0 && (
              <Field
                label="Reinicia el plan de"
                hint="Marca el componente para reiniciar su cuenta de km y tiempo."
              >
                <select className="input" value={componenteId} onChange={(e) => setComponenteId(e.target.value)}>
                  <option value="">No reiniciar ningún componente</option>
                  {componentesCompatibles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} (cada {num(c.intervaloKm)} km)
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {capacidades.fotos && (
            <div>
              <span className="label">Foto de la evidencia</span>
              {evidencia ? (
                <div className="relative overflow-hidden rounded-xl border border-[var(--line)]">
                  <img src={evidencia} alt="Evidencia del mantenimiento" className="max-h-44 w-full object-cover" />
                  <button className="icon-btn absolute right-2 top-2" onClick={() => setEvidencia(undefined)} aria-label="Quitar foto">
                    <Trash2 size={15} />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--line-strong)] px-3 py-4 text-xs font-semibold" style={{ color: "var(--ink-2)" }}>
                  <ImagePlus size={16} /> Adjuntar factura o foto (se guarda en tu navegador)
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => void cargarEvidencia(e.target.files?.[0])} />
                </label>
              )}
            </div>
            )}
          </>
        )}

        {error && <p className="text-xs font-semibold" style={{ color: "var(--bad)" }}>{error}</p>}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Tanqueo rápido                                                     */
/* ------------------------------------------------------------------ */

export function ModalTanqueo({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, registrarMantenimiento } = useApp();
  const v = state.vehiculo;
  const [fecha, setFecha] = useState(isoDate());
  const [km, setKm] = useState("");
  const [galones, setGalones] = useState("");
  const [precio, setPrecio] = useState("20000");
  const [lleno, setLleno] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setFecha(isoDate());
    setKm(v ? String(v.kmActual) : "");
    setGalones("");
    setPrecio("20000");
    setLleno(true);
    setError("");
  }, [open, v]);

  const total = aNumero(galones) * aNumero(precio);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar tanqueo"
      footer={
        <div className="flex gap-2">
          <button className="btn btn-ghost flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary flex-1"
            onClick={() => {
              const kmNum = Math.round(aNumero(km));
              if (kmNum <= 0) return setError("Escribe el odómetro actual.");
              if (aNumero(galones) <= 0) return setError("Escribe cuántos galones cargaste.");
              registrarMantenimiento({
                fecha,
                km: kmNum,
                categoria: "combustible",
                titulo: "Tanqueo de combustible",
                tipo: "preventivo",
                costo: Math.round(total),
                tanqueo: { galones: aNumero(galones), precioGalon: aNumero(precio), odometro: kmNum, tanqueLleno: lleno },
              });
              onClose();
            }}
          >
            Guardar tanqueo
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha">
            <input className="input" type="date" value={fecha} max={isoDate()} onChange={(e) => setFecha(e.target.value)} />
          </Field>
          <Field label="Odómetro (km)">
            <input className="input nums" inputMode="numeric" value={km} onChange={(e) => setKm(e.target.value)} />
          </Field>
          <Field label="Galones">
            <input className="input nums" inputMode="decimal" placeholder="3.1" value={galones} onChange={(e) => setGalones(e.target.value)} />
          </Field>
          <Field label="Precio por galón">
            <input className="input nums" inputMode="numeric" value={precio} onChange={(e) => setPrecio(e.target.value)} />
          </Field>
        </div>
        <label className="ink-2 flex items-center gap-2 text-xs font-medium">
          <input type="checkbox" checked={lleno} onChange={(e) => setLleno(e.target.checked)} /> Tanque lleno
        </label>
        <div className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: "var(--brand-soft)" }}>
          <span className="text-xs font-semibold" style={{ color: "var(--brand)" }}>
            Total a pagar
          </span>
          <span className="nums text-base font-extrabold" style={{ color: "var(--brand)" }}>
            {money(total)}
          </span>
        </div>
        {error && <p className="text-xs font-semibold" style={{ color: "var(--bad)" }}>{error}</p>}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Documento de la guantera                                           */
/* ------------------------------------------------------------------ */

const CAMPOS_POR_TIPO: Record<TipoDocumento, { nombre: string; vence: boolean }> = {
  soat: { nombre: "SOAT", vence: true },
  tecnomecanica: { nombre: "Tecnomecánica", vence: true },
  licencia_transito: { nombre: "Licencia de tránsito", vence: false },
  licencia_conduccion: { nombre: "Licencia de conducción", vence: true },
  seguro: { nombre: "Seguro todo riesgo", vence: true },
  impuesto: { nombre: "Impuesto vehicular", vence: true },
  otro: { nombre: "Documento", vence: false },
};

export function ModalDocumento({
  open,
  onClose,
  tipo,
  doc,
}: {
  open: boolean;
  onClose: () => void;
  tipo: TipoDocumento;
  doc?: Documento;
}) {
  const { state, capacidades, guardarDocumento, borrarDocumento } = useApp();
  const v = state.vehiculo;
  const [tipoSel, setTipoSel] = useState<TipoDocumento>(tipo);
  const [nombre, setNombre] = useState("");
  const [numero, setNumero] = useState("");
  const [entidad, setEntidad] = useState("");
  const [expedicion, setExpedicion] = useState("");
  const [vence, setVence] = useState("");
  const [valor, setValor] = useState("");
  const [notas, setNotas] = useState("");
  const [adjunto, setAdjunto] = useState<string | undefined>();

  useEffect(() => {
    if (!open) return;
    const t = doc?.tipo ?? tipo;
    setTipoSel(t);
    setNombre(doc?.nombre ?? CAMPOS_POR_TIPO[t].nombre);
    setNumero(doc?.numero ?? "");
    setEntidad(doc?.entidad ?? "");
    setExpedicion(doc?.fechaExpedicion ?? "");
    setVence(doc?.fechaVencimiento ?? "");
    setValor(doc?.valor ? String(doc.valor) : "");
    setNotas(doc?.notas ?? "");
    setAdjunto(doc?.adjuntoDataUrl);
  }, [open, doc, tipo]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={doc ? "Editar documento" : "Agregar a la guantera"}
      footer={
        <div className="flex items-center gap-2">
          {doc && (
            <button
              className="btn btn-danger"
              onClick={() => {
                borrarDocumento(doc.id);
                onClose();
              }}
              aria-label="Eliminar documento"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button className="btn btn-ghost flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary flex-1"
            onClick={() => {
              if (!v) return;
              guardarDocumento({
                id: doc?.id ?? crypto.randomUUID(),
                vehiculoId: v.id,
                tipo: tipoSel,
                nombre: nombre.trim() || CAMPOS_POR_TIPO[tipoSel].nombre,
                numero: numero.trim() || undefined,
                entidad: entidad.trim() || undefined,
                fechaExpedicion: expedicion || undefined,
                fechaVencimiento: vence || undefined,
                valor: aNumero(valor) || undefined,
                notas: notas.trim() || undefined,
                adjuntoDataUrl: adjunto,
              });
              onClose();
            }}
          >
            Guardar
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipo">
            <select className="input" value={tipoSel} onChange={(e) => {
              const t = e.target.value as TipoDocumento;
              setTipoSel(t);
              if (!doc) setNombre(CAMPOS_POR_TIPO[t].nombre);
            }}>
              {(Object.keys(CAMPOS_POR_TIPO) as TipoDocumento[]).map((t) => (
                <option key={t} value={t}>
                  {DOCUMENTOS_META[t].label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Número / póliza">
            <input className="input" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Opcional" />
          </Field>
          <Field label="Entidad">
            <input className="input" value={entidad} onChange={(e) => setEntidad(e.target.value)} placeholder="Aseguradora, CDA, Secretaría…" />
          </Field>
          <Field label="Valor pagado (COP)">
            <input className="input nums" inputMode="numeric" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Opcional" />
          </Field>
          <Field label="Expedición">
            <input className="input" type="date" value={expedicion} onChange={(e) => setExpedicion(e.target.value)} />
          </Field>
          <Field label={CAMPOS_POR_TIPO[tipoSel].vence ? "Vence" : "Vence (opcional)"}>
            <input className="input" type="date" value={vence} onChange={(e) => setVence(e.target.value)} />
          </Field>
        </div>
        <Field label="Notas">
          <input className="input" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Ej: renovar en línea" />
        </Field>
        {capacidades.fotos && (
        <div>
          <span className="label">Foto del documento</span>
          {adjunto ? (
            <div className="relative overflow-hidden rounded-xl border border-[var(--line)]">
              <img src={adjunto} alt="Documento" className="max-h-40 w-full object-cover" />
              <button className="icon-btn absolute right-2 top-2" onClick={() => setAdjunto(undefined)} aria-label="Quitar">
                <Trash2 size={15} />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--line-strong)] px-3 py-4 text-xs font-semibold" style={{ color: "var(--ink-2)" }}>
              <Camera size={16} /> Adjuntar foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setAdjunto(await comprimirImagen(f, 1200, 0.7));
                }}
              />
            </label>
          )}
        </div>
        )}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Alerta personalizada                                               */
/* ------------------------------------------------------------------ */

export function ModalAlerta({ open, onClose, alerta }: { open: boolean; onClose: () => void; alerta?: Alerta }) {
  const { state, guardarAlerta, borrarAlerta } = useApp();
  const v = state.vehiculo;
  const [titulo, setTitulo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [fecha, setFecha] = useState("");
  const [anticipacion, setAnticipacion] = useState(7);

  useEffect(() => {
    if (!open) return;
    setTitulo(alerta?.titulo ?? "");
    setDetalle(alerta?.detalle ?? "");
    setFecha(alerta?.fechaVencimiento ?? "");
    setAnticipacion(alerta?.anticipacionDias ?? 7);
  }, [open, alerta]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={alerta ? "Editar alerta" : "Nueva alerta"}
      footer={
        <div className="flex items-center gap-2">
          {alerta && (
            <button
              className="btn btn-danger"
              onClick={() => {
                borrarAlerta(alerta.id);
                onClose();
              }}
              aria-label="Eliminar alerta"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button className="btn btn-ghost flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary flex-1"
            onClick={() => {
              if (!v || !titulo.trim() || !fecha) return;
              guardarAlerta({
                id: alerta?.id ?? crypto.randomUUID(),
                vehiculoId: v.id,
                titulo: titulo.trim(),
                detalle: detalle.trim() || undefined,
                tipo: "personalizada",
                fechaVencimiento: fecha,
                anticipacionDias: anticipacion,
                activa: true,
                creada: alerta?.creada ?? isoDate(),
              });
              onClose();
            }}
          >
            Guardar
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="¿De qué te aviso?">
          <input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Revisar presión de llantas" />
        </Field>
        <Field label="Detalle (opcional)">
          <input className="input" value={detalle} onChange={(e) => setDetalle(e.target.value)} placeholder="Ej: 22 psi delante y detrás" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha">
            <input className="input" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </Field>
          <Field label="Avisarme con">
            <select className="input" value={anticipacion} onChange={(e) => setAnticipacion(Number(e.target.value))}>
              {[1, 3, 7, 15, 30, 60].map((d) => (
                <option key={d} value={d}>
                  {d} día{d > 1 ? "s" : ""} de anticipación
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Vehículo                                                           */
/* ------------------------------------------------------------------ */

export function ModalVehiculo({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, capacidades, guardarVehiculo } = useApp();
  const v = state.vehiculo;
  const [apodo, setApodo] = useState("");
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("2023");
  const [color, setColor] = useState("");
  const [km, setKm] = useState("");
  const [matricula, setMatricula] = useState("");
  const [vin, setVin] = useState("");
  const [notas, setNotas] = useState("");
  const [foto, setFoto] = useState<string | undefined>();

  useEffect(() => {
    if (!open || !v) return;
    setApodo(v.apodo);
    setPlaca(v.placa);
    setModelo(String(v.modelo));
    setColor(v.color);
    setKm(String(v.kmActual));
    setMatricula(v.fechaMatricula);
    setVin(v.vin ?? "");
    setNotas(v.notas ?? "");
    setFoto(v.foto);
  }, [open, v]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Datos de la moto"
      footer={
        <div className="flex gap-2">
          <button className="btn btn-ghost flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary flex-1"
            onClick={() => {
              guardarVehiculo({
                apodo: apodo.trim() || "Mi XTZ 250",
                placa: placa.toUpperCase(),
                modelo: Number(modelo) || 2023,
                color,
                kmActual: Math.max(0, Math.round(aNumero(km))),
                fechaMatricula: matricula,
                vin: vin.trim() || undefined,
                notas: notas.trim() || undefined,
                foto,
              });
              onClose();
            }}
          >
            Guardar
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {foto ? (
            <img src={foto} alt="Foto de la moto" className="h-16 w-16 rounded-xl object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
              <Icono nombre="Bike" size={26} />
            </div>
          )}
          {capacidades.fotos ? (
            <label className="btn btn-ghost cursor-pointer text-xs">
              <Camera size={15} /> {foto ? "Cambiar foto" : "Subir foto"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setFoto(await comprimirImagen(f, 1400, 0.75));
                }}
              />
            </label>
          ) : (
            <p className="ink-3 text-[0.68rem] leading-snug">
              Las fotos se guardan solo en la versión del navegador; en Google Sheets no se adjuntan.
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Apodo">
            <input className="input" value={apodo} onChange={(e) => setApodo(e.target.value)} />
          </Field>
          <Field label="Placa">
            <input className="input uppercase" value={placa} onChange={(e) => setPlaca(e.target.value)} />
          </Field>
          <Field label="Modelo (año)">
            <input className="input nums" inputMode="numeric" value={modelo} onChange={(e) => setModelo(e.target.value)} />
          </Field>
          <Field label="Color">
            <input className="input" value={color} onChange={(e) => setColor(e.target.value)} />
          </Field>
          <Field label="Kilometraje actual">
            <input className="input nums" inputMode="numeric" value={km} onChange={(e) => setKm(e.target.value)} />
          </Field>
          <Field label="Fecha de matrícula">
            <input className="input" type="date" value={matricula} onChange={(e) => setMatricula(e.target.value)} />
          </Field>
        </div>
        <Field label="VIN / chasis">
          <input className="input" value={vin} onChange={(e) => setVin(e.target.value)} />
        </Field>
        <Field label="Notas de uso">
          <input className="input" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Ej: 70% ciudad, 30% destapado" />
        </Field>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Componente del plan                                                */
/* ------------------------------------------------------------------ */

export function ModalComponente({
  open,
  onClose,
  componente,
}: {
  open: boolean;
  onClose: () => void;
  componente?: Componente;
}) {
  const { state, guardarComponente, borrarComponente } = useApp();
  const v = state.vehiculo;
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState<CategoriaMantenimiento>("aceite");
  const [intervaloKm, setIntervaloKm] = useState("");
  const [intervaloMeses, setIntervaloMeses] = useState("");
  const [costo, setCosto] = useState("");
  const [ultimoKm, setUltimoKm] = useState("");
  const [ultimaFecha, setUltimaFecha] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (!open) return;
    setNombre(componente?.nombre ?? "");
    setCategoria(componente?.categoria ?? "aceite");
    setIntervaloKm(String(componente?.intervaloKm ?? 3000));
    setIntervaloMeses(String(componente?.intervaloMeses ?? 6));
    setCosto(String(componente?.costoEstimado ?? 0));
    setUltimoKm(String(componente?.ultimoKm ?? v?.kmActual ?? 0));
    setUltimaFecha(componente?.ultimaFecha ?? isoDate());
    setNotas(componente?.notas ?? "");
  }, [open, componente, v]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={componente ? "Editar componente" : "Nuevo componente"}
      footer={
        <div className="flex items-center gap-2">
          {componente && (
            <button
              className="btn btn-danger"
              onClick={() => {
                borrarComponente(componente.id);
                onClose();
              }}
              aria-label="Eliminar componente"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button className="btn btn-ghost flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary flex-1"
            onClick={() => {
              if (!v || !nombre.trim()) return;
              guardarComponente({
                id: componente?.id ?? crypto.randomUUID(),
                vehiculoId: v.id,
                nombre: nombre.trim(),
                categoria,
                intervaloKm: Math.max(1, Math.round(aNumero(intervaloKm))),
                intervaloMeses: Math.max(1, Math.round(aNumero(intervaloMeses))),
                vidaUtilKm: componente?.vidaUtilKm ?? Math.max(1, Math.round(aNumero(intervaloKm))),
                costoEstimado: Math.round(aNumero(costo)),
                ultimoKm: Math.round(aNumero(ultimoKm)),
                ultimaFecha: ultimaFecha || isoDate(),
                notas: notas.trim() || undefined,
                activo: componente?.activo ?? true,
                icono: categoria,
              });
              onClose();
            }}
          >
            Guardar
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Nombre">
          <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Cambio de aceite" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoría">
            <select className="input" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaMantenimiento)}>
              {CATEGORIAS_LISTA.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Costo estimado">
            <input className="input nums" inputMode="numeric" value={costo} onChange={(e) => setCosto(e.target.value)} />
          </Field>
          <Field label="Cada (km)">
            <input className="input nums" inputMode="numeric" value={intervaloKm} onChange={(e) => setIntervaloKm(e.target.value)} />
          </Field>
          <Field label="Cada (meses)">
            <input className="input nums" inputMode="numeric" value={intervaloMeses} onChange={(e) => setIntervaloMeses(e.target.value)} />
          </Field>
          <Field label="Último cambio (km)">
            <input className="input nums" inputMode="numeric" value={ultimoKm} onChange={(e) => setUltimoKm(e.target.value)} />
          </Field>
          <Field label="Último cambio (fecha)">
            <input className="input" type="date" value={ultimaFecha} onChange={(e) => setUltimaFecha(e.target.value)} />
          </Field>
        </div>
        <Field label="Notas">
          <input className="input" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Especificaciones, referencia, etc." />
        </Field>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Taller                                                             */
/* ------------------------------------------------------------------ */

export function ModalTaller({ open, onClose, taller }: { open: boolean; onClose: () => void; taller?: Taller }) {
  const { guardarTaller, borrarTaller } = useApp();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [calificacion, setCalificacion] = useState(5);
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (!open) return;
    setNombre(taller?.nombre ?? "");
    setTelefono(taller?.telefono ?? "");
    setDireccion(taller?.direccion ?? "");
    setEspecialidad(taller?.especialidad ?? "");
    setCalificacion(taller?.calificacion ?? 5);
    setNotas(taller?.notas ?? "");
  }, [open, taller]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={taller ? "Editar taller" : "Nuevo taller"}
      footer={
        <div className="flex items-center gap-2">
          {taller && (
            <button
              className="btn btn-danger"
              onClick={() => {
                borrarTaller(taller.id);
                onClose();
              }}
              aria-label="Eliminar taller"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button className="btn btn-ghost flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary flex-1"
            onClick={() => {
              if (!nombre.trim()) return;
              guardarTaller({
                id: taller?.id ?? crypto.randomUUID(),
                nombre: nombre.trim(),
                telefono: telefono.trim() || undefined,
                direccion: direccion.trim() || undefined,
                especialidad: especialidad.trim() || undefined,
                calificacion,
                notas: notas.trim() || undefined,
              });
              onClose();
            }}
          >
            Guardar
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Nombre">
          <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Teléfono">
            <input className="input" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </Field>
          <Field label="Especialidad">
            <input className="input" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} placeholder="Yamaha, frenos…" />
          </Field>
        </div>
        <Field label="Dirección">
          <input className="input" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        </Field>
        <Field label="Calificación">
          <select className="input" value={calificacion} onChange={(e) => setCalificacion(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {"★".repeat(n)} ({n})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Notas">
          <input className="input" value={notas} onChange={(e) => setNotas(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Pico y placa (config)                                              */
/* ------------------------------------------------------------------ */

export function ModalPicoConfig({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, guardarAjustes } = useApp();
  const ciudad = ciudadPorId(state.ajustes.ciudad);
  const [dias, setDias] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const inicial: Record<string, string> = {};
    for (const d of [1, 2, 3, 4, 5]) {
      const v = state.ajustes.picoPlacaDigitos[String(d)] ?? ciudad.digitosPorDia[d] ?? [];
      inicial[String(d)] = v.join(",");
    }
    setDias(inicial);
  }, [open, state.ajustes.picoPlacaDigitos, ciudad]);

  const nombres = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pico y placa · reglas"
      footer={
        <div className="flex gap-2">
          <button
            className="btn btn-ghost flex-1"
            onClick={() => {
              guardarAjustes({ picoPlacaDigitos: {} });
              onClose();
            }}
          >
            Restaurar
          </button>
          <button
            className="btn btn-primary flex-1"
            onClick={() => {
              const mapa: Record<string, number[]> = {};
              for (const [d, txt] of Object.entries(dias)) {
                const arr = txt
                  .split(/[, ]+/)
                  .map((x) => Number(x.trim()))
                  .filter((n) => Number.isInteger(n) && n >= 0 && n <= 9);
                if (arr.length) mapa[d] = arr;
              }
              guardarAjustes({ picoPlacaDigitos: mapa });
              onClose();
            }}
          >
            Guardar
          </button>
        </div>
      }
    >
      <p className="ink-2 mb-3 text-xs">
        Ajusta los dígitos restringidos por día en {ciudad.nombre}. En motos se usa el{" "}
        {ciudad.usaPrimerDigito ? "primer" : "último"} dígito de la placa. La rotación cambia cada semestre: edítala aquí.
      </p>
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 5].map((d) => (
          <div key={d} className="flex items-center gap-3">
            <span className="ink-2 w-24 text-sm font-semibold">{nombres[d]}</span>
            <input
              className="input nums flex-1"
              value={dias[String(d)] ?? ""}
              onChange={(e) => setDias((prev) => ({ ...prev, [String(d)]: e.target.value }))}
              placeholder="Ej: 1,4"
            />
          </div>
        ))}
      </div>
      {primerDigitoPlaca(state.vehiculo?.placa ?? "") === null && (
        <p className="mt-3 text-xs" style={{ color: "var(--warn)" }}>
          Tu placa no tiene dígitos; configura la placa en los datos de la moto para calcular el pico y placa.
        </p>
      )}
      <p className="ink-3 mt-3 text-[0.7rem]">
        Hoy en {ciudad.nombre}:{" "}
        {(() => {
          const r = evaluarPicoPlaca(
            state.vehiculo?.placa ?? "",
            isoDate(),
            ciudad,
            state.ajustes.tipoVehiculo === "moto",
            state.ajustes.picoPlacaDigitos,
          );
          if (r.motivo === "sin-restriccion-ciudad") return "sin restricción para motos.";
          if (r.motivo === "exceptuado") return "hoy es festivo, no aplica.";
          if (r.motivo === "no-aplica-dia") return "sin restricción hoy.";
          if (r.motivo === "restringido") return `restringido (dígitos ${r.digitos.join(" y ")}).`;
          return "no se pudo evaluar.";
        })()}
      </p>
    </Modal>
  );
}
