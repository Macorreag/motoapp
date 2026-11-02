/**
 * MotoApp · capa de datos sobre Google Sheets
 *
 * Cada pestaña es una tabla con cabeceras en la fila 1. La app lee por nombre
 * de cabecera (puedes mover columnas sin romper nada) y escribe en el orden
 * del esquema.
 */

// ID de la hoja de cálculo (vacío = hoja vinculada al script).
// Alternativa: define la propiedad de script HOJA_ID con el ID de tu hoja.
const HOJA_ID = '';
const ZONA = 'America/Bogota';

/** tipo: texto | num | bool | json */
const ESQUEMAS = {
  Moto: [
    ['id', 'texto'], ['placa', 'texto'], ['apodo', 'texto'], ['marca', 'texto'], ['linea', 'texto'],
    ['modelo', 'num'], ['color', 'texto'], ['cilindraje', 'num'], ['vin', 'texto'], ['numeroMotor', 'texto'],
    ['kmActual', 'num'], ['kmInicial', 'num'], ['fechaMatricula', 'texto'], ['fechaCompra', 'texto'],
    ['ciudad', 'texto'], ['notas', 'texto'], ['archivado', 'bool'], ['creado', 'texto'],
  ],
  Plan: [
    ['id', 'texto'], ['nombre', 'texto'], ['categoria', 'texto'], ['intervaloKm', 'num'],
    ['intervaloMeses', 'num'], ['vidaUtilKm', 'num'], ['costoEstimado', 'num'], ['ultimoKm', 'num'],
    ['ultimaFecha', 'texto'], ['notas', 'texto'], ['activo', 'bool'], ['icono', 'texto'],
  ],
  Mantenimientos: [
    ['id', 'texto'], ['fecha', 'texto'], ['km', 'num'], ['categoria', 'texto'], ['titulo', 'texto'],
    ['tipo', 'texto'], ['costo', 'num'], ['taller', 'texto'], ['descripcion', 'texto'],
    ['componenteId', 'texto'], ['galones', 'num'], ['precioGalon', 'num'], ['odometro', 'num'],
    ['tanqueLleno', 'bool'],
  ],
  Documentos: [
    ['id', 'texto'], ['tipo', 'texto'], ['nombre', 'texto'], ['numero', 'texto'], ['entidad', 'texto'],
    ['fechaExpedicion', 'texto'], ['fechaVencimiento', 'texto'], ['valor', 'num'], ['notas', 'texto'],
  ],
  Alertas: [
    ['id', 'texto'], ['titulo', 'texto'], ['detalle', 'texto'], ['tipo', 'texto'],
    ['fechaVencimiento', 'texto'], ['kmVencimiento', 'num'], ['anticipacionDias', 'num'],
    ['activa', 'bool'], ['creada', 'texto'],
  ],
  Talleres: [
    ['id', 'texto'], ['nombre', 'texto'], ['telefono', 'texto'], ['direccion', 'texto'],
    ['especialidad', 'texto'], ['calificacion', 'num'], ['notas', 'texto'],
  ],
  Ordenes: [
    ['id', 'texto'], ['tallerId', 'texto'], ['fecha', 'texto'], ['km', 'num'], ['concepto', 'texto'],
    ['costo', 'num'], ['calificacion', 'num'], ['estado', 'texto'], ['notas', 'texto'],
  ],
  Puntos: [
    ['id', 'texto'], ['fecha', 'texto'], ['motivo', 'texto'], ['puntos', 'num'],
  ],
  Tareas: [
    ['id', 'texto'], ['tipo', 'texto'], ['titulo', 'texto'], ['detalle', 'texto'],
    ['hecho', 'bool'], ['prioridad', 'texto'], ['orden', 'num'],
  ],
  Ajustes: [
    ['clave', 'texto'], ['valor', 'texto'],
  ],
};

const AJUSTES_DEFECTO = {
  nombre: '',
  tema: 'auto',
  ciudad: 'bogota',
  tipoVehiculo: 'moto',
  moneda: 'COP',
  mostrarPuntos: true,
  picoPlacaDigitos: {},
  picoPlacaActivo: true,
};

