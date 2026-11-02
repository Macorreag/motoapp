/**
 * Prueba Hoja.gs + Codigo.gs contra un SpreadsheetApp simulado.
 * Verifica: creación de pestañas, ida y vuelta de datos, token estable,
 * detección de ediciones externas, conflictos y reordenamiento de columnas.
 */
import fs from "node:fs";
import vm from "node:vm";
import crypto from "node:crypto";
import assert from "node:assert";

/* ------------------------- SpreadsheetApp falso ------------------------- */

class FakeSheet {
  constructor(nombre) {
    this.nombre = nombre;
    this.datos = []; // filas x columnas (0-based)
  }
  getName() { return this.nombre; }
  _vacio(v) { return v === "" || v === null || v === undefined; }
  getLastRow() {
    for (let r = this.datos.length - 1; r >= 0; r--) {
      if ((this.datos[r] || []).some((v) => !this._vacio(v))) return r + 1;
    }
    return 0;
  }
  getLastColumn() {
    let max = 0;
    for (const fila of this.datos) {
      for (let c = fila.length - 1; c >= 0; c--) {
        if (!this._vacio(fila[c])) { max = Math.max(max, c + 1); break; }
      }
    }
    return max;
  }
  getRange(r, c, nr = 1, nc = 1) {
    const sheet = this;
    return {
      getValues() {
        const out = [];
        for (let i = 0; i < nr; i++) {
          const fila = [];
          for (let j = 0; j < nc; j++) {
            const f = sheet.datos[r - 1 + i];
            fila.push(f && f[c - 1 + j] !== undefined ? f[c - 1 + j] : "");
          }
          out.push(fila);
        }
        return out;
      },
      setValues(vals) {
        assert.equal(vals.length, nr, "setValues: filas no coinciden");
        vals.forEach((fila, i) => {
          assert.equal(fila.length, nc, "setValues: columnas no coinciden");
          const idx = r - 1 + i;
          while (sheet.datos.length <= idx) sheet.datos.push([]);
          for (let j = 0; j < nc; j++) sheet.datos[idx][c - 1 + j] = fila[j];
        });
        return this;
      },
      clearContent() {
        for (let i = 0; i < nr; i++) {
          const idx = r - 1 + i;
          if (!sheet.datos[idx]) continue;
          for (let j = 0; j < nc; j++) sheet.datos[idx][c - 1 + j] = "";
        }
        return this;
      },
      setFontWeight() { return this; },
      setBackground() { return this; },
    };
  }
  setFrozenRows() { return this; }
  setColumnWidths() { return this; }
}

class FakeSpreadsheet {
  constructor(nombre, id) {
    this.nombre = nombre;
    this.id = id;
    this.hojas = [];
  }
  getName() { return this.nombre; }
  getId() { return this.id; }
  getSheets() { return this.hojas; }
  getSheetByName(n) { return this.hojas.find((h) => h.getName() === n) || null; }
  insertSheet(n) { const h = new FakeSheet(n); this.hojas.push(h); return h; }
}

const HOJA_ID = process.env.HOJA_ID || "hoja-de-prueba";
const libro = new FakeSpreadsheet("Mi hoja", HOJA_ID);

const props = { HOJA_ID };
const sandbox = {
  SpreadsheetApp: { openById: (id) => { assert.equal(id, HOJA_ID); return libro; } },
  Session: { getActiveUser: () => ({ getEmail: () => "dueno@example.com" }) },
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: (k) => (k in props ? props[k] : null),
      setProperty: (k, v) => { props[k] = String(v); },
    }),
  },
  Utilities: {
    DigestAlgorithm: { MD5: "MD5" },
    Charset: { UTF_8: "UTF-8" },
    computeDigest(_alg, texto) {
      const bytes = crypto.createHash("md5").update(texto, "utf8").digest();
      return Array.from(bytes).map((b) => (b > 127 ? b - 256 : b));
    },
    formatDate(fecha, _tz, _fmt) {
      const d = new Date(fecha);
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dia = String(d.getUTCDate()).padStart(2, "0");
      return `${d.getUTCFullYear()}-${m}-${dia}`;
    },
  },
  console: { log: () => {}, error: () => {} },
  HtmlService: {
    createHtmlOutputFromFile: () => ({ setTitle: () => ({ addMetaTag: () => ({ setXFrameOptionsMode: () => ({}) }) }) }),
    XFrameOptionsMode: { ALLOWALL: "ALLOWALL" },
  },
};

