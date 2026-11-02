import { useMemo, useState } from "react";
import { Droplet, Fuel, Plus, Receipt, TrendingUp } from "lucide-react";
import type { Mantenimiento } from "../types";
import { useApp } from "../store/AppStore";
import { CATEGORIAS } from "../data/catalogo";
import { combustiblePorMes, costoPorKm, gastos, resumenCombustible, tanqueos, totalMes } from "../lib/calc";
import { formatDate, isoDate, money, moneyShort, num } from "../lib/format";
import { Chip, EmptyState, Segmented, Stat } from "../components/ui";
import { BarrasMensuales, Linea } from "../components/charts";
import { Icono } from "../components/iconos";
import { ModalMantenimiento, ModalTanqueo } from "../components/formularios";

type Vista = "tanqueos" | "combustible" | "todos";

export function Gastos() {
  const { state } = useApp();
  const [vista, setVista] = useState<Vista>("tanqueos");
  const [nuevoTanqueo, setNuevoTanqueo] = useState(false);
  const [nuevoGasto, setNuevoGasto] = useState(false);
  const [edit, setEdit] = useState<Mantenimiento | undefined>();
  const v = state.vehiculo;
  if (!v) return null;

  const tk = tanqueos(state);
  const comb = resumenCombustible(state);
  const todos = gastos(state);
  const mes = totalMes(state, 0);
  const anio = todos.filter((m) => m.fecha.startsWith(isoDate().slice(0, 4))).reduce((a, m) => a + m.costo, 0);
  const porKm = costoPorKm(state);
  const serie = combustiblePorMes(state, 6).map((m) => ({ label: m.key.slice(5), value: m.total }));

  const puntos = useMemo(
    () =>
      comb.mediciones
        .filter((m) => m.rendimientoKmL !== undefined)
        .slice(-8)
        .map((m) => ({ label: m.mantenimiento.fecha.slice(5), value: m.rendimientoKmL! })),
    [comb.mediciones],
  );
  const precios = useMemo(
    () => tk.slice(-8).map((t) => ({ label: t.mantenimiento.fecha.slice(5), value: t.precioLitro })),
    [tk],
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="ink text-[1.35rem] font-extrabold tracking-tight">Gastos y tanqueos</h1>
        <p className="ink-2 text-[0.8rem]">Cada peso de la moto, con contexto</p>
      </div>
      <div className="flex gap-2">
        <button className="btn btn-ghost flex-1" onClick={() => setNuevoGasto(true)}>
          <Receipt size={15} /> Registrar gasto
        </button>
        <button className="btn btn-primary flex-1" onClick={() => setNuevoTanqueo(true)}>
          <Fuel size={15} /> Tanquear
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Este mes" value={moneyShort(mes)} hint={formatDate(isoDate(), "mes")} tono="brand" />
        <Stat label="Este año" value={moneyShort(anio)} hint={`${todos.length} registros`} />
        <Stat label="Costo por km" value={money(porKm)} hint="todos los gastos registrados" />
        <Stat
          label="Rendimiento"
          value={comb.promedioKmGal > 0 ? `${num(comb.promedioKmGal, 0)} km/gal` : "—"}
          hint={comb.promedioKmGal > 0 ? `${num(comb.promedioKmL, 1)} km/l` : "registra 2 tanqueos llenos"}
          tono="ok"
        />
      </div>

      <Segmented
        value={vista}
        onChange={setVista}
        options={[
          { value: "tanqueos", label: "Tanqueos" },
          { value: "combustible", label: "Combustible" },
          { value: "todos", label: "Todos" },
        ]}
      />

      {vista === "tanqueos" && (
        <div className="flex flex-col gap-3">
          {tk.length === 0 ? (
            <EmptyState
              icon={<Fuel size={22} />}
              title="Sin tanqueos todavía"
              description="Registra galones y precio por galón. La app calcula rendimiento, costo por km y detecta si la moto está consumiendo de más."
              action={
                <button className="btn btn-primary" onClick={() => setNuevoTanqueo(true)}>
                  Registrar el primer tanqueo
                </button>
              }
            />
          ) : (
            <>
              <div className="card p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="ink-3 text-[0.65rem] font-bold uppercase tracking-wide">Gasto en combustible</p>
                    <p className="nums ink text-xl font-extrabold">{money(comb.totalGasto)}</p>
                  </div>
                  <Chip tono="info">{num(comb.totalGalones, 1)} galones</Chip>
                </div>
                <div className="mt-3">
                  <BarrasMensuales data={serie} height={110} />
                  <p className="ink-3 mt-1 text-[0.62rem]">Solo combustible, últimos 6 meses</p>
                </div>
              </div>

              <div className="card divide-y divide-[var(--line)]">
                {[...tk].reverse().map((t) => (
                  <button
                    key={t.mantenimiento.id}
                    onClick={() => setEdit(t.mantenimiento)}
                    className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
                      <Droplet size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="ink text-[0.84rem] font-semibold">
                        {num(t.tanqueo.galones, 2)} gal · {money(t.tanqueo.precioGalon)}/gal
                      </div>
                      <div className="ink-3 nums text-[0.68rem]">
                        {num(t.mantenimiento.km)} km · {formatDate(t.mantenimiento.fecha)}
                        {t.rendimientoKmGal !== undefined ? ` · ${num(t.rendimientoKmGal, 1)} km/gal` : ""}
                      </div>
                    </div>
                    <span className="nums ink text-[0.8rem] font-bold">{money(t.mantenimiento.costo)}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {vista === "combustible" && (
        <div className="flex flex-col gap-3">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="ink text-[0.9rem] font-bold">Rendimiento por tanqueo</p>
                <p className="ink-2 text-xs">Km/galón entre tanqueos llenos</p>
              </div>
              <Chip tono="ok">
                <TrendingUp size={12} /> {num(comb.promedioKmGal, 1)} km/gal
              </Chip>
            </div>
            <div className="mt-2">{puntos.length > 1 ? <Linea puntos={puntos} unidad="km/l" /> : <p className="ink-3 py-6 text-center text-xs">Necesitas al menos 2 tanqueos llenos seguidos.</p>}</div>
          </div>

          <div className="card p-4">
            <p className="ink text-[0.9rem] font-bold">Precio del combustible</p>
            <p className="ink-2 text-xs">Por litro, según tus tanqueos</p>
            <div className="mt-2">
              {precios.length > 1 ? (
                <Linea puntos={precios} unidad="COP/L" color="#dc2626" />
              ) : (
                <p className="ink-3 py-6 text-center text-xs">Registra más tanqueos para ver la tendencia.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Stat label="Promedio" value={`${num(comb.promedioKmL, 2)} km/l`} hint={`${num(comb.promedioKmGal, 1)} km/gal`} />
            <Stat label="Costo por km" value={money(porKm)} hint="todos los gastos registrados" />
          </div>

          <p className="ink-3 px-1 text-[0.68rem] leading-relaxed">
            Referencia XTZ 250: entre 30 y 38 km/galón en uso mixto. Si bajas de 28, revisa filtro de aire, bujía,
            presión de llantas y cadena.
          </p>
        </div>
      )}

      {vista === "todos" && (
        <div className="flex flex-col gap-3">
          {todos.length === 0 ? (
            <EmptyState icon={<Receipt size={22} />} title="Sin gastos registrados" description="Registra mantenimientos y tanqueos para ver el detalle." />
          ) : (
            <div className="card divide-y divide-[var(--line)]">
              {todos.map((m) => {
                const meta = CATEGORIAS[m.categoria];
                return (
                  <button key={m.id} onClick={() => setEdit(m)} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${meta.color}18`, color: meta.color }}>
                      <Icono nombre={meta.icono} size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="ink truncate text-[0.84rem] font-semibold">{m.titulo}</div>
                      <div className="ink-3 nums text-[0.68rem]">
                        {formatDate(m.fecha)} · {num(m.km)} km{m.taller ? ` · ${m.taller}` : ""}
                      </div>
                    </div>
                    <span className="nums ink text-[0.8rem] font-bold">{money(m.costo)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <ModalTanqueo open={nuevoTanqueo} onClose={() => setNuevoTanqueo(false)} />
      <ModalMantenimiento open={nuevoGasto} onClose={() => setNuevoGasto(false)} />
      <ModalMantenimiento open={Boolean(edit)} onClose={() => setEdit(undefined)} inicial={edit} />
      <div className="flex items-center gap-1.5 px-1 text-[0.68rem]" style={{ color: "var(--ink-3)" }}>
        <Plus size={12} /> Consejo: registra el tanqueo siempre con el odómetro exacto para que el rendimiento cuadre.
      </div>
    </div>
  );
}