/* ------------------------------------------------------------------ */
/*  Utilidades                                                         */
/* ------------------------------------------------------------------ */

function abrirHoja_() {
  const id = Hoja_ID_();
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

function Hoja_ID_() {
  if (HOJA_ID) return HOJA_ID;
  const props = PropertiesService.getScriptProperties();
  return (props.getProperty('HOJA_ID') || '').trim();
}

function nombreHojas_() {
  return Object.keys(ESQUEMAS);
}

function texto_(valor) {
  if (valor === null || valor === undefined) return '';
  if (Object.prototype.toString.call(valor) === '[object Date]') {
    return Utilities.formatDate(valor, ZONA, 'yyyy-MM-dd');
  }
  return String(valor).trim();
}

function numero_(valor) {
  if (valor === '' || valor === null || valor === undefined) return 0;
  if (typeof valor === 'number') return valor;
  const limpio = String(valor).replace(/[^\d.,-]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.');
  const n = Number(limpio);
  return isFinite(n) ? n : 0;
}

function booleano_(valor) {
  if (typeof valor === 'boolean') return valor;
  const t = String(valor || '').trim().toLowerCase();
  return ['true', 'verdadero', 'si', 'sí', '1', 'x', 'yes'].indexOf(t) >= 0;
}

function convertir_(valor, tipo) {
  if (tipo === 'num') return numero_(valor);
  if (tipo === 'bool') return booleano_(valor);
  if (tipo === 'json') {
    try {
      return valor ? JSON.parse(String(valor)) : null;
    } catch (e) {
      return null;
    }
  }
  return texto_(valor);
}

function valorCelda_(valor, tipo) {
  if (tipo === 'num') {
    const n = Number(valor);
    return isFinite(n) ? n : '';
  }
  if (tipo === 'bool') return valor === true ? true : false;
  if (tipo === 'json') return valor === null || valor === undefined ? '' : JSON.stringify(valor);
  return valor === null || valor === undefined ? '' : String(valor);
}

function token_(estado) {
  const crudo = JSON.stringify(estado);
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, crudo, Utilities.Charset.UTF_8);
  return digest
    .map(function (b) {
      const v = (b < 0 ? b + 256 : b).toString(16);
      return v.length === 1 ? '0' + v : v;
    })
    .join('');
}

/* ------------------------------------------------------------------ */
/*  Hojas                                                              */
/* ------------------------------------------------------------------ */

function crearHoja_(ss, nombre) {
  const h = ss.insertSheet(nombre);
  const columnas = ESQUEMAS[nombre].map(function (c) {
    return c[0];
  });
  h.getRange(1, 1, 1, columnas.length).setValues([columnas]);
  h.setFrozenRows(1);
  h.getRange(1, 1, 1, columnas.length).setFontWeight('bold').setBackground('#f3f4f6');
  h.setColumnWidths(1, columnas.length, 140);
  return h;
}

/** Garantiza que existan todas las pestañas con sus cabeceras. Nunca borra datos. */
function asegurarHojas_(ss) {
  nombreHojas_().forEach(function (nombre) {
    let h = ss.getSheetByName(nombre);
    if (!h) {
      h = crearHoja_(ss, nombre);
      return;
    }
    const ancho = ESQUEMAS[nombre].length;
    const fila1 = h.getRange(1, 1, 1, Math.max(ancho, h.getLastColumn() || ancho)).getValues()[0];
    const vacia = fila1.every(function (v) {
      return texto_(v) === '';
    });
    if (vacia) {
      const columnas = ESQUEMAS[nombre].map(function (c) {
        return c[0];
      });
      h.getRange(1, 1, 1, columnas.length).setValues([columnas]);
      h.setFrozenRows(1);
      h.getRange(1, 1, 1, columnas.length).setFontWeight('bold').setBackground('#f3f4f6');
    }
  });
}

function leerTabla_(ss, nombre) {
  const h = ss.getSheetByName(nombre);
  if (!h || h.getLastRow() < 2) return [];
  const columnas = ESQUEMAS[nombre];
  const rango = h.getRange(1, 1, h.getLastRow(), Math.max(h.getLastColumn(), columnas.length)).getValues();
  const cabecera = rango[0].map(function (c) {
    return texto_(c).toLowerCase();
  });
  const indice = {};
  cabecera.forEach(function (c, i) {
    if (c) indice[c] = i;
  });

  const filas = [];
  for (let r = 1; r < rango.length; r++) {
    const fila = rango[r];
    const vacia = fila.every(function (v) {
      return texto_(v) === '';
    });
    if (vacia) continue;
    const obj = {};
    columnas.forEach(function (par) {
      const clave = par[0];
      const tipo = par[1];
      const i = indice[clave.toLowerCase()];
      obj[clave] = i === undefined ? convertir_('', tipo) : convertir_(fila[i], tipo);
    });
    if (!obj.id) obj.id = 'auto-' + (r + 1) + '-' + token_(JSON.stringify(fila)).slice(0, 6);
    filas.push(obj);
  }
  return filas;
}

function escribirTabla_(ss, nombre, filas) {
  const h = ss.getSheetByName(nombre) || crearHoja_(ss, nombre);
  const columnas = ESQUEMAS[nombre];
  const cabecera = h.getRange(1, 1, 1, columnas.length).getValues()[0].map(texto_);
  const cabeceraOk =
    cabecera.length === columnas.length &&
    columnas.every(function (c, i) {
      return cabecera[i].toLowerCase() === c[0].toLowerCase();
    });
  if (!cabeceraOk) {
    h.getRange(1, 1, 1, columnas.length).setValues([
      columnas.map(function (c) {
        return c[0];
      }),
    ]);
    h.setFrozenRows(1);
    h.getRange(1, 1, 1, columnas.length).setFontWeight('bold').setBackground('#f3f4f6');
  }

  const nuevos = filas.map(function (fila) {
    return columnas.map(function (par) {
      return valorCelda_(fila[par[0]], par[1]);
    });
  });

  const ultima = h.getLastRow();
  const actuales = ultima > 1 ? h.getRange(2, 1, ultima - 1, columnas.length).getValues() : [];
  if (JSON.stringify(actuales) === JSON.stringify(nuevos)) return false;

  if (ultima > 1) h.getRange(2, 1, ultima - 1, columnas.length).clearContent();
  if (nuevos.length) {
    h.getRange(2, 1, nuevos.length, columnas.length).setValues(nuevos);
  }
  return true;
}

/* ------------------------------------------------------------------ */
/*  Estado                                                             */
/* ------------------------------------------------------------------ */

function leerAjustes_(ss) {
  const filas = leerTabla_(ss, 'Ajustes');
  const ajustes = JSON.parse(JSON.stringify(AJUSTES_DEFECTO));
  filas.forEach(function (f) {
    const clave = texto_(f.clave);
    if (!clave) return;
    if (clave === 'picoPlacaDigitos') {
      try {
        ajustes.picoPlacaDigitos = f.valor ? JSON.parse(f.valor) : {};
      } catch (e) {
        ajustes.picoPlacaDigitos = {};
      }
    } else if (clave === 'mostrarPuntos' || clave === 'picoPlacaActivo') {
      ajustes[clave] = booleano_(f.valor);
    } else if (clave in ajustes) {
      ajustes[clave] = texto_(f.valor);
    }
  });
  return ajustes;
}

function escribirAjustes_(ss, ajustes) {
  const filas = Object.keys(AJUSTES_DEFECTO).map(function (clave) {
    const valor = ajustes[clave];
    return {
      clave: clave,
      valor: typeof valor === 'object' ? JSON.stringify(valor) : String(valor),
    };
  });
  escribirTabla_(ss, 'Ajustes', filas);
}

function hojasListas_() {
  return PropertiesService.getScriptProperties().getProperty('HOJAS_OK') === '1';
}

function marcarHojasListas_() {
  PropertiesService.getScriptProperties().setProperty('HOJAS_OK', '1');
}

function leerEstado_() {
  const ss = abrirHoja_();
  if (!hojasListas_()) {
    asegurarHojas_(ss);
    marcarHojasListas_();
  }

  const moto = leerTabla_(ss, 'Moto')[0] || null;
  const vehiculo = moto
    ? {
        id: moto.id || 'moto',
        placa: moto.placa,
        apodo: moto.apodo,
        marca: moto.marca || 'Yamaha',
        linea: moto.linea || 'XTZ 250',
        modelo: moto.modelo,
        color: moto.color,
        cilindraje: moto.cilindraje,
        vin: moto.vin,
        numeroMotor: moto.numeroMotor,
        kmActual: moto.kmActual,
        kmInicial: moto.kmInicial,
        fechaMatricula: moto.fechaMatricula,
        fechaCompra: moto.fechaCompra,
        ciudad: moto.ciudad,
        notas: moto.notas,
        archivado: moto.archivado,
        creado: moto.creado,
      }
    : null;
  const idVehiculo = vehiculo ? vehiculo.id : 'moto';

  const componentes = leerTabla_(ss, 'Plan').map(function (c) {
    return {
      id: c.id,
      vehiculoId: idVehiculo,
      nombre: c.nombre,
      categoria: c.categoria || 'otro',
      intervaloKm: c.intervaloKm,
      intervaloMeses: c.intervaloMeses,
      vidaUtilKm: c.vidaUtilKm,
      costoEstimado: c.costoEstimado,
      ultimoKm: c.ultimoKm,
      ultimaFecha: c.ultimaFecha,
      notas: c.notas,
      activo: c.activo !== false,
      icono: c.icono || c.categoria,
    };
  });

  const mantenimientos = leerTabla_(ss, 'Mantenimientos').map(function (m) {
    const tieneTanqueo = m.galones > 0;
    return {
      id: m.id,
      vehiculoId: idVehiculo,
      fecha: m.fecha,
      km: m.km,
      categoria: m.categoria || 'otro',
      titulo: m.titulo,
      tipo: m.tipo || 'preventivo',
      costo: m.costo,
      taller: m.taller,
      descripcion: m.descripcion,
      componenteId: m.componenteId,
      tanqueo: tieneTanqueo
        ? {
            galones: m.galones,
            precioGalon: m.precioGalon,
            odometro: m.odometro || m.km,
            tanqueLleno: m.tanqueLleno !== false,
          }
        : undefined,
    };
  });

  const documentos = leerTabla_(ss, 'Documentos').map(function (d) {
    return {
      id: d.id,
      vehiculoId: idVehiculo,
      tipo: d.tipo || 'otro',
      nombre: d.nombre,
      numero: d.numero,
      entidad: d.entidad,
      fechaExpedicion: d.fechaExpedicion,
      fechaVencimiento: d.fechaVencimiento,
      valor: d.valor,
      notas: d.notas,
    };
  });

  const alertas = leerTabla_(ss, 'Alertas').map(function (a) {
    return {
      id: a.id,
      vehiculoId: idVehiculo,
      titulo: a.titulo,
      detalle: a.detalle,
      tipo: a.tipo || 'personalizada',
      fechaVencimiento: a.fechaVencimiento,
      kmVencimiento: a.kmVencimiento,
      anticipacionDias: a.anticipacionDias || 7,
      activa: a.activa !== false,
      creada: a.creada,
    };
  });

  const talleres = leerTabla_(ss, 'Talleres').map(function (t) {
    return {
      id: t.id,
      nombre: t.nombre,
      telefono: t.telefono,
      direccion: t.direccion,
      especialidad: t.especialidad,
      calificacion: t.calificacion,
      notas: t.notas,
    };
  });

  const ordenes = leerTabla_(ss, 'Ordenes').map(function (o) {
    return {
      id: o.id,
      vehiculoId: idVehiculo,
      tallerId: o.tallerId,
      fecha: o.fecha,
      km: o.km,
      concepto: o.concepto,
      costo: o.costo,
      calificacion: o.calificacion,
      estado: o.estado || 'abierta',
      notas: o.notas,
    };
  });

  const puntos = leerTabla_(ss, 'Puntos').map(function (p) {
    return { id: p.id, fecha: p.fecha, motivo: p.motivo, puntos: p.puntos };
  });

  const tareas = leerTabla_(ss, 'Tareas').map(function (t) {
    return {
      id: t.id,
      tipo: t.tipo || 'pendiente',
      titulo: t.titulo,
      detalle: t.detalle,
      hecho: t.hecho === true,
      prioridad: t.prioridad || '',
      orden: t.orden,
    };
  });

  return {
    version: 1,
    vehiculo: vehiculo,
    documentos: documentos,
    componentes: componentes,
    mantenimientos: mantenimientos,
    alertas: alertas,
    talleres: talleres,
    ordenes: ordenes,
    puntos: puntos,
    tareas: tareas,
    ajustes: leerAjustes_(ss),
    onboardingCompleto: !!vehiculo,
    esDemo: false,
  };
}

function escribirEstado_(estado) {
  const ss = abrirHoja_();
  asegurarHojas_(ss);
  marcarHojasListas_();

  const v = estado.vehiculo;
  escribirTabla_(ss, 'Moto', v ? [v] : []);

  escribirTabla_(
    ss,
    'Plan',
    (estado.componentes || []).map(function (c) {
      return {
        id: c.id,
        nombre: c.nombre,
        categoria: c.categoria,
        intervaloKm: c.intervaloKm,
        intervaloMeses: c.intervaloMeses,
        vidaUtilKm: c.vidaUtilKm,
        costoEstimado: c.costoEstimado,
        ultimoKm: c.ultimoKm,
        ultimaFecha: c.ultimaFecha,
        notas: c.notas,
        activo: c.activo,
        icono: c.icono,
      };
    }),
  );

  escribirTabla_(
    ss,
    'Mantenimientos',
    (estado.mantenimientos || []).map(function (m) {
      const t = m.tanqueo || {};
      return {
        id: m.id,
        fecha: m.fecha,
        km: m.km,
        categoria: m.categoria,
        titulo: m.titulo,
        tipo: m.tipo,
        costo: m.costo,
        taller: m.taller,
        descripcion: m.descripcion,
        componenteId: m.componenteId,
        galones: t.galones,
        precioGalon: t.precioGalon,
        odometro: t.odometro,
        tanqueLleno: t.tanqueLleno,
      };
    }),
  );

  escribirTabla_(ss, 'Documentos', estado.documentos || []);
  escribirTabla_(ss, 'Alertas', estado.alertas || []);
  escribirTabla_(ss, 'Talleres', estado.talleres || []);
  escribirTabla_(ss, 'Ordenes', estado.ordenes || []);
  escribirTabla_(ss, 'Puntos', estado.puntos || []);
  escribirTabla_(
    ss,
    'Tareas',
    (estado.tareas || []).map(function (t) {
      return {
        id: t.id,
        tipo: t.tipo,
        titulo: t.titulo,
        detalle: t.detalle,
        hecho: t.hecho,
        prioridad: t.prioridad,
        orden: t.orden,
      };
    }),
  );
  escribirAjustes_(ss, estado.ajustes || AJUSTES_DEFECTO);
}

function diagnostico_() {
  const ss = abrirHoja_();
  const hojas = ss.getSheets().map(function (h) {
    const conocida = nombreHojas_().indexOf(h.getName()) >= 0;
    const fila1 = h.getLastColumn() > 0 ? h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0].map(texto_) : [];
    return {
      nombre: h.getName(),
      filas: Math.max(0, h.getLastRow() - 1),
      columnas: fila1,
      esNueva: !conocida,
    };
  });
  return {
    titulo: ss.getName(),
    id: ss.getId(),
    hojas: hojas,
    esperadas: nombreHojas_(),
  };
}
