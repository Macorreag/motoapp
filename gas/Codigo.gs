/**
 * MotoApp · XTZ 250 — app web de Google Apps Script
 *
 * - Los datos viven en la hoja indicada en Hoja.gs (una pestaña por entidad).
 * - Si editas la hoja, la app lo detecta y se actualiza sola (~8 s).
 * - La app escribe en la hoja con control de versión: si la hoja cambió
 *   mientras editabas, recarga y reintenta en vez de pisar tus cambios.
 */

function dueno_() {
  return PropertiesService.getScriptProperties().getProperty('DUENO') || '';
}

/** Con acceso "solo yo" Google ya filtra; esto es defensa por si se cambia el acceso. */
function accesoPermitido_() {
  const dueno = dueno_();
  if (!dueno) return true;
  const email = Session.getActiveUser().getEmail();
  return Boolean(email) && email === dueno;
}

function doGet(e) {
  if (!accesoPermitido_()) {
    return HtmlService.createHtmlOutput(
      '<div style="font:16px system-ui;padding:32px;text-align:center">' +
        '<h1>Acceso restringido</h1>' +
        '<p>Esta app es privada.</p>' +
        '</div>',
    ).setTitle('Acceso restringido');
  }
  // El iframe de HtmlService no conserva el query string: lo pasamos como global.
  const salida = HtmlService.createHtmlOutputFromFile('app')
    .setTitle('MotoApp · XTZ 250')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .addMetaTag('mobile-web-app-capable', 'yes')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  const demo = e && e.parameter && (e.parameter.demo === '1' || e.parameter.demo === 'true');
  salida.append('<script>window.__MOTOAPP_DEMO__ = ' + (demo ? 'true' : 'false') + ';</script>');
  return salida;
}

/**
 * Punto único de entrada para el cliente: google.script.run.api(accion, datos)
 */
function api(accion, datos) {
  try {
    if (!accesoPermitido_()) return { error: 'Acceso restringido: esta app es privada.' };
    if (accion === 'cargar') {
      const estado = leerEstado_();
      const libro = abrirHoja_();
      return {
        estado: estado,
        token: token_(estado),
        capacidades: { fotos: false, backend: 'gas', importar: true },
        meta: {
          libro: libro.getName(),
          id: libro.getId(),
          pestanas: nombreHojas_().length,
          registros: estado.mantenimientos.length,
        },
      };
    }

    if (accion === 'guardar') {
      if (!datos || !datos.estado) return { error: 'No llegaron datos para guardar.' };
      const actual = leerEstado_();
      const tokenActual = token_(actual);
      if (datos.token && datos.token !== tokenActual) {
        return { ok: false, estado: actual, token: tokenActual, conflicto: true };
      }
      escribirEstado_(datos.estado);
      const nuevo = leerEstado_();
      return { ok: true, token: token_(nuevo) };
    }

    if (accion === 'bundle') {
      return bundleBase64_();
    }

    if (accion === 'diagnostico') {
      return diagnostico_();
    }

    if (accion === 'setup') {
      const ss = abrirHoja_();
      asegurarHojas_(ss);
      return { ok: true, diagnostico: diagnostico_() };
    }

    return { error: 'Acción desconocida: ' + accion };
  } catch (e) {
    const mensaje = e && e.message ? e.message : String(e);
    console.error('api(' + accion + '): ' + mensaje + '\n' + (e && e.stack ? e.stack : ''));
    return { error: 'Error en el servidor: ' + mensaje };
  }
}

/**
 * Ejecuta esto UNA vez desde el editor de Apps Script para autorizar y crear
 * las pestañas. Luego abre la app web (Implementar → Aplicaciones web).
 */
function setup() {
  const ss = abrirHoja_();
  asegurarHojas_(ss);
  PropertiesService.getScriptProperties().setProperty('HOJAS_OK', '1');
  const email = Session.getActiveUser().getEmail();
  if (email) PropertiesService.getScriptProperties().setProperty('DUENO', email);
  const estado = leerEstado_();
  if (!estado.onboardingCompleto) {
    // Deja la pestaña Ajustes con valores por defecto para que sea editable.
    escribirAjustes_(ss, AJUSTES_DEFECTO);
  }
  const info = diagnostico_();
  console.log(
    'MotoApp listo.\n' +
      'Libro: ' + info.titulo + '\n' +
      'Pestañas: ' + info.hojas.map(function (h) { return h.nombre; }).join(', ') + '\n' +
      'Abre la app en: Implementar → Aplicaciones web',
  );
  return info;
}

/**
 * Menú rápido. Solo funciona si algún día vinculados el script a la hoja
 * (un script independiente no tiene menú); por eso va protegido.
 */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('MotoApp')
      .addItem('Crear/verificar pestañas', 'setup')
      .addItem('Ver diagnóstico en consola', 'diagnosticoConsola')
      .addToUi();
  } catch (e) {
    // Script independiente: no hay menú que agregar.
  }
}

function diagnosticoConsola() {
  console.log(JSON.stringify(diagnostico_(), null, 2));
}
