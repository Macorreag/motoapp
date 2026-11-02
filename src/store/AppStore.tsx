import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type {
  Ajustes,
  Alerta,
  AppState,
  Componente,
  Documento,
  ID,
  Mantenimiento,
  OrdenServicio,
  Taller,
  Tarea,
  Vehiculo,
} from "../types";
import { estadoInicial, estadoDemo, migrar, type DatosOnboarding } from "../data/seed";
import { crearBackend, type Backend, type Capacidades } from "./backend";
import { aplicarMutacion, puntosTotales } from "./mutaciones";

export { PUNTOS } from "./mutaciones";

interface Aviso {
  texto: string;
  tono: "ok" | "error" | "info";
}

interface Ctx {
  state: AppState;
  cargado: boolean;
  capacidades: Capacidades;
  guardando: boolean;
  aviso: Aviso | null;
  errorCarga: string | null;
  recargar: () => Promise<void>;
  limpiarAviso: () => void;
  guardarVehiculo: (patch: Partial<Vehiculo>) => void;
  registrarMantenimiento: (m: Omit<Mantenimiento, "id" | "vehiculoId">) => void;
  actualizarMantenimiento: (id: ID, patch: Partial<Mantenimiento>) => void;
  borrarMantenimiento: (id: ID) => void;
  guardarDocumento: (d: Documento) => void;
  borrarDocumento: (id: ID) => void;
  guardarComponente: (c: Componente) => void;
  borrarComponente: (id: ID) => void;
  guardarAlerta: (a: Alerta) => void;
  borrarAlerta: (id: ID) => void;
  guardarTaller: (t: Taller) => void;
  borrarTaller: (id: ID) => void;
  guardarOrden: (o: OrdenServicio) => void;
  borrarOrden: (id: ID) => void;
  guardarTarea: (t: Tarea) => void;
  borrarTarea: (id: ID) => void;
  inicializarTareas: (lista: Tarea[]) => void;
  reiniciarTareas: (lista: Tarea[]) => void;
  guardarAjustes: (patch: Partial<Ajustes>) => void;
  sumarPuntos: (motivo: string, puntos: number) => void;
  completarOnboarding: (datos: {
    vehiculo: Vehiculo;
    componentes: Componente[];
    documentos: Documento[];
    ajustes: Partial<Ajustes>;
  }) => void;
  cargarDemo: () => void;
  reiniciar: () => void;
  importar: (json: string) => boolean;
  exportar: () => string;
  totalPuntos: number;
}

const AppCtx = createContext<Ctx | null>(null);

