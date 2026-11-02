import { useMemo, useState } from "react";
import { Download, FileDown, Info, Lightbulb, Printer } from "lucide-react";
import { useApp } from "../store/AppStore";
import { CATEGORIAS } from "../data/catalogo";
import {
  costoPorKm,
  desgastes,
  documentosConVencimiento,
  resumenCombustible,
  saludVehiculo,
  totalPorCategoria,
  totalPorMes,
  gastos as listaGastos,
} from "../lib/calc";
import { formatDate, isoDate, money, moneyShort, monthLabel, num } from "../lib/format";
import { Chip, EmptyState, Ring, Segmented, Stat } from "../components/ui";
import { BarrasMensuales, Dona, LeyendaDona, Linea } from "../components/charts";
import { Icono } from "../components/iconos";
import { descargar } from "../lib/archivos";

type Vista = "general" | "mensual" | "combustible";

export function Reportes() {
  const { state } = useApp();
  const [vista, setVista] = useState<Vista>("general");
  const v = state.vehiculo;
  if (!v) return null;

  const serie12 = totalPorMes(state, 12);
  const totalAnio = serie12.reduce((a, m) => a + m.total, 0);
  const mesesConDatos = serie12.filter((m) => m.total > 0).length || 1;
  const promedioMes = totalAnio / mesesConDatos;
  const categorias = totalPorCategoria(state);
  const porKm = costoPorKm(state);
  const comb = resumenCombustible(state);
  const todos = listaGastos(state);
  const proyeccion = totalPorMes(state, 3).reduce((a, m) => a + m.total, 0) / 3 * 12;

  const dona = categorias.slice(0, 6).map((c) => ({ label: CATEGORIAS[c.categoria].label, value: c.total }));
  const salud = saludVehiculo(state);
  const etiquetaSalud = salud >= 85 ? "Excelente" : salud >= 70 ? "Buen estado" : salud >= 50 ? "Regular" : "Requiere atención";
  const vencidos = desgastes(state).filter((d) => d.estado === "vencido").length;
  const docsVencidos = documentosConVencimiento(state).filter((d) => d.diasRestantes < 0).length;
  const apto = vencidos === 0 && docsVencidos === 0;
  const faltantes = desgastes(state).slice(0, 3);

  const puntos = comb.mediciones
    .filter((m) => m.rendimientoKmL !== undefined)
    .slice(-10)
    .map((m) => ({ label: m.mantenimiento.fecha.slice(5), value: m.rendimientoKmL! }));

  const mesesMensual = useMemo(() => {
    const out: { key: string; total: number; cantidad: number; porTipo: Record<string, number> }[] = [];
    const map = new Map<string, { total: number; cantidad: number; porTipo: Record<string, number> }>();
    for (const m of state.mantenimientos) {
      const k = m.fecha.slice(0, 7);
      const cur = map.get(k) ?? { total: 0, cantidad: 0, porTipo: {} };
      cur.total += m.costo;
      cur.cantidad += 1;
      const cat = CATEGORIAS[m.categoria].corto;
      cur.porTipo[cat] = (cur.porTipo[cat] ?? 0) + m.costo;
      map.set(k, cur);
    }
    for (const [key, val] of [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))) {
      out.push({ key, ...val });
    }
    return out;
  }, [state.mantenimientos]);

  function exportarCSV() {
    const filas = [
      ["Fecha", "Km", "Categoría", "Título", "Tipo", "Costo", "Taller", "Galones", "Precio galón", "Descripción"],
      ...todos.map((m) => [
        m.fecha,
        String(m.km),
        CATEGORIAS[m.categoria].label,
        m.titulo,
        m.tipo,
        String(m.costo),
        m.taller ?? "",
        m.tanqueo ? String(m.tanqueo.galones) : "",
        m.tanqueo ? String(m.tanqueo.precioGalon) : "",
        m.descripcion ?? "",
      ]),
    ];
    const csv = filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    descargar(`motoapp-${v?.placa ?? "moto"}-gastos.csv`, csv, "text/csv;charset=utf-8");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="no-print flex items-start justify-between gap-3">
        <div>
          <h1 className="ink text-[1.35rem] font-extrabold tracking-tight">Reportes</h1>
          <p className="ink-2 text-[0.8rem]">El costo real de tu moto</p>
        </div>
        <div className="flex gap-1.5">
          <button className="icon-btn" onClick={exportarCSV} aria-label="Exportar CSV" title="Exportar CSV">
            <Download size={16} />
          </button>
          <button className="btn btn-ghost text-xs" onClick={() => window.print()}>
            <Printer size={15} /> PDF
          </button>
        </div>
      </div>

      {/* Cabecera imprimible */}
      <div className="hidden print:block">
        <h2 className="ink text-lg font-bold">
          {v.marca} {v.linea} · {v.placa}
        </h2>
        <p className="ink-2 text-xs">
          Historial vehicular generado el {formatDate(isoDate(), "largo")} · {num(v.kmActual)} km · modelo {v.modelo}
        </p>
      </div>

      <div className="card flex items-center gap-3 p-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
          <Icono nombre="Bike" size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="ink truncate text-[0.88rem] font-bold">
            {v.placa} · {v.apodo}
          </p>
          <p className="ink-2 nums text-[0.72rem]">
            {v.marca} {v.linea} · {v.modelo} · {num(v.kmActual)} km
          </p>
        </div>
        <Chip tono="neutral">{state.mantenimientos.length} registros</Chip>
      </div>

      <div className="no-print">
        <Segmented
          value={vista}
          onChange={setVista}
          options={[
            { value: "general", label: "General" },
            { value: "mensual", label: "Mensual" },
            { value: "combustible", label: "Combustible" },
          ]}
        />
      </div>

      {vista === "general" && (
        <div className="flex flex-col gap-3">
          {/* Historial vehicular / score */}
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <Ring value={salud / 100} size={62} stroke={6}>
                <span className="nums ink text-[0.86rem] font-extrabold">{salud}</span>
              </Ring>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="ink text-[0.95rem] font-bold">Historial vehicular</h3>
                  <Chip tono={apto ? "ok" : "warn"}>{apto ? "Apto" : "Con pendientes"}</Chip>
                </div>
                <p className="ink-2 text-xs">
                  Score {salud}/100 · {etiquetaSalud}
                </p>
                <p className="ink-3 nums text-[0.7rem]">
                  {state.mantenimientos.length} registros · {vencidos} vencidos · {money(totalAnio)} invertidos
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-xl px-3 py-2" style={{ background: "var(--surface-2)" }}>
              <p className="ink-3 text-[0.62rem] font-bold uppercase tracking-wide">Lo que toca hacer</p>
              {faltantes.length === 0 ? (
                <p className="ink-2 text-xs">Todo al día. Buen trabajo.</p>
              ) : (
                <ul className="mt-1 flex flex-col gap-0.5">
                  {faltantes.map((d) => (
                    <li key={d.componente.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="ink truncate">{d.componente.nombre}</span>
                      <span className="ink-2 nums shrink-0">
                        {d.kmRestantes > 0 ? `faltan ${num(d.kmRestantes)} km` : `vencido por ${num(d.kmExcedidos)} km`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Últimos 12 meses" value={moneyShort(totalAnio)} hint={`${todos.length} registros`} tono="brand" />
            <Stat label="Promedio mensual" value={moneyShort(promedioMes)} hint={`${mesesConDatos} meses con gasto`} />
            <Stat label="Costo por km" value={money(porKm)} hint="todo incluido" />
            <Stat label="Proyección anual" value={moneyShort(proyeccion)} hint="según últimos 3 meses" tono="info" />
          </div>

          <div className="card p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="ink text-[0.9rem] font-bold">Costo de los mantenimientos</h3>
              <span className="ink-3 text-[0.65rem]">12 meses</span>
            </div>
            <BarrasMensuales
              data={serie12.map((m) => ({ label: m.key.slice(5), value: m.total }))}
              height={180}
            />
          </div>

          {categorias.length === 0 ? (
            <EmptyState
              icon={<FileDown size={22} />}
              title="Todavía no hay datos"
              description="Registra tus primeros mantenimientos y tanqueos para ver reportes reales."
            />
          ) : (
            <div className="card p-4">
              <h3 className="ink mb-3 text-[0.9rem] font-bold">Distribución de gastos</h3>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <Dona data={dona} centroTitulo="Total" centroValor={moneyShort(totalAnio)} />
                <div className="w-full flex-1">
                  <LeyendaDona data={dona} />
                </div>
              </div>
              {categorias[0] && (
                <p className="ink-2 mt-3 flex items-start gap-1.5 rounded-xl px-3 py-2 text-[0.72rem]" style={{ background: "var(--surface-2)" }}>
                  <Lightbulb size={14} className="mt-0.5 shrink-0" style={{ color: "var(--warn)" }} />
                  Tu mayor gasto es <span className="ink font-semibold">{CATEGORIAS[categorias[0].categoria].label}</span> con{" "}
                  {money(categorias[0].total)} ({Math.round((categorias[0].total / Math.max(1, totalAnio)) * 100)}% del total).
                </p>
              )}
            </div>
          )}

          <div className="card p-4">
            <h3 className="ink mb-2 text-[0.9rem] font-bold">Resumen por categoría</h3>
            <div className="divide-y divide-[var(--line)]">
              {categorias.map((c) => (
                <div key={c.categoria} className="flex items-center gap-2 py-1.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${CATEGORIAS[c.categoria].color}18`, color: CATEGORIAS[c.categoria].color }}>
                    <Icono nombre={CATEGORIAS[c.categoria].icono} size={14} />
                  </span>
                  <span className="ink flex-1 text-xs font-semibold">{CATEGORIAS[c.categoria].label}</span>
                  <span className="ink-3 nums text-[0.68rem]">{c.count}×</span>
                  <span className="nums ink text-xs font-bold">{money(c.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {vista === "mensual" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat label="Mes actual" value={money(serie12[serie12.length - 1]?.total ?? 0)} hint={formatDate(isoDate(), "mes")} tono="brand" />
            <Stat label="Mes anterior" value={money(serie12[serie12.length - 2]?.total ?? 0)} />
            <Stat label="Promedio 12 m" value={money(promedioMes)} />
          </div>
          <div className="card p-4">
            <h3 className="ink mb-2 text-[0.9rem] font-bold">Evolución mensual</h3>
            <BarrasMensuales data={serie12.map((m) => ({ label: m.key.slice(5), value: m.total }))} height={170} />
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="ink-3 border-b border-[var(--line)] text-[0.65rem] uppercase tracking-wide">
                  <th className="px-3 py-2 font-bold">Mes</th>
                  <th className="px-3 py-2 font-bold">Registros</th>
                  <th className="px-3 py-2 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {mesesMensual.map((m) => (
                  <tr key={m.key} className="border-b border-[var(--line)] last:border-0">
                    <td className="ink px-3 py-2 font-semibold">{monthLabel(m.key)}</td>
                    <td className="ink-2 nums px-3 py-2">{m.cantidad}</td>
                    <td className="nums ink px-3 py-2 text-right font-bold">{money(m.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ink-3 flex items-start gap-1.5 px-1 text-[0.68rem]">
            <Info size={13} className="mt-0.5 shrink-0" /> Los meses sin registros no significan que la moto no costó:
            revisa si te faltó registrar algún tanqueo.
          </p>
        </div>
      )}

      {vista === "combustible" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat label="Rendimiento" value={`${num(comb.promedioKmGal, 1)} km/gal`} hint={`${num(comb.promedioKmL, 2)} km/l`} tono="ok" />
            <Stat label="Galones" value={num(comb.totalGalones, 1)} hint="acumulados" />
            <Stat label="Gasto total" value={moneyShort(comb.totalGasto)} hint="combustible" />
          </div>
          <div className="card p-4">
            <h3 className="ink mb-1 text-[0.9rem] font-bold">Rendimiento entre tanqueos</h3>
            <p className="ink-2 mb-2 text-xs">Cada punto es un tanqueo lleno</p>
            {puntos.length > 1 ? (
              <Linea puntos={puntos} unidad="km/l" />
            ) : (
              <p className="ink-3 py-8 text-center text-xs">Registra al menos dos tanqueos llenos para ver la curva.</p>
            )}
          </div>
          <div className="card p-4">
            <h3 className="ink mb-2 text-[0.9rem] font-bold">Últimos tanqueos</h3>
            <div className="divide-y divide-[var(--line)]">
              {comb.mediciones.slice(-6).reverse().map((t) => (
                <div key={t.mantenimiento.id} className="flex items-center gap-2 py-1.5 text-xs">
                  <span className="ink-2 nums w-20">{formatDate(t.mantenimiento.fecha)}</span>
                  <span className="ink nums flex-1">{num(t.tanqueo.galones, 2)} gal</span>
                  <span className="ink-2 nums">{t.rendimientoKmGal ? `${num(t.rendimientoKmGal, 1)} km/gal` : "—"}</span>
                  <span className="nums ink w-20 text-right font-bold">{money(t.mantenimiento.costo)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
