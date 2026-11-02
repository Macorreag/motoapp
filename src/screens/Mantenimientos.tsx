import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Filter, Plus, Wrench } from "lucide-react";
import { useApp } from "../store/AppStore";
import type { CategoriaMantenimiento, Mantenimiento } from "../types";
import { CATEGORIAS, CATEGORIAS_LISTA } from "../data/catalogo";
import { desgastes, diasProyectados, gastos, ritmoKmDiario } from "../lib/calc";
import { formatDate, isoDate, money, monthLabel, num } from "../lib/format";
import { Chip, EmptyState, Ring, Segmented } from "../components/ui";
import { Icono } from "../components/iconos";
import { ModalComponente, ModalMantenimiento } from "../components/formularios";

type Vista = "proximos" | "historial" | "plan";

export function Mantenimientos({
  onServicio,
}: {
  onServicio: (categoria?: CategoriaMantenimiento) => void;
}) {
  const { state } = useApp();
  const [vista, setVista] = useState<Vista>("proximos");
  const v = state.vehiculo;
  const ds = useMemo(() => desgastes(state), [state]);
  const ritmo = useMemo(() => ritmoKmDiario(state), [state]);

  // Historial
  const todos = gastos(state);
  const anios = useMemo(() => {
    const set = new Set(todos.map((m) => m.fecha.slice(0, 4)));
    set.add(isoDate().slice(0, 4));
    return [...set].sort().reverse();
  }, [todos]);
  const [anio, setAnio] = useState(anios[0]);
  const [filtro, setFiltro] = useState<CategoriaMantenimiento | "todos">("todos");
  const [editando, setEditando] = useState<Mantenimiento | undefined>();

  const registros = todos.filter(
    (m) => m.fecha.startsWith(anio) && (filtro === "todos" || m.categoria === filtro),
  );
  const totalAnio = registros.reduce((a, m) => a + m.costo, 0);
  const agrupado = useMemo(() => {
    const map: { key: string; items: Mantenimiento[] }[] = [];
    for (const m of registros) {
      const key = m.fecha.slice(0, 7);
      const ultimo = map[map.length - 1];
      if (ultimo && ultimo.key === key) ultimo.items.push(m);
      else map.push({ key, items: [m] });
    }
    return map;
  }, [registros]);

  if (!v) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="ink text-[1.35rem] font-extrabold tracking-tight">Mantenimientos</h1>
          <p className="ink-2 text-[0.8rem]">Registra, consulta y anticipa</p>
        </div>
        <button className="btn btn-primary" onClick={() => onServicio()}>
          <Plus size={16} /> Registrar
        </button>
      </div>

      <Segmented
        value={vista}
        onChange={setVista}
        options={[
          { value: "proximos", label: "Próximos" },
          { value: "historial", label: "Historial" },
          { value: "plan", label: "Plan" },
        ]}
      />

      {vista === "proximos" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Vencidos" valor={ds.filter((d) => d.estado === "vencido").length} tono="var(--bad)" />
            <MiniStat label="Urgentes" valor={ds.filter((d) => d.estado === "urgente").length} tono="var(--warn)" />
            <MiniStat label="Al día" valor={ds.filter((d) => d.estado === "ok").length} tono="var(--ok)" />
          </div>

          {ds.length === 0 && (
            <EmptyState
              icon={<Wrench size={22} />}
              title="Aún no tienes plan de mantenimiento"
              description="Agrega componentes con su intervalo de km y tiempo para que la app calcule los próximos servicios."
              action={
                <button className="btn btn-primary" onClick={() => setVista("plan")}>
                  Configurar plan
                </button>
              }
            />
          )}

          <div className="flex flex-col gap-2">
            {ds.map((d) => (
              <div key={d.componente.id} className="card p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="ink text-[0.9rem] font-bold leading-snug">{d.componente.nombre}</h3>
                  {d.estado !== "ok" ? (
                    <Chip tono={d.estado === "vencido" || d.estado === "urgente" ? "bad" : "warn"}>
                      {d.estado === "vencido" ? "Vencido" : d.estado === "urgente" ? "Urgente" : "Próximo"}
                    </Chip>
                  ) : (
                    <Chip tono="ok">Al día</Chip>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <Ring value={d.restantePct} size={46} stroke={4.5} />
                  <div className="min-w-0 flex-1">
                    <p className="ink-2 text-[0.74rem]">
                      {d.kmRestantes > 0 ? `Faltan ${num(d.kmRestantes)} km` : `Pasado por ${num(d.kmExcedidos)} km`}
                      {" · "}
                      {d.diasRestantes > 0
                        ? `≈ ${diasProyectados(d, ritmo) ?? d.diasRestantes} días`
                        : "vencido por tiempo"}
                    </p>
                    <p className="ink-3 nums text-[0.68rem]">
                      Próximo: {num(d.proximoKm)} km · {formatDate(d.proximoVencimiento)} · est. {money(d.componente.costoEstimado)}
                    </p>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-3)" }}>
                      <div
                        className="h-full rounded-full transition-[width] duration-700"
                        style={{
                          width: `${Math.max(2, d.restantePct * 100)}%`,
                          background: d.restantePct > 0.35 ? "var(--ok)" : d.restantePct > 0.15 ? "var(--warn)" : "var(--bad)",
                        }}
                      />
                    </div>
                  </div>
                  <button className="btn btn-soft shrink-0 px-2.5 py-1.5 text-[0.7rem]" onClick={() => onServicio(d.componente.categoria)}>
                    Hecho
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {vista === "historial" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="scroll-x flex gap-1.5">
              {anios.map((a) => (
                <button
                  key={a}
                  onClick={() => setAnio(a)}
                  className="rounded-full px-3 py-1.5 text-xs font-bold transition-colors"
                  style={{
                    background: anio === a ? "var(--brand)" : "var(--surface)",
                    color: anio === a ? "#fff" : "var(--ink-2)",
                    border: `1px solid ${anio === a ? "transparent" : "var(--line)"}`,
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
            <span className="nums ink-2 text-xs font-semibold">{money(totalAnio)}</span>
          </div>

          <div className="scroll-x flex items-center gap-1.5">
            <Filter size={13} className="ink-3 shrink-0" />
            <button
              onClick={() => setFiltro("todos")}
              className="shrink-0 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold"
              style={{
                background: filtro === "todos" ? "var(--ink)" : "var(--surface)",
                color: filtro === "todos" ? "var(--surface)" : "var(--ink-2)",
                border: "1px solid var(--line)",
              }}
            >
              Todos
            </button>
            {CATEGORIAS_LISTA.filter((c) => c.id !== "otro").map((c) => (
              <button
                key={c.id}
                onClick={() => setFiltro(c.id)}
                className="shrink-0 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold"
                style={{
                  background: filtro === c.id ? "var(--brand-soft)" : "var(--surface)",
                  color: filtro === c.id ? "var(--brand)" : "var(--ink-2)",
                  border: `1px solid ${filtro === c.id ? "var(--brand)" : "var(--line)"}`,
                }}
              >
                {c.corto}
              </button>
            ))}
          </div>

          {agrupado.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={22} />}
              title="Sin registros en este año"
              description="Cuando registres un servicio o un tanqueo aparecerá aquí, agrupado por mes."
              action={
                <button className="btn btn-primary" onClick={() => onServicio()}>
                  Registrar el primero
                </button>
              }
            />
          ) : (
            agrupado.map((grupo) => (
              <div key={grupo.key}>
                <p className="ink-3 mb-1.5 px-1 text-[0.7rem] font-bold uppercase tracking-wider">{monthLabel(grupo.key)}</p>
                <div className="card divide-y divide-[var(--line)]">
                  {grupo.items.map((m) => {
                    const meta = CATEGORIAS[m.categoria];
                    return (
                      <button
                        key={m.id}
                        onClick={() => setEditando(m)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: `${meta.color}18`, color: meta.color }}
                        >
                          <Icono nombre={meta.icono} size={17} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="ink truncate text-[0.85rem] font-semibold">{m.titulo}</div>
                          <div className="ink-3 nums truncate text-[0.68rem]">
                            {num(m.km)} km · {formatDate(m.fecha)}
                            {m.taller ? ` · ${m.taller}` : ""}
                          </div>
                        </div>
                        <span className="nums ink shrink-0 text-[0.8rem] font-bold">{money(m.costo)}</span>
                        {m.evidencia && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--info)" }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {vista === "plan" && (
        <PlanComponentes />
      )}

      <ModalMantenimiento open={Boolean(editando)} onClose={() => setEditando(undefined)} inicial={editando} />
      {editando?.tanqueo && (
        <p className="ink-3 px-1 text-[0.68rem]">
          Este registro es un tanqueo: edítalo desde Gastos para recalcular el rendimiento.
        </p>
      )}
    </div>
  );
}

function MiniStat({ label, valor, tono }: { label: string; valor: number; tono: string }) {
  return (
    <div className="card-flat px-3 py-2">
      <p className="ink-3 text-[0.62rem] font-bold uppercase tracking-wide">{label}</p>
      <p className="nums text-lg font-extrabold" style={{ color: tono }}>
        {valor}
      </p>
    </div>
  );
}

function PlanComponentes() {
  const { state } = useApp();
  const [edit, setEdit] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="h-sec ink">Plan de mantenimiento</h2>
          <p className="ink-2 text-xs">Ajusta intervalos, costos y último servicio</p>
        </div>
        <button className="btn btn-soft" onClick={() => setNuevo(true)}>
          <Plus size={15} /> Agregar
        </button>
      </div>
      <div className="card divide-y divide-[var(--line)]">
        {state.componentes.map((c) => (
          <button key={c.id} onClick={() => setEdit(c.id)} className="flex w-full items-center gap-3 px-3.5 py-3 text-left">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `${CATEGORIAS[c.categoria].color}18`, color: CATEGORIAS[c.categoria].color }}
            >
              <Icono nombre={CATEGORIAS[c.categoria].icono} size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="ink truncate text-[0.85rem] font-semibold">{c.nombre}</div>
              <div className="ink-3 nums text-[0.68rem]">
                Cada {num(c.intervaloKm)} km o {c.intervaloMeses} meses · último {num(c.ultimoKm)} km ({formatDate(c.ultimaFecha)})
              </div>
            </div>
            <ChevronDown size={15} className="shrink-0 -rotate-90" style={{ color: "var(--ink-3)" }} />
          </button>
        ))}
      </div>
      <p className="ink-3 px-1 text-[0.68rem] leading-relaxed">
        El plan semilla sigue las periodicidades típicas de la XTZ 250. Ajusta según tu manual, tu aceite y tu uso
        (ciudad, carretera, destapado).
      </p>
      <ModalComponente open={Boolean(edit)} onClose={() => setEdit(null)} componente={state.componentes.find((c) => c.id === edit)} />
      <ModalComponente open={nuevo} onClose={() => setNuevo(false)} />
    </div>
  );
}