const fuente = fs.readFileSync("gas/Hoja.gs", "utf8") + "\n" + fs.readFileSync("gas/Codigo.gs", "utf8");
vm.createContext(sandbox);
vm.runInContext(
  fuente +
    "\n;globalThis.__api = api; globalThis.__setup = setup; globalThis.__esquemas = ESQUEMAS; globalThis.__estado = leerEstado_;",
  sandbox,
);

const api = sandbox.__api;
const setup = sandbox.__setup;
const ESQUEMAS = sandbox.__esquemas;

/* ------------------------------- Pruebas ------------------------------- */

// 1. setup crea todas las pestañas con cabeceras
setup();
assert.equal(libro.hojas.length, Object.keys(ESQUEMAS).length, "faltan pestañas");
for (const [nombre, cols] of Object.entries(ESQUEMAS)) {
  const h = libro.getSheetByName(nombre);
  assert.ok(h, `no existe la pestaña ${nombre}`);
  const cab = h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0];
  assert.deepEqual(cab, cols.map((c) => c[0]), `cabeceras incorrectas en ${nombre}`);
}
console.log("✓ setup crea", libro.hojas.length, "pestañas con cabeceras");

// 2. cargar sin datos → onboarding pendiente y token
let r = api("cargar");
assert.equal(r.capacidades.backend, "gas");
assert.equal(r.capacidades.fotos, false);
assert.equal(r.estado.onboardingCompleto, false);
assert.equal(r.estado.vehiculo, null);
assert.ok(r.token.length >= 16, "token inválido");
const tokenVacio = r.token;
console.log("✓ cargar vacío:", r.estado.mantenimientos.length, "registros, token", r.token.slice(0, 8) + "…");

// 3. guardar un estado completo
const estado = {
  version: 1,
  vehiculo: {
    id: "moto-1", placa: "GAS 01", apodo: "La XTZ", marca: "Yamaha", linea: "XTZ 250",
    modelo: 2023, color: "Azul", cilindraje: 249, vin: "9C6RG2110P0012345", numeroMotor: "G3E1E",
    kmActual: 5200, kmInicial: 5000, fechaMatricula: "2024-06-01", fechaCompra: "2024-06-05",
    ciudad: "Bogotá", notas: "Prueba", archivado: false, creado: "2024-06-01",
  },
  componentes: [
    { id: "c1", vehiculoId: "moto-1", nombre: "Cambio de aceite", categoria: "aceite", intervaloKm: 4000,
      intervaloMeses: 6, vidaUtilKm: 5000, costoEstimado: 85000, ultimoKm: 5000, ultimaFecha: "2026-08-01",
      notas: "10W-40", activo: true, icono: "aceite" },
    { id: "c2", vehiculoId: "moto-1", nombre: "Lubricación de cadena", categoria: "cadena", intervaloKm: 500,
      intervaloMeses: 1, vidaUtilKm: 500, costoEstimado: 10000, ultimoKm: 5000, ultimaFecha: "2026-08-01",
      notas: "", activo: true, icono: "cadena" },
  ],
  mantenimientos: [
    { id: "m1", vehiculoId: "moto-1", fecha: "2026-10-20", km: 5200, categoria: "aceite",
      titulo: "Cambio de aceite", tipo: "preventivo", costo: 85000, taller: "Taller X", descripcion: "10W-40",
      componenteId: "c1" },
    { id: "m2", vehiculoId: "moto-1", fecha: "2026-10-25", km: 5200, categoria: "combustible",
      titulo: "Tanqueo", tipo: "preventivo", costo: 62000,
      tanqueo: { galones: 3.1, precioGalon: 20000, odometro: 5200, tanqueLleno: true } },
  ],
  documentos: [
    { id: "d1", vehiculoId: "moto-1", tipo: "soat", nombre: "SOAT", numero: "POL-1", entidad: "AXA",
      fechaExpedicion: "2026-01-10", fechaVencimiento: "2027-01-10", valor: 761400 },
  ],
  alertas: [
    { id: "a1", vehiculoId: "moto-1", titulo: "Revisar presión", detalle: "18/22 psi", tipo: "personalizada",
      fechaVencimiento: "2026-11-05", anticipacionDias: 7, activa: true, creada: "2026-10-01" },
  ],
  talleres: [{ id: "t1", nombre: "Taller X", telefono: "300", direccion: "Calle 1", especialidad: "Yamaha", calificacion: 5, notas: "" }],
  ordenes: [{ id: "o1", vehiculoId: "moto-1", tallerId: "t1", fecha: "2026-10-20", km: 5200, concepto: "Aceite", costo: 85000, calificacion: 5, estado: "cerrada", notas: "" }],
  puntos: [{ id: "p1", fecha: "2026-10-20", motivo: "Cambio de aceite", puntos: 10 }],
  ajustes: { nombre: "Miller", tema: "oscuro", ciudad: "bogota", tipoVehiculo: "moto", moneda: "COP",
    mostrarPuntos: true, picoPlacaDigitos: {}, picoPlacaActivo: true },
  onboardingCompleto: true,
  esDemo: false,
};

