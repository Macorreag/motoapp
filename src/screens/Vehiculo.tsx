import { useEffect, useMemo, useState } from "react";
import { BookOpen, Camera, ChevronRight, Info, Pencil, Plus, QrCode as QrIcon, ShieldAlert, X } from "lucide-react";
import QRCode from "qrcode";
import type { CategoriaMantenimiento, Documento, TipoDocumento } from "../types";
import { useApp } from "../store/AppStore";
import { Modal, Ring, SectionTitle } from "../components/ui";
import { Icono } from "../components/iconos";
import { desgastes, documentosConVencimiento } from "../lib/calc";
import { formatDate, formatFechaCorta, num } from "../lib/format";
import { DOCUMENTOS_META, GUANTERA } from "../data/catalogo";
import { FICHA_XTZ250, ENLACES_UTILES } from "../data/ficha";
import { comprimirImagen } from "../lib/archivos";
import { proximaRTM } from "../lib/legal";
import { ModalComponente, ModalDocumento, ModalVehiculo } from "../components/formularios";

export function Vehiculo({ onServicio }: { onServicio: (categoria?: CategoriaMantenimiento) => void }) {
  const { state, capacidades, guardarVehiculo, borrarDocumento } = useApp();
  const v = state.vehiculo;
  const [modalVehiculo, setModalVehiculo] = useState(false);
  const [docTipo, setDocTipo] = useState<TipoDocumento | null>(null);
  const [docEdit, setDocEdit] = useState<Documento | undefined>();
  const [verQR, setVerQR] = useState(false);
  const [verFicha, setVerFicha] = useState(false);
  const [compEdit, setCompEdit] = useState<string | null>(null);
  const [verTodosInd, setVerTodosInd] = useState(false);

  const qr = useQRCode(v ? `YAMAHA XTZ 250 · ${v.placa} · ${num(v.kmActual)} km · ${v.modelo}` : "");
  const ds = useMemo(() => desgastes(state), [state]);
  const docsVenc = documentosConVencimiento(state);
  if (!v) return null;

  const docsPorTipo = new Map(state.documentos.map((d) => [d.tipo, d]));
  const indicadores = verTodosInd ? ds : ds.slice(0, 6);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="ink text-[1.35rem] font-extrabold tracking-tight">Mi moto</h1>
          <p className="ink-2 text-[0.8rem]">Hoja de vida, guantera y estado de componentes</p>
        </div>
        <button className="icon-btn" onClick={() => setModalVehiculo(true)} aria-label="Editar datos">
          <Pencil size={16} />
        </button>
      </div>

      {/* Hero */}
      <div className="card overflow-hidden">
        <div className="relative h-36 w-full overflow-hidden" style={{ background: "linear-gradient(135deg,#1e293b,#0f172a)" }}>
          {v.foto ? (
            <img src={v.foto} alt={`Foto de ${v.apodo}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center gap-6 opacity-90">
              <div className="text-center text-white">
                <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Icono nombre="Bike" size={26} />
                </div>
                <p className="text-[0.7rem] font-medium text-white/70">Sube una foto de tu moto</p>
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/45 to-transparent" />
          {capacidades.fotos && (
            <label className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur">
              <Camera size={16} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) guardarVehiculo({ foto: await comprimirImagen(f, 1400, 0.75) });
                }}
              />
            </label>
          )}
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="rounded-lg bg-white/90 px-2 py-1 text-[0.7rem] font-extrabold tracking-wide text-slate-900">{v.placa}</span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-3 px-4 py-3">
          <div>
            <h2 className="ink text-[1.15rem] font-extrabold leading-tight">{v.apodo}</h2>
            <p className="ink-2 truncate text-[0.8rem]">
              {v.marca} {v.linea} · {v.modelo} · {v.color}
            </p>
            <p className="ink-3 nums mt-1 text-xs">
              {num(v.kmActual)} km · matrícula {formatDate(v.fechaMatricula)}
            </p>
          </div>
          <div className="flex gap-1.5">
            <button className="icon-btn" onClick={() => setVerQR(true)} aria-label="QR del vehículo">
              <QrIcon size={17} />
            </button>
            <button className="icon-btn" onClick={() => setVerFicha(true)} aria-label="Ficha técnica">
              <BookOpen size={17} />
            </button>
          </div>
        </div>
        {v.notas && (
          <p className="ink-2 border-t border-[var(--line)] px-4 py-2 text-xs">{v.notas}</p>
        )}
      </div>

      {/* Guantera */}
      <div>
        <SectionTitle
          title="Guantera"
          hint="5 espacios para tus documentos"
          action={
            <button className="ink-2 text-xs font-semibold" onClick={() => setDocTipo("otro")}>
              + Otro
            </button>
          }
        />
        <div className="scroll-x -mx-1 flex gap-2 px-1 pb-1">
          {GUANTERA.map((tipo) => {
            const doc = docsPorTipo.get(tipo);
            const estado = docsVenc.find((d) => d.documento.tipo === tipo);
            const tono = !doc ? "neutral" : !estado ? "ok" : estado.diasRestantes < 0 ? "bad" : estado.diasRestantes <= 30 ? "warn" : "ok";
            const meta = DOCUMENTOS_META[tipo];
            return (
              <button
                key={tipo}
                onClick={() => {
                  if (doc) {
                    setDocEdit(doc);
                    setDocTipo(tipo);
                  } else {
                    setDocEdit(undefined);
                    setDocTipo(tipo);
                  }
                }}
                className="card-flat flex w-[104px] shrink-0 flex-col items-center gap-1 px-2 py-3 text-center"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    background: !doc ? "var(--surface-3)" : tono === "ok" ? "var(--ok-soft)" : tono === "warn" ? "var(--warn-soft)" : tono === "bad" ? "var(--bad-soft)" : "var(--surface-3)",
                    color: !doc ? "var(--ink-3)" : tono === "ok" ? "var(--ok)" : tono === "warn" ? "var(--warn)" : tono === "bad" ? "var(--bad)" : "var(--ink-3)",
                  }}
                >
                  {doc ? <Icono nombre={meta.icono} size={17} /> : <Plus size={16} />}
                </span>
                <span className="ink text-[0.68rem] font-bold leading-tight">{meta.corto}</span>
                <span className="ink-3 text-[0.6rem] leading-tight">
                  {!doc
                    ? "Agregar"
                    : estado
                      ? estado.diasRestantes < 0
                        ? "Vencido"
                        : `Vence en ${estado.diasRestantes} d`
                      : "Sin vencimiento"}
                </span>
              </button>
            );
          })}
        </div>
        {state.documentos.filter((d) => !GUANTERA.includes(d.tipo)).length > 0 && (
          <div className="mt-2 flex flex-col gap-1.5">
            {state.documentos
              .filter((d) => !GUANTERA.includes(d.tipo))
              .map((d) => (
                <div key={d.id} className="card-flat flex items-center gap-2 px-3 py-2">
                  <Icono nombre="FileText" size={16} />
                  <span className="ink flex-1 text-xs font-semibold">{d.nombre}</span>
                  {d.fechaVencimiento && <span className="ink-3 nums text-[0.68rem]">{formatDate(d.fechaVencimiento)}</span>}
                  <button className="ink-3" onClick={() => borrarDocumento(d.id)} aria-label={`Eliminar ${d.nombre}`}>
                    <X size={14} />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Indicadores */}
      <div>
        <SectionTitle
          title="Indicadores de desgaste"
          hint="Vida útil restante según km y tiempo"
          action={
            <button className="ink-2 text-xs font-semibold" onClick={() => setVerTodosInd((x) => !x)}>
              {verTodosInd ? "Ver menos" : "Ver todos"}
            </button>
          }
        />
        <div className="card divide-y divide-[var(--line)]">
          {indicadores.map((d) => (
            <button
              key={d.componente.id}
              className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
              onClick={() => setCompEdit(d.componente.id)}
            >
              <Ring value={d.restantePct} size={44} stroke={4.5} />
              <div className="min-w-0 flex-1">
                <div className="ink text-[0.85rem] font-semibold leading-snug">{d.componente.nombre}</div>
                <div className="ink-3 nums mt-0.5 text-[0.7rem]" aria-label={`Estado: ${d.estado}`}>
                  {d.kmRestantes > 0 ? `${num(d.proximoKm)} km` : `+${num(d.kmExcedidos)} km`} ·{" "}
                  {formatFechaCorta(d.proximoVencimiento)}
                </div>
              </div>
              <ChevronRight size={15} className="shrink-0" style={{ color: "var(--ink-3)" }} />
            </button>
          ))}
        </div>
        <button className="btn btn-ghost mt-2 w-full" onClick={() => onServicio()}>
          <Plus size={15} /> Registrar servicio hecho
        </button>
      </div>

      {/* Datos legales rápidos */}
      <div className="card p-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} style={{ color: "var(--brand)" }} />
          <h3 className="ink text-[0.9rem] font-bold">Cumplimiento legal</h3>
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          {!state.documentos.some((d) => d.tipo === "tecnomecanica" && d.fechaVencimiento) && (
            <p className="ink-2 mb-1 rounded-lg px-2 py-1.5 text-[0.68rem]" style={{ background: "var(--surface-2)" }}>
              Según tu matrícula, la próxima tecnomecánica sería el{" "}
              <span className="ink font-semibold">{formatDate(proximaRTM(v.fechaMatricula) ?? "")}</span>. Agrega la fecha real
              en la guantera.
            </p>
          )}
          {docsVenc.length === 0 && (
            <p className="ink-2 text-xs">
              Aún no registras fechas de vencimiento. Agrégalas en la guantera para recibir alertas.
            </p>
          )}
          {docsVenc.slice(0, 4).map((d) => (
            <div key={d.documento.id} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: d.diasRestantes < 0 ? "var(--bad)" : d.diasRestantes <= 30 ? "var(--warn)" : "var(--ok)" }}
              />
              <span className="ink flex-1 text-xs font-semibold">{d.documento.nombre}</span>
              <span className="ink-2 nums text-[0.7rem]">
                {d.diasRestantes < 0 ? `vencido hace ${Math.abs(d.diasRestantes)} d` : `${d.diasRestantes} días`}
              </span>
              <span className="ink-3 nums text-[0.7rem]">{formatDate(d.documento.fechaVencimiento ?? "")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Atributos */}
      <div className="card p-4">
        <h3 className="ink mb-2 text-[0.9rem] font-bold">Atributos del vehículo</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
          {[
            ["Marca", v.marca],
            ["Línea", v.linea],
            ["Modelo", String(v.modelo)],
            ["Cilindraje", `${v.cilindraje} cc`],
            ["Color", v.color],
            ["Placa", v.placa],
            ["VIN", v.vin ?? "—"],
            ["Motor", v.numeroMotor ?? "—"],
            ["Matrícula", formatDate(v.fechaMatricula)],
          ].map(([k, val]) => (
            <div key={k}>
              <dt className="ink-3 text-[0.65rem] font-bold uppercase tracking-wide">{k}</dt>
              <dd className="ink nums truncate font-semibold">{val}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Modales */}
      <ModalVehiculo open={modalVehiculo} onClose={() => setModalVehiculo(false)} />
      {docTipo && (
        <ModalDocumento
          open={Boolean(docTipo)}
          onClose={() => {
            setDocTipo(null);
            setDocEdit(undefined);
          }}
          tipo={docTipo}
          doc={docEdit}
        />
      )}
      <ModalComponente
        open={Boolean(compEdit)}
        onClose={() => setCompEdit(null)}
        componente={state.componentes.find((c) => c.id === compEdit)}
      />

      <Modal open={verQR} onClose={() => setVerQR(false)} title="QR del vehículo">
        <div className="flex flex-col items-center gap-3 py-2">
          {qr && <img src={qr} alt="Código QR del vehículo" className="h-52 w-52 rounded-xl border border-[var(--line)]" />}
          <p className="ink-2 text-center text-xs leading-relaxed">
            Compártelo con tu taller o pégalo en la moto. Cualquier persona con la app puede leer los datos básicos
            del vehículo y su historial si tú lo autorizas.
          </p>
          <div className="card-flat w-full px-3 py-2 text-center">
            <p className="ink nums text-sm font-bold">
              {v.marca} {v.linea} · {v.placa}
            </p>
            <p className="ink-3 nums text-[0.7rem]">{num(v.kmActual)} km · modelo {v.modelo}</p>
          </div>
        </div>
      </Modal>

      <Modal open={verFicha} onClose={() => setVerFicha(false)} title="Ficha técnica XTZ 250" wide>
        <div className="flex flex-col gap-4">
          <p className="ink-2 text-xs leading-relaxed">
            Datos de referencia del motor 249 cc de la XTZ 250. Verifica siempre contra el manual de tu modelo y año.
          </p>
          {FICHA_XTZ250.map((grupo) => (
            <div key={grupo.titulo}>
              <h4 className="ink mb-1.5 text-[0.82rem] font-bold uppercase tracking-wide">{grupo.titulo}</h4>
              <dl className="divide-y divide-[var(--line)]">
                {grupo.filas.map((f) => (
                  <div key={f.label} className="flex items-start justify-between gap-4 py-1.5">
                    <dt className="ink-2 text-xs">{f.label}</dt>
                    <dd className="ink nums text-right text-xs font-semibold">
                      {f.valor}
                      {f.nota && <span className="ink-3 block text-[0.65rem] font-medium">{f.nota}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {ENLACES_UTILES.map((e) => (
              <a key={e.url} href={e.url} target="_blank" rel="noreferrer" className="btn btn-ghost text-xs">
                {e.label}
              </a>
            ))}
          </div>
          <p className="ink-3 flex items-start gap-1.5 text-[0.68rem]">
            <Info size={13} className="mt-0.5 shrink-0" /> Los costos y periodicidades son editables en
            Mantenimientos → Componentes.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function useQRCode(texto: string): string {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!texto) return;
    let vivo = true;
    void QRCode.toDataURL(texto, { width: 420, margin: 1, errorCorrectionLevel: "M" })
      .then((u) => {
        if (vivo) setUrl(u);
      })
      .catch(() => setUrl(""));
    return () => {
      vivo = false;
    };
  }, [texto]);
  return url;
}
