import type { AppState } from "../types";
import { cargarEstado, escribirEstado } from "./storage";
import { estadoInicial, migrar } from "../data/seed";

export interface Snapshot {
  estado: AppState;
  token: string;
}

export interface ResultadoGuardado {
  ok: boolean;
  token: string;
  estado?: AppState;
}

export interface Capacidades {
  fotos: boolean;
  backend: "local" | "gas";
  importar: boolean;
}

export interface Backend {
  capacidades: Capacidades;
  cargar(): Promise<Snapshot>;
  guardar(estado: AppState, tokenBase: string): Promise<ResultadoGuardado>;
}

/** Hash estable y barato para comparar estados en el navegador. */
export function huella(texto: string): string {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) | 0;
  return `${(h >>> 0).toString(36)}-${texto.length.toString(36)}`;
}

/* ------------------------------------------------------------------ */
/*  Backend local (navegador / IndexedDB)                              */
/* ------------------------------------------------------------------ */

export class BackendLocal implements Backend {
  capacidades: Capacidades = { fotos: true, backend: "local", importar: true };
  private token = "";

  async cargar(): Promise<Snapshot> {
    const guardado = await cargarEstado();
    const estado = guardado ? migrar(guardado) : estadoInicial();
    this.token = huella(JSON.stringify(guardado ?? null));
    return { estado, token: this.token };
  }

  async guardar(estado: AppState): Promise<ResultadoGuardado> {
    await escribirEstado(estado);
    this.token = huella(JSON.stringify(estado));
    return { ok: true, token: this.token };
  }
}

/* ------------------------------------------------------------------ */
/*  Backend Google Apps Script (google.script.run)                     */
/* ------------------------------------------------------------------ */

type Runner = {
  withSuccessHandler: (fn: (r: unknown) => void) => Runner;
  withFailureHandler: (fn: (e: unknown) => void) => Runner;
  api: (accion: string, datos?: unknown) => void;
};

function runner(): Runner | null {
  const g = (window as unknown as { google?: { script?: { run?: Runner } } }).google;
  return g?.script?.run ?? null;
}

export function esAppsScript(): boolean {
  return runner() !== null;
}

function llamar<T>(accion: string, datos?: unknown): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const r = runner();
    if (!r) {
      reject(new Error("Este navegador no está ejecutando la app dentro de Google Apps Script."));
      return;
    }
    const timer = setTimeout(() => reject(new Error("Apps Script no respondió a tiempo. Revisa tu conexión.")), 60_000);
    r.withSuccessHandler((res) => {
      clearTimeout(timer);
      const data = res as { error?: string };
      if (data && typeof data === "object" && data.error) {
        reject(new Error(data.error));
        return;
      }
      resolve(res as T);
    })
      .withFailureHandler((err) => {
        clearTimeout(timer);
        const mensaje =
          typeof err === "object" && err && "message" in err ? String((err as { message: unknown }).message) : String(err);
        reject(new Error(mensaje));
      })
      .api(accion, datos ?? null);
  });
}

export class BackendGas implements Backend {
  capacidades: Capacidades = { fotos: false, backend: "gas", importar: true };
  /** google.script.run no es seguro con llamadas simultáneas: se serializan. */
  private cola: Promise<unknown> = Promise.resolve();

  private enCola<T>(fn: () => Promise<T>): Promise<T> {
    const siguiente = this.cola.then(fn, fn);
    this.cola = siguiente.catch(() => undefined);
    return siguiente;
  }

  cargar(): Promise<Snapshot> {
    return this.enCola(async () => {
      const r = await llamar<{ estado: AppState; token: string; capacidades?: Partial<Capacidades> }>("cargar");
      if (r.capacidades) this.capacidades = { ...this.capacidades, ...r.capacidades };
      return { estado: r.estado, token: r.token };
    });
  }

  guardar(estado: AppState, tokenBase: string): Promise<ResultadoGuardado> {
    return this.enCola(() => llamar<ResultadoGuardado>("guardar", { estado, token: tokenBase }));
  }
}

export function crearBackend(): Backend {
  return esAppsScript() ? new BackendGas() : new BackendLocal();
}
