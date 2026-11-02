import { useState } from "react";
import { Check, ExternalLink, Info, MapPin, Settings2, ShieldOff, X } from "lucide-react";
import { useApp } from "../store/AppStore";
import { Chip, Modal } from "../components/ui";
import { ModalPicoConfig } from "../components/formularios";
import { CIUDADES, ciudadPorId, evaluarPicoPlaca, proximosDias } from "../lib/picoPlaca";
import { formatDate, formatDayName, isoDate } from "../lib/format";

export function PicoPlaca() {
  const { state, guardarAjustes } = useApp();
  const [config, setConfig] = useState(false);
  const [ayuda, setAyuda] = useState(false);
  const v = state.vehiculo;
  if (!v) return null;

  const ciudad = ciudadPorId(state.ajustes.ciudad);
  const esMoto = state.ajustes.tipoVehiculo === "moto";
  const hoy = isoDate();
  const dias = proximosDias(hoy, 8).map((f) => ({
    fecha: f,
    r: evaluarPicoPlaca(v.placa, f, ciudad, esMoto, state.ajustes.picoPlacaDigitos),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="ink text-[1.35rem] font-extrabold tracking-tight">Pico y placa</h1>
          <p className="ink-2 text-[0.8rem]">Tu semana, sin adivinar</p>
        </div>
        <button className="icon-btn" onClick={() => setConfig(true)} aria-label="Configurar reglas">
          <Settings2 size={17} />
        </button>
      </div>

      <div className="flex items-start gap-2 rounded-2xl px-3.5 py-3" style={{ background: "var(--info-soft)" }}>
        <Info size={15} className="mt-0.5 shrink-0" style={{ color: "var(--info)" }} />
        <p className="text-[0.72rem] leading-relaxed" style={{ color: "var(--info)" }}>
          MotoApp no es una entidad gubernamental. Las reglas pueden cambiar por decreto en cualquier momento:
          confirma en la Secretaría de Movilidad de {ciudad.nombre}.{" "}
          <a className="font-bold underline" href={ciudad.fuente} target="_blank" rel="noreferrer">
            Ver fuente oficial <ExternalLink size={11} className="inline" />
          </a>
        </p>
      </div>

      <div className="card p-4">
        <p className="ink-3 text-[0.65rem] font-bold uppercase tracking-wider">Ciudad</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {CIUDADES.filter((c) => c.id !== "otra").map((c) => (
            <button
              key={c.id}
              onClick={() => guardarAjustes({ ciudad: c.id })}
              className="rounded-full px-3 py-1.5 text-xs font-bold"
              style={{
                background: state.ajustes.ciudad === c.id ? "var(--brand)" : "var(--surface-2)",
                color: state.ajustes.ciudad === c.id ? "#fff" : "var(--ink-2)",
                border: `1px solid ${state.ajustes.ciudad === c.id ? "transparent" : "var(--line)"}`,
              }}
            >
              {c.nombre}
            </button>
          ))}
        </div>
        <p className="ink-2 mt-2 text-[0.72rem] leading-relaxed">{ciudad.nota}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {esMoto && !ciudad.aplicaMotos ? (
            <>
              <Chip tono="ok">Motos exentas</Chip>
              <p className="ink-2 text-[0.72rem] leading-relaxed">
                Restricción para carros particulares: {ciudad.horario.toLowerCase()}.
              </p>
            </>
          ) : (
            <>
              <Chip tono="neutral">{ciudad.horario}</Chip>
              <Chip tono="neutral">Vigente desde {formatDate(ciudad.vigenteDesde)}</Chip>
              <Chip tono="neutral">{ciudad.usaPrimerDigito ? "Primer dígito" : "Último dígito"} de la placa</Chip>
            </>
          )}
        </div>
      </div>

      {/* Hoy */}
      <div
        className="card overflow-hidden"
        style={{
          background: dias[0].r.restringido ? "var(--bad-soft)" : "var(--ok-soft)",
          borderColor: "transparent",
        }}
      >
        <div className="flex items-center gap-3 p-4">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: dias[0].r.restringido ? "var(--bad)" : "var(--ok)",
              color: "#fff",
            }}
          >
            {dias[0].r.restringido ? <X size={20} /> : <Check size={20} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="ink-2 text-[0.68rem] font-bold uppercase tracking-wide">Hoy · {formatDate(hoy, "largo")}</p>
            <p className="ink text-[1rem] font-extrabold leading-tight">
              {dias[0].r.motivo === "sin-restriccion-ciudad"
                ? "Sin pico y placa para motos"
                : dias[0].r.restringido
                  ? "Con restricción"
                  : dias[0].r.restringido === false
                    ? "Sin restricción"
                    : ""}
            </p>
            <p className="ink-2 text-[0.72rem]">
              {dias[0].r.motivo === "sin-restriccion-ciudad"
                ? `En ${ciudad.nombre} la medida aplica a carros particulares, no a motos.`
                : dias[0].r.restringido
                  ? `Dígitos ${dias[0].r.digitos.join(" y ")} · ${dias[0].r.horario}`
                  : `Dígitos restringidos hoy: ${dias[0].r.digitos.join(" y ") || "ninguno"}`}
            </p>
          </div>
          <span className="rounded-lg bg-white/70 px-2 py-1 text-[0.7rem] font-extrabold tracking-wide text-slate-900">{v.placa}</span>
        </div>
      </div>

      {/* Semana */}
      <div className={esMoto && !ciudad.aplicaMotos ? "hidden" : ""}>
        <h2 className="h-sec ink mb-2">Próximos días</h2>
        <div className="card divide-y divide-[var(--line)]">
          {dias.slice(1).map(({ fecha, r }) => {
            const restringido = r.restringido;
            const estadoTexto =
              r.motivo === "sin-restriccion-ciudad"
                ? "Sin pico y placa para motos"
                : r.motivo === "exceptuado"
                  ? "Festivo: no aplica"
                  : restringido
                    ? `Con restricción · dígitos ${r.digitos.join(" y ")}`
                    : "Sin restricción";
            return (
              <div key={fecha} className="flex items-center gap-3 px-3.5 py-2.5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: restringido ? "var(--bad-soft)" : "var(--ok-soft)",
                    color: restringido ? "var(--bad)" : "var(--ok)",
                  }}
                >
                  {restringido ? <X size={15} /> : <Check size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="ink text-[0.82rem] font-semibold">
                    {formatDayName(fecha)} {new Date(fecha).getDate()} · {formatDate(fecha)}
                  </p>
                  <p className="ink-2 text-[0.7rem]">{estadoTexto}</p>
                </div>
                {r.motivo === "exceptuado" && <Chip tono="info">Festivo</Chip>}
                {restringido && <Chip tono="bad">{r.horario.split(",")[1]?.trim() ?? r.horario}</Chip>}
              </div>
            );
          })}
        </div>
      </div>

      {esMoto && !ciudad.aplicaMotos && (
        <div className="card p-4">
          <p className="ink text-[0.9rem] font-bold">No tienes que revisar la semana</p>
          <p className="ink-2 mt-1 text-[0.76rem] leading-relaxed">
            En {ciudad.nombre} las motos circulan sin restricción de pico y placa. Lo que sí te puede afectar son las
            medidas temporales: Día sin Carro y sin Moto, restricción de parrillero y cierres viales.
          </p>
        </div>
      )}

      <button className="card flex w-full items-center gap-3 p-4 text-left" onClick={() => setAyuda(true)}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--warn-soft)", color: "var(--warn)" }}>
          <ShieldOff size={18} />
        </span>
        <div className="flex-1">
          <p className="ink text-[0.86rem] font-bold">Excepciones que sí te pueden multar</p>
          <p className="ink-2 text-xs">Día sin Carro y sin Moto, parrillero y corredores restringidos</p>
        </div>
        <MapPin size={15} style={{ color: "var(--ink-3)" }} />
      </button>

      <ModalPicoConfig open={config} onClose={() => setConfig(false)} />
      <Modal open={ayuda} onClose={() => setAyuda(false)} title="Excepciones y fechas especiales">
        <div className="flex flex-col gap-3 text-[0.78rem] leading-relaxed">
          <p className="ink-2">
            Aunque tu moto no tenga pico y placa, hay días y zonas donde igual hay restricción:
          </p>
          <ul className="ink flex flex-col gap-2">
            <li className="rounded-xl px-3 py-2" style={{ background: "var(--surface-2)" }}>
              <strong>Día sin Carro y sin Moto</strong> (Bogotá, normalmente en febrero): aplica a todos los vehículos
              entre 5:00 a. m. y 9:00 p. m.
            </li>
            <li className="rounded-xl px-3 py-2" style={{ background: "var(--surface-2)" }}>
              <strong>Restricción de parrillero</strong> en corredores y horarios específicos (decretos temporales).
            </li>
            <li className="rounded-xl px-3 py-2" style={{ background: "var(--surface-2)" }}>
              <strong>Pico y Placa Solidario</strong>: es un permiso pago para vehículos restringidos; no aplica a motos
              en Bogotá.
            </li>
            <li className="rounded-xl px-3 py-2" style={{ background: "var(--surface-2)" }}>
              <strong>Medellín</strong> sí restringe motos: dos dígitos por día, de 5:00 a. m. a 8:00 p. m. y cuenta el
              primer dígito de la placa.
            </li>
          </ul>
          <p className="ink-2">
            Circular en restricción te puede costar un comparendo de categoría C (15 salarios mínimos diarios) más
            inmovilización.
          </p>
          <div className="flex flex-wrap gap-2">
            <a className="btn btn-ghost text-xs" href="https://www.movilidadbogota.gov.co/" target="_blank" rel="noreferrer">
              Movilidad Bogotá <ExternalLink size={12} />
            </a>
            <a className="btn btn-ghost text-xs" href="https://telemedellin.tv/pico-y-placa-medellin/" target="_blank" rel="noreferrer">
              Rotación Medellín <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
}
