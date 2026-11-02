/**
 * Enlaces opcionales a la hoja de cálculo y al proyecto de Apps Script.
 *
 * Los IDs no viven en el repositorio: se inyectan en tiempo de build con las
 * variables `VITE_HOJA_ID` y `VITE_SCRIPT_ID` (ver `.env.example`). Si no están
 * definidas, la app no muestra los accesos directos y nada se rompe.
 */
const HOJA_ID = (import.meta.env.VITE_HOJA_ID ?? "").trim();
const SCRIPT_ID = (import.meta.env.VITE_SCRIPT_ID ?? "").trim();

export const URL_HOJA = HOJA_ID ? `https://docs.google.com/spreadsheets/d/${HOJA_ID}/edit` : "";
export const URL_EDITOR = SCRIPT_ID ? `https://script.google.com/d/${SCRIPT_ID}/edit` : "";