const INTERVALO_SYNC_MS = 15_000;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const backendRef = useRef<Backend | null>(null);
  if (!backendRef.current) backendRef.current = crearBackend();
  const backend = backendRef.current;

  const [state, setState] = useState<AppState>(estadoInicial);
  const [cargado, setCargado] = useState(false);
  const [guardando, setGuardando] = useState(0);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const stateRef = useRef(state);
  const tokenRef = useRef("");
  const guardandoRef = useRef(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const mostrarAviso = useCallback((texto: string, tono: Aviso["tono"] = "info") => {
    setAviso({ texto, tono });
    window.setTimeout(() => setAviso(null), 6_000);
  }, []);

  /* ---------------- Carga inicial ---------------- */
  useEffect(() => {
    let vivo = true;
    void backend
      .cargar()
      .then((snap) => {
        if (!vivo) return;
        setState(migrar(snap.estado));
        tokenRef.current = snap.token;
        setErrorCarga(null);
        setCargado(true);
      })
      .catch((e: Error) => {
        if (!vivo) return;
        setCargado(true);
        setErrorCarga(e.message);
      });
    return () => {
      vivo = false;
    };
  }, [backend, mostrarAviso]);

  /* ---------------- Persistencia ---------------- */
  const persistir = useCallback(
    async (nuevo: AppState, accion: string, datos: unknown) => {
      guardandoRef.current += 1;
      setGuardando(guardandoRef.current);
      try {
        let r = await backend.guardar(nuevo, tokenRef.current);
        if (!r.ok && r.estado) {
          // La hoja cambió mientras editabas: se recarga y se reaplica el cambio.
          const reintento = aplicarMutacion(migrar(r.estado), accion, datos);
          const r2 = await backend.guardar(reintento, r.token);
          if (r2.ok) {
            setState(reintento);
            tokenRef.current = r2.token;
            mostrarAviso("La hoja había cambiado: se recargó y se guardó tu cambio.", "ok");
          } else {
            setState(migrar(r.estado));
            tokenRef.current = r.token;
            mostrarAviso("No se pudo guardar porque la hoja cambió. Inténtalo otra vez.", "error");
          }
          return;
        }
        if (r.ok) tokenRef.current = r.token;
        else mostrarAviso("No se pudo guardar el cambio.", "error");
      } catch (e) {
        mostrarAviso(`Error al guardar: ${(e as Error).message}`, "error");
      } finally {
        guardandoRef.current = Math.max(0, guardandoRef.current - 1);
        setGuardando(guardandoRef.current);
      }
    },
    [backend, mostrarAviso],
  );

  const mutar = useCallback(
    (accion: string, datos?: unknown) => {
      const base = stateRef.current;
      const nuevo = aplicarMutacion(base, accion, datos);
      if (nuevo === base) return;
      stateRef.current = nuevo;
      setState(nuevo);
      void persistir(nuevo, accion, datos);
    },
    [persistir],
  );

  /* ---------------- Sincronización con la hoja ---------------- */
  useEffect(() => {
    if (!cargado || backend.capacidades.backend !== "gas") return;
    let vivo = true;
    let enCurso = false;

    const sincronizar = async () => {
      if (!vivo || enCurso || guardandoRef.current > 0) return;
      enCurso = true;
      try {
        const snap = await backend.cargar();
        if (!vivo) return;
        if (snap.token !== tokenRef.current) {
          setState(migrar(snap.estado));
          tokenRef.current = snap.token;
          mostrarAviso("Actualizado desde la hoja de cálculo.", "ok");
        }
      } catch {
        /* se reintenta en el próximo ciclo */
      } finally {
        enCurso = false;
      }
    };

    const timer = window.setInterval(() => {
      if (!document.hidden) void sincronizar();
    }, INTERVALO_SYNC_MS);

    const alVolver = () => {
      if (!document.hidden) void sincronizar();
    };
    document.addEventListener("visibilitychange", alVolver);

    return () => {
      vivo = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [cargado, backend, mostrarAviso]);

  /* ---------------- Tema ---------------- */
  useEffect(() => {
    const raiz = document.documentElement;
    const aplicar = () => {
      const oscuro =
        state.ajustes.tema === "oscuro" ||
        (state.ajustes.tema === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      raiz.classList.toggle("dark", oscuro);
      raiz.style.colorScheme = oscuro ? "dark" : "light";
    };
    aplicar();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", aplicar);
    return () => mq.removeEventListener("change", aplicar);
  }, [state.ajustes.tema]);

  const valor = useMemo<Ctx>(
    () => ({
      state,
      cargado,
      capacidades: backend.capacidades,
      guardando: guardando > 0,
      aviso,
      errorCarga,
      recargar: async () => {
        try {
          const snap = await backend.cargar();
          setState(migrar(snap.estado));
          tokenRef.current = snap.token;
          setErrorCarga(null);
          mostrarAviso("Datos actualizados.", "ok");
        } catch (e) {
          setErrorCarga((e as Error).message);
          mostrarAviso(`No se pudo leer la hoja: ${(e as Error).message}`, "error");
        }
      },
      limpiarAviso: () => setAviso(null),
      guardarVehiculo: (patch) => mutar("vehiculo", patch),
      registrarMantenimiento: (m) => mutar("mantenimiento:crear", m),
      actualizarMantenimiento: (id, patch) => mutar("mantenimiento:actualizar", { id, patch }),
      borrarMantenimiento: (id) => mutar("mantenimiento:borrar", id),
      guardarDocumento: (d) => mutar("documento:guardar", d),
      borrarDocumento: (id) => mutar("documento:borrar", id),
      guardarComponente: (c) => mutar("componente:guardar", c),
      borrarComponente: (id) => mutar("componente:borrar", id),
      guardarAlerta: (a) => mutar("alerta:guardar", a),
      borrarAlerta: (id) => mutar("alerta:borrar", id),
      guardarTaller: (t) => mutar("taller:guardar", t),
      borrarTaller: (id) => mutar("taller:borrar", id),
      guardarOrden: (o) => mutar("orden:guardar", o),
      borrarOrden: (id) => mutar("orden:borrar", id),
      guardarTarea: (t) => mutar("tarea:guardar", t),
      borrarTarea: (id) => mutar("tarea:borrar", id),
      inicializarTareas: (lista) => mutar("tareas:inicializar", lista),
      reiniciarTareas: (lista) => mutar("tareas:reiniciar", lista),
      guardarAjustes: (patch) => mutar("ajustes", patch),
      sumarPuntos: (motivo, puntos) => mutar("puntos", { motivo, puntos }),
      completarOnboarding: (datos) => mutar("onboarding", datos),
      cargarDemo: () => mutar("reemplazar", { ...estadoDemo(), esDemo: true }),
      reiniciar: () => mutar("reiniciar"),
      importar: (json: string) => {
        try {
          const data = JSON.parse(json) as AppState;
          if (!data || typeof data !== "object" || !("ajustes" in data)) return false;
          mutar("reemplazar", data);
          return true;
        } catch {
          return false;
        }
      },
      exportar: () => JSON.stringify(state, null, 2),
      totalPuntos: puntosTotales(state),
    }),
    [state, cargado, backend, guardando, aviso, errorCarga, mutar, mostrarAviso],
  );

  return <AppCtx.Provider value={valor}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp debe usarse dentro de AppProvider");
  return ctx;
}

export type { DatosOnboarding };
