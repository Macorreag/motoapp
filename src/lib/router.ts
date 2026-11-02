import { useEffect, useState } from "react";

export type Ruta =
  | "inicio"
  | "vehiculo"
  | "mantenimientos"
  | "alertas"
  | "reportes"
  | "gastos"
  | "pico"
  | "talleres"
  | "ajustes";

const VALIDAS: Ruta[] = [
  "inicio",
  "vehiculo",
  "mantenimientos",
  "alertas",
  "reportes",
  "gastos",
  "pico",
  "talleres",
  "ajustes",
];

function leer(): Ruta {
  const h = window.location.hash.replace(/^#\/?/, "");
  return (VALIDAS.includes(h as Ruta) ? h : "inicio") as Ruta;
}

export function useRuta(): [Ruta, (r: Ruta) => void] {
  const [ruta, setRuta] = useState<Ruta>(leer);
  useEffect(() => {
    const onHash = () => setRuta(leer());
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) window.location.hash = "#/inicio";
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const ir = (r: Ruta) => {
    window.location.hash = `#/${r}`;
    setRuta(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return [ruta, ir];
}