let g = api("guardar", { estado, token: tokenVacio });
assert.equal(g.ok, true, "no guardó: " + JSON.stringify(g).slice(0, 200));
console.log("✓ guardar estado completo");

// 4. ida y vuelta
r = api("cargar");
assert.equal(r.estado.vehiculo.placa, "GAS 01");
assert.equal(r.estado.vehiculo.kmActual, 5200);
assert.equal(r.estado.vehiculo.fechaMatricula, "2024-06-01");
assert.equal(r.estado.mantenimientos.length, 2);
const tanqueo = r.estado.mantenimientos.find((m) => m.id === "m2").tanqueo;
assert.deepEqual(tanqueo, { galones: 3.1, precioGalon: 20000, odometro: 5200, tanqueLleno: true });
assert.equal(r.estado.documentos[0].fechaVencimiento, "2027-01-10");
assert.equal(r.estado.ajustes.tema, "oscuro");
assert.equal(r.estado.alertas[0].anticipacionDias, 7);
assert.equal(r.estado.componentes.length, 2);
assert.equal(r.estado.talleres[0].calificacion, 5);
console.log("✓ ida y vuelta de datos (vehículo, plan, tanqueo, documentos, ajustes)");

// 5. token estable
const r2 = api("cargar");
assert.equal(r2.token, r.token, "el token cambia entre lecturas iguales");
console.log("✓ token estable entre lecturas");

// 6. edición externa de la hoja
const hojaMant = libro.getSheetByName("Mantenimientos");
const fila = hojaMant.getLastRow() + 1;
hojaMant.getRange(fila, 1, 1, ESQUEMAS.Mantenimientos.length).setValues([[
  "m3", "2026-10-27", 5300, "frenos", "Ajuste desde la hoja", "correctivo", 45000, "Taller Hoja", "", "", "", "", "", false,
]]);
const r3 = api("cargar");
assert.notEqual(r3.token, r.token, "no detectó la edición externa");
assert.ok(r3.estado.mantenimientos.some((m) => m.titulo === "Ajuste desde la hoja"), "no leyó la fila nueva");
console.log("✓ detecta filas agregadas a mano en la hoja");

// 7. conflicto de versión
const conflicto = api("guardar", { estado, token: r.token });
assert.equal(conflicto.ok, false);
assert.equal(conflicto.conflicto, true);
assert.ok(conflicto.estado.mantenimientos.some((m) => m.titulo === "Ajuste desde la hoja"));
console.log("✓ rechaza guardados con token viejo (no pisa la hoja)");

// 8. reordenar columnas no rompe la lectura
const h = libro.getSheetByName("Moto");
const cab = h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0];
const nueva = [...cab].reverse();
const valores = h.getRange(2, 1, 1, cab.length).getValues()[0];
h.getRange(1, 1, 1, cab.length).setValues([nueva]);
h.getRange(2, 1, 1, cab.length).setValues([[...valores].reverse()]);
const r4 = api("cargar");
assert.equal(r4.estado.vehiculo.placa, "GAS 01", "se rompió al reordenar columnas");
assert.equal(r4.estado.vehiculo.modelo, 2023);
console.log("✓ mover columnas en la hoja no rompe la app");

// 9. fila manual sin id recibe uno estable
const auto = r4.estado.mantenimientos.find((m) => m.titulo === "Ajuste desde la hoja");
assert.ok(auto && auto.id, "fila sin id no recibió id");
const r5 = api("cargar");
assert.equal(r5.estado.mantenimientos.find((m) => m.titulo === "Ajuste desde la hoja").id, auto.id, "id inestable");
console.log("✓ filas manuales sin id obtienen id estable");

// 10. escribir de nuevo deja la hoja consistente
const g2 = api("guardar", { estado: r5.estado, token: r5.token });
assert.equal(g2.ok, true);
const r6 = api("cargar");
assert.equal(r6.estado.mantenimientos.length, r5.estado.mantenimientos.length);
console.log("✓ reescritura completa consistente");

console.log("\nTODO OK · Hoja.gs y Codigo.gs funcionan contra el simulador");
