import { useState } from "react";
import {
  Award,
  ChevronRight,
  Download,
  ExternalLink,
  Info,
  Loader,
  RefreshCw,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { useApp } from "../store/AppStore";
import { Chip, Field, Modal, SectionTitle, Segmented } from "../components/ui";
import { ModalPicoConfig, ModalVehiculo } from "../components/formularios";
import { CIUDADES } from "../lib/picoPlaca";
import { descargar } from "../lib/archivos";
import { isoDate, money, num } from "../lib/format";
import { COMPARENDOS, RTM_BOGOTA_2026, soatPorCilindraje } from "../lib/legal";
import { URL_EDITOR, URL_HOJA } from "../lib/entorno";
import type { PuntoEvento } from "../types";

export function Ajustes() {
  const { state, guardarAjustes, exportar, importar, reiniciar, cargarDemo, cargado, capacidades } = useApp();
  const [confirmar, setConfirmar] = useState(false);
  const [fuentes, setFuentes] = useState(false);
  const [msg, setMsg] = useState("");
  const [pico, setPico] = useState(false);
  const [vehiculo, setVehiculo] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="ink text-[1.35rem] font-extrabold tracking-tight">Ajustes</h1>
        <p className="ink-2 text-[0.8rem]">Perfil, datos y reglas de la app</p>
      </div>

      <div>
        <SectionTitle title="Perfil" />
        <div className="card flex flex-col gap-3 p-4">
          <Field label="Tu nombre">
            <input
              className="input"
              value={state.ajustes.nombre}
              onChange={(e) => guardarAjustes({ nombre: e.target.value })}
              placeholder="Cómo te saluda la app"
            />
          </Field>
          <Field label="Ciudad">
            <select className="input" value={state.ajustes.ciudad} onChange={(e) => guardarAjustes({ ciudad: e.target.value })}>
              {CIUDADES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </Field>
          <div>
            <span className="label">Tema</span>
            <Segmented
              size="sm"
              value={state.ajustes.tema}
              onChange={(t) => guardarAjustes({ tema: t })}
              options={[
                { value: "claro", label: "Claro" },
                { value: "oscuro", label: "Oscuro" },
                { value: "auto", label: "Auto" },
              ]}
            />
          </div>
          <button className="btn btn-ghost" onClick={() => setVehiculo(true)}>
            <User size={15} /> Editar datos de la moto
          </button>
        </div>
      </div>

      <div>
        <SectionTitle title="Pico y placa" hint="Regla configurable por ciudad y año" />
        <div className="card divide-y divide-[var(--line)]">
          <button className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left" onClick={() => setPico(true)}>
            <span>
              <span className="ink block text-[0.86rem] font-semibold">Dígitos por día</span>
              <span className="ink-2 block text-[0.7rem]">
                {CIUDADES.find((c) => c.id === state.ajustes.ciudad)?.nombre} ·{" "}
                {Object.keys(state.ajustes.picoPlacaDigitos).length > 0 ? "personalizado" : "regla de la app"}
              </span>
            </span>
            <ChevronRight size={16} style={{ color: "var(--ink-3)" }} />
          </button>
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <span>
              <span className="ink block text-[0.86rem] font-semibold">Mostrar pico y placa</span>
              <span className="ink-2 block text-[0.7rem]">En inicio y alertas</span>
            </span>
            <button
              role="switch"
              aria-checked={state.ajustes.picoPlacaActivo}
              onClick={() => guardarAjustes({ picoPlacaActivo: !state.ajustes.picoPlacaActivo })}
              className="relative h-6 w-11 rounded-full transition-colors"
              style={{ background: state.ajustes.picoPlacaActivo ? "var(--brand)" : "var(--surface-3)" }}
            >
              <span
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left]"
                style={{ left: state.ajustes.picoPlacaActivo ? 22 : 2 }}
              />
            </button>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle title="Tus datos" hint="Todo vive en este navegador" />
        <div className="card divide-y divide-[var(--line)]">
          <div className="flex items-center gap-3 px-4 py-3">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl text-[0.7rem] font-black"
              style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
            >
              {capacidades.backend === "gas" ? "GS" : "NB"}
            </span>
            <span className="flex-1">
              <span className="ink block text-[0.86rem] font-semibold">
                {capacidades.backend === "gas" ? "Guardado en Google Sheets" : "Guardado en este navegador"}
              </span>
              <span className="ink-2 block text-[0.7rem]">
                {capacidades.backend === "gas"
                  ? "Edita la hoja y la app se actualiza en ~15 segundos"
                  : "Índice del navegador (IndexedDB); exporta un respaldo si cambias de equipo"}
              </span>
            </span>
            {cargado ? null : <Loader size={14} />}
          </div>
          {capacidades.backend === "gas" && (
            <div className="flex flex-wrap gap-2 px-4 py-3">
              {URL_HOJA && (
                <a className="btn btn-ghost text-[0.72rem]" href={URL_HOJA} target="_blank" rel="noreferrer">
                  Abrir la hoja <ExternalLink size={12} />
                </a>
              )}
              {URL_EDITOR && (
                <a className="btn btn-ghost text-[0.72rem]" href={URL_EDITOR} target="_blank" rel="noreferrer">
                  Abrir Apps Script <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}
          <button
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
            onClick={() => {
              descargar(`motoapp-respaldo-${isoDate()}.json`, exportar(), "application/json");
              setMsg("Respaldo descargado.");
            }}
          >
            <Download size={16} style={{ color: "var(--info)" }} />
            <span className="flex-1">
              <span className="ink block text-[0.86rem] font-semibold">Exportar respaldo</span>
              <span className="ink-2 block text-[0.7rem]">JSON con moto, plan, documentos e historial</span>
            </span>
          </button>
          <label className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left">
            <Upload size={16} style={{ color: "var(--ok)" }} />
            <span className="flex-1">
              <span className="ink block text-[0.86rem] font-semibold">Importar respaldo</span>
              <span className="ink-2 block text-[0.7rem]">Reemplaza los datos actuales</span>
            </span>
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const txt = await f.text();
                setMsg(importar(txt) ? "Respaldo importado." : "Ese archivo no es un respaldo válido.");
              }}
            />
          </label>
          <button
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
            onClick={() => {
              cargarDemo();
              setMsg("Datos de ejemplo cargados.");
            }}
          >
            <RefreshCw size={16} style={{ color: "var(--brand)" }} />
            <span className="flex-1">
              <span className="ink block text-[0.86rem] font-semibold">Cargar datos de ejemplo</span>
              <span className="ink-2 block text-[0.7rem]">Útil para probar la app con historial</span>
            </span>
          </button>
          <button className="flex w-full items-center gap-3 px-4 py-3 text-left" onClick={() => setConfirmar(true)}>
            <Trash2 size={16} style={{ color: "var(--bad)" }} />
            <span className="flex-1">
              <span className="block text-[0.86rem] font-semibold" style={{ color: "var(--bad)" }}>
                Borrar todo
              </span>
              <span className="ink-2 block text-[0.7rem]">Vuelve a la pantalla de configuración inicial</span>
            </span>
          </button>
        </div>
        {msg && (
          <p className="mt-2 flex items-center gap-1.5 px-1 text-xs font-semibold" style={{ color: "var(--ok)" }}>
            {cargado ? null : <Loader size={12} />} {msg}
          </p>
        )}
      </div>

      <div>
        <SectionTitle title="Fuentes y alcance" />
        <div className="card p-4">
          <p className="ink-2 text-xs leading-relaxed">
            Este clon web está inspirado en Tucamo (tucamo.co). No usa sus datos ni su código: el plan de
            mantenimiento, los precios y las reglas legales son de referencia y editables.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip tono="info">SOAT 2026 moto &gt;200cc: {money(soatPorCilindraje(249))}</Chip>
            <Chip tono="info">RTM: 2 años y luego anual</Chip>
            <Chip tono="info">Impuesto: 250cc sí paga</Chip>
          </div>
          <button className="btn btn-ghost mt-3 w-full text-xs" onClick={() => setFuentes(true)}>
            <Info size={14} /> Ver fuentes y reglas
          </button>
        </div>
      </div>

      <p className="ink-3 pb-2 text-center text-[0.66rem]">
        MotoApp · versión 1.0 · {num(state.mantenimientos.length)} registros · {num(state.puntos.length)} eventos de puntos
      </p>

      {/* Modales */}
      <ModalPicoConfig open={pico} onClose={() => setPico(false)} />
      <ModalVehiculo open={vehiculo} onClose={() => setVehiculo(false)} />
      <Modal open={fuentes} onClose={() => setFuentes(false)} title="Fuentes y reglas" wide>
        <div className="flex flex-col gap-3 text-[0.8rem] leading-relaxed">
          <div>
            <h4 className="ink mb-1 text-[0.82rem] font-bold">SOAT 2026 (motos)</h4>
            <ul className="ink-2 flex flex-col gap-0.5 text-xs">
              <li>Menos de 100 cc: {money(256200)}</li>
              <li>100–200 cc: {money(343300)}</li>
              <li>Más de 200 cc (tu XTZ 250): {money(soatPorCilindraje(249))}</li>
              <li className="ink-3">Incluye 52% ADRES + tasa RUNT. Vence al año de la expedición.</li>
            </ul>
          </div>
          <div>
            <h4 className="ink mb-1 text-[0.82rem] font-bold">Revisión técnico-mecánica</h4>
            <p className="ink-2 text-xs">
              Motos: primera a los 2 años de la matrícula y luego cada año (Ley 769 art. 52, modificada por la Ley
              2294 de 2023). Costo estimado en Bogotá 2026: entre {money(RTM_BOGOTA_2026.min)} y{" "}
              {money(RTM_BOGOTA_2026.max)} según el CDA.
            </p>
          </div>
          <div>
            <h4 className="ink mb-1 text-[0.82rem] font-bold">Impuesto vehicular</h4>
            <p className="ink-2 text-xs">
              Las motos de 125 cc o menos están exentas. Una 250 cc paga aproximadamente 1,5% del avalúo en Bogotá
              (1,7% en Cundinamarca, que incluye 0,2% de Regiotram), con descuentos por pronto pago entre mayo y
              julio.
            </p>
          </div>
          <div>
            <h4 className="ink mb-1 text-[0.82rem] font-bold">Pico y placa</h4>
            <p className="ink-2 text-xs">
              Bogotá: las motos no tienen pico y placa (Decreto 003 de 2023, modificado por el 463 de 2024). Medellín:
              dos dígitos por día, 5:00 a. m. a 8:00 p. m., con el primer dígito de la placa. Siempre confirma en la
              secretaría de movilidad de tu ciudad.
            </p>
          </div>
          <div>
            <h4 className="ink mb-1 text-[0.82rem] font-bold">Multas frecuentes en moto (2026)</h4>
            <div className="divide-y divide-[var(--line)]">
              {COMPARENDOS.map((c) => (
                <div key={c.codigo} className="flex items-center gap-2 py-1">
                  <span className="nums ink-3 w-9 text-[0.68rem] font-bold">{c.codigo}</span>
                  <span className="ink-2 flex-1 text-[0.68rem] leading-snug">{c.descripcion}</span>
                  <span className="nums ink shrink-0 text-[0.68rem] font-bold">{money(c.valor)}</span>
                </div>
              ))}
            </div>
            <p className="ink-3 mt-1 text-[0.64rem]">
              Con descuento del 50 % pagando en 5 días o 75 % en 20 días, con curso.
            </p>
          </div>
          <div>
            <h4 className="ink mb-1 text-[0.82rem] font-bold">Enlaces oficiales</h4>
            <div className="flex flex-wrap gap-2">
              {[
                ["RUNT", "https://www.runt.gov.co/"],
                ["SIMIT", "https://www.simit.org.co/"],
                ["Movilidad Bogotá", "https://www.movilidadbogota.gov.co/"],
                ["Yamaha Colombia", "https://www.yamaha-motor.com.co/"],
              ].map(([label, url]) => (
                <a key={url} href={url} target="_blank" rel="noreferrer" className="btn btn-ghost text-[0.7rem]">
                  {label} <ExternalLink size={11} />
                </a>
              ))}
            </div>
          </div>
          <p className="ink-3 text-[0.68rem]">
            Esta app no es una entidad gubernamental y no consulta RUNT ni SIMIT automáticamente (esas consultas
            requieren captcha). Los valores se basan en la normativa vigente a octubre de 2026.
          </p>
        </div>
      </Modal>

      <Modal
        open={confirmar}
        onClose={() => setConfirmar(false)}
        title="¿Borrar todos los datos?"
        footer={
          <div className="flex gap-2">
            <button className="btn btn-ghost flex-1" onClick={() => setConfirmar(false)}>
              Mejor no
            </button>
            <button
              className="btn btn-danger flex-1"
              onClick={() => {
                reiniciar();
                setConfirmar(false);
              }}
            >
              Sí, borrar todo
            </button>
          </div>
        }
      >
        <p className="ink-2 text-sm leading-relaxed">
          Se eliminarán la moto, el plan de mantenimiento, los documentos, el historial y los puntos. Exporta un
          respaldo antes si quieres conservarlos.
        </p>
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Zona Moto (puntos e insignias)                                     */
/* ------------------------------------------------------------------ */

export function ZonaMoto({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useApp();
  const total = state.puntos.reduce((a, p) => a + p.puntos, 0);
  const historial = [...state.puntos].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const insignias = calcularInsignias(state.puntos, total);

  return (
    <Modal open={open} onClose={onClose} title="Zona Moto" wide>
      <div className="flex flex-col gap-4">
        <div
          className="rounded-2xl px-4 py-4 text-white"
          style={{ background: "linear-gradient(135deg,#f97316,#c2410c)" }}
        >
          <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-widest text-white/80">
            <Award size={14} /> Tus puntos
          </div>
          <p className="nums mt-1 text-3xl font-extrabold">{num(total)}</p>
          <p className="text-[0.75rem] text-white/85">
            {total >= 500 ? "Ya puedes canjear un mes de lo que quieras. " : `Te faltan ${num(Math.max(0, 500 - total))} para 500 pts. `}
            Ganas puntos registrando mantenimientos, tanqueos y documentos.
          </p>
        </div>

        <div>
          <h3 className="ink mb-1.5 text-[0.85rem] font-bold">Insignias</h3>
          <div className="grid grid-cols-2 gap-2">
            {insignias.map((i) => (
              <div
                key={i.nombre}
                className="flex items-center gap-2 rounded-xl border px-2.5 py-2"
                style={{
                  borderColor: i.ganada ? "var(--brand)" : "var(--line)",
                  background: i.ganada ? "var(--brand-soft)" : "var(--surface-2)",
                  opacity: i.ganada ? 1 : 0.6,
                }}
              >
                <span className="text-base">{i.emoji}</span>
                <div className="min-w-0">
                  <p className="ink truncate text-[0.72rem] font-bold">{i.nombre}</p>
                  <p className="ink-3 truncate text-[0.62rem]">{i.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="ink mb-1.5 text-[0.85rem] font-bold">Cómo ganar puntos</h3>
          <div className="grid grid-cols-2 gap-1.5 text-[0.7rem] sm:grid-cols-3">
            {[
              ["Servicio", "+10"],
              ["Tanqueo", "+5"],
              ["Documento", "+25"],
              ["Alerta", "+5"],
              ["Configurar", "+50"],
              ["Reporte", "+3"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-lg px-2 py-1.5" style={{ background: "var(--surface-2)" }}>
                <span className="ink-2">{k}</span>
                <span className="nums font-bold" style={{ color: "var(--brand)" }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="ink mb-1.5 text-[0.85rem] font-bold">Historial</h3>
          {historial.length === 0 ? (
            <p className="ink-3 text-xs">Aún no has ganado puntos. Registra tu primer servicio.</p>
          ) : (
            <div className="divide-y divide-[var(--line)]">
              {historial.slice(0, 12).map((p) => (
                <div key={p.id} className="flex items-center gap-2 py-1.5 text-xs">
                  <span className="ink-2 nums w-20">{p.fecha}</span>
                  <span className="ink flex-1 truncate">{p.motivo}</span>
                  <span className="nums font-bold" style={{ color: "var(--ok)" }}>
                    +{p.puntos}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function calcularInsignias(puntos: PuntoEvento[], total: number) {
  const registros = puntos.filter((p) => p.motivo.toLowerCase().includes("tanqueo")).length;
  const servicios = puntos.filter((p) => p.puntos === 10).length;
  return [
    { nombre: "Primer arranque", descripcion: "Configuraste tu moto", emoji: "🏁", ganada: total >= 50 },
    { nombre: "Manos limpias", descripcion: "5 servicios registrados", emoji: "🔧", ganada: servicios >= 5 },
    { nombre: "Tanquecito", descripcion: "5 tanqueos registrados", emoji: "⛽", ganada: registros >= 5 },
    { nombre: "Papeleo al día", descripcion: "Subiste 3 documentos", emoji: "📄", ganada: puntos.filter((p) => p.puntos === 25).length >= 3 },
    { nombre: "Coleccionista", descripcion: "500 puntos", emoji: "🥇", ganada: total >= 500 },
    { nombre: "Leyenda XTZ", descripcion: "1.000 puntos", emoji: "🏆", ganada: total >= 1000 },
  ];
}
