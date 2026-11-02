# Normativa y trámites de una moto privada de 250 cc en Colombia (Bogotá / Cundinamarca)

**Investigación normativa — vigencia 2025–2026**
Fecha de corte de la verificación: **28 de octubre de 2026**.
Ámbito: motocicleta de **servicio particular**, **250 cc**, matriculada en **Bogotá D.C. o en un municipio de Cundinamarca**.

> **Cómo leer este documento**
> - Todo valor en pesos está en **COP**.
> - Marca **(estimado)** = precio de mercado o cálculo propio no fijado por norma.
> - Marca **(pendiente de confirmación)** = dato no verificado en fuente oficial al cierre.
> - Cada sección termina con una caja **“Regla para calcular el próximo vencimiento”**, pensada para implementarse como función pura en la app.
> - Los textos legales citados provienen de la **Ley 769 de 2002 (Código Nacional de Tránsito, CNT)** y sus modificaciones.

---

## 0. Indicadores base 2026 (los necesita todo el resto del cálculo)

| Indicador | Valor 2026 | Valor 2025 | Fuente |
|---|---|---|---|
| **UVB** (Unidad de Valor Básico) | **$12.110** | $11.552 | Resolución 3488 de 31-dic-2025 (MinHacienda) — [Siigo](https://www.siigo.com/blog/obligaciones-fiscales/uvb-unidad-de-valor-basico/); confirmado en la tabla oficial de comparendos de la SDM |
| **UVT** | $52.374 | $49.799 | [Siigo](https://www.siigo.com/blog/obligaciones-fiscales/uvb-unidad-de-valor-basico/) / [Fasecolda](https://www.fasecolda.com/ramos/soat/tarifas-comerciales/cobertura-por-victima/) |
| **SMMLV** | $1.750.905 (aprox.) | $1.423.500 | [Siigo](https://www.siigo.com/blog/obligaciones-fiscales/uvb-unidad-de-valor-basico/) |
| **SMLDV** (salario mínimo diario) | **$58.364** | $47.450 | [Fasecolda – Cobertura por víctima](https://www.fasecolda.com/ramos/soat/tarifas-comerciales/cobertura-por-victima/) |
| Tasa RUNT incluida en el SOAT | $2.400 | $2.100 | PDF Fasecolda SOAT 2026 / PDF Previsora SOAT 2025 |

**Cambio estructural 2026:** los **comparendos** dejaron de liquidarse en SMLDV y se liquidan en **UVB** (la tabla oficial de la Secretaría Distrital de Movilidad dice literalmente *“Cantidad UVB / VALOR UNIDAD UVB 2026 12.110”*, con fundamento en la Resolución 3488 de 2025). Efecto práctico: el valor nominal de varias multas **bajó** frente a 2025. Ver §6.

---

## 1. SOAT

### 1.1 Tarifas oficiales para motos (tarifa máxima comercial, todo incluido)

La tarifa se compone de: **prima** + **contribución del 52 % a la ADRES** + **tasa RUNT**. Los valores de la tabla ya son el **total a pagar**.

| Código | Categoría | 2025 (total) | **2026 (total)** | Prima 2026 | ADRES 52 % | RUNT |
|---|---|---|---|---|---|---|
| 100 | Ciclomotor | $117.900 | **$124.100** | $80.100 | $41.600 | $2.400 |
| 110 | Motos **< 100 cc** | $243.400 | **$256.200** | $167.000 | $86.800 | $2.400 |
| 120 | Motos **100 – 200 cc** | $326.300 | **$343.300** | $224.300 | $116.600 | $2.400 |
| 130 | Motos **> 200 cc** | $758.300 | **$761.400** | $499.400 | $259.600 | $2.400 |
| 140/150 | Motocarros, tricimotos, cuadriciclos | $367.800 | **$386.900** | $253.000 | $131.500 | $2.400 |

- **Fuente 2026 (oficial):** Fasecolda, *Tarifas máximas comerciales del SOAT 2026* — <https://www.fasecolda.com/wp-content/uploads/Tarifas-SOAT-2026-referencia.pdf> (verificado extrayendo el texto del PDF).
- **Fuente 2025 (oficial):** La Previsora, *Tarifas SOAT vigentes desde el 01-ene-2025*, Circular 020 de 2024 de la Superfinanciera — <https://previsora.gov.co/documents/d/global/tarifas-soat-2025_4-3>
- **Segunda fuente 2026 (prensa):** [RCN / LatinoInsurance](https://boletines.latinoinsurance.com/precios-del-soat-para-las-motos-en-colombia-en-2026?new=6166) — coincide en los cuatro valores.

> ⚠️ **Dato contraintuitivo verificado dos veces:** el rango **> 200 cc casi no subió** de 2025 a 2026 (+0,4 %), mientras los demás subieron ~5 %. No es un error de lectura: la prima 2026 es $499.400 frente a $497.500 en 2025.

### 1.2 ¿Cuánto paga una moto de 250 cc?

Cae en la categoría **130 “Motos más de 200 c.c.”** → **$761.400 en 2026** (vs. $758.300 en 2025).

- **Regla de clasificación** (por cilindraje exacto de la licencia de tránsito):
  `cc <= 100` → 110 · `100 < cc <= 200` → 120 · `cc > 200` → 130.
  El **ciclomotor** (código 100) es una categoría aparte (vehículo de dos ruedas de muy baja cilindrada/velocidad, según la definición reglamentaria del Ministerio de Transporte); una **250 cc nunca** es ciclomotor.

### 1.3 Qué cubre (montos oficiales 2026, por víctima)

Según Fasecolda con base en el Decreto 780 de 2016, modificado por el Decreto 2644 de 2022 — <https://www.fasecolda.com/ramos/soat/tarifas-comerciales/cobertura-por-victima/>:

| Cobertura | Tope legal | Valor 2026 |
|---|---|---|
| Gastos médicos, quirúrgicos, farmacéuticos y hospitalarios | 701,68 SMDLV **o** 263,13 UVT | **$36.749.788** |
| Incapacidad permanente | 180 SMDLV | **$10.505.430** |
| Muerte de la víctima y gastos funerarios | 750 SMDLV | **$43.772.625** |
| Gastos de transporte y movilización de víctimas | 8,77 UVT | **$459.320** |

Notas útiles para la app: cubre a **víctimas** (peatones, pasajeros, el propio conductor), **sin importar la culpa**; no cubre daños materiales ni al vehículo. Los topes siguen atados a **SMLDV y UVT** (no a UVB), por lo que se reajustan cada 1 de enero.

### 1.4 Si no se tiene SOAT

| Concepto | Valor / efecto |
|---|---|
| Comparendo **D.2** — “Conducir sin portar los seguros ordenados por la ley” | **104,55 UVB = $1.266.100** (2026) |
| Medida | **Inmovilización del vehículo** (ordenada en la misma norma) |
| Costos asociados | Grúa + patios (tarifas SDM 2026) + **SOAT nuevo obligatorio** para poder retirar la moto |
| Detección | Agentes de tránsito y **cámaras de fotodetección** que cruzan la placa contra el RUNT |

- Base legal: Ley 769 de 2002, art. 131 literal **D.2** — <http://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=5557>
- Valor: tabla de autoliquidación 2026 de la SDM — <https://www.movilidadbogota.gov.co/sites/default/files/2026-01-03/tabla_autoliquidacion_2026.pdf>
- Contexto de patios/grúa: [Bogotá.gov.co – tarifas de movilidad 2026](https://bogota.gov.co/mi-ciudad/movilidad/tarifas-de-servicios-de-movilidad-y-comparendos-en-bogota-2026)

### 1.5 Cómo se consulta el vencimiento

1. **RUNT – consulta ciudadana** por placa: <https://www.runt.gov.co/consultaCiudadana/> (SOAT, RTM, gravámenes, historial).
2. **Aseguradora emisora** (consulta de póliza por placa).
3. La **fecha de expedición** de la póliza es el dato que manda: el SOAT de vehículo particular dura **1 año exacto**.

> **🟩 Regla para calcular el próximo vencimiento (SOAT)**
> ```
> vencimiento_soat = fecha_expedicion + 1 año      // mismo día y mes
> dias_restantes   = vencimiento_soat - hoy
> alertas: 30, 15, 7, 1 días; y "vencido" si dias_restantes < 0
> ```
> - Si el usuario solo conoce el **mes** de compra, asumir el **día 1** del mes siguiente al mes de expedición es **incorrecto**; usar el peor caso (día 1 del mes reportado) para alertar antes.
> - Si el usuario compró SOAT y aún no aparece en RUNT (demora de carga), guardar `fecha_expedicion` del comprobante y reconciliar con RUNT.
> - Vehículo nuevo: el SOAT se expide al matricular; su vencimiento es a 1 año de esa fecha.

---

## 2. Revisión Técnico-Mecánica y de Emisiones (RTM)

### 2.1 Periodicidad vigente

| Tipo de vehículo | Primera revisión | Posteriores |
|---|---|---|
| **Motocicletas** (incluye ciclomotor, tricimoto, cuadriciclo) | **2 años** después de la fecha de matrícula | **Cada año** |
| Vehículos particulares (carros) | **5 años** después de la matrícula | Cada año |
| Servicio público | 2 años | Cada año |

- **Fuente oficial (actualizada 15-jul-2026):** Secretaría Distrital de Movilidad — <https://www.movilidadbogota.gov.co/preguntas-frecuentes/cada-cuanto-debo-realizar-la-revision-tecnico-mecanica-de-mi-vehiculo>
- Cadena normativa que cita la SDM: **art. 52 Ley 769/2002**, mod. por art. 12 **Ley 1383/2010**, art. 202 **Decreto 019/2012** y **art. 179 Ley 2294/2023** (PND 2022-2026).
- La **Ley 2252 de 2022** también modificó el régimen de RTM; su aplicación quedó reordenada por el art. 179 de la Ley 2294 de 2023. **El texto operativo hoy es el de la tabla anterior** (confirmado en la fuente oficial de la SDM en julio de 2026).
- Los **CDA** para motos deben ser de clase **B** o **D**, habilitados por el Ministerio de Transporte (arts. 11 y 12, Resolución 160 de 2017).
- Los **vehículos eléctricos** tienen **30 % de descuento** en la RTM (Ley 1964 de 2019; Resolución Conjunta 20213040039485 de 2021).

### 2.2 Qué revisan en una moto

Lista de chequeo que aplican los CDA (fuente: [Caracol Radio, 26-feb-2026](https://caracol.com.co/2026/02/26/en-cuanto-quedo-la-tecnomecanica-para-motos-en-2026-valor-segun-antiguedad-incluye-iva-explicamos/), con base en el manual de RTM):

| Bloque | Ítems típicos |
|---|---|
| Identificación | Placa, VIN/motor, licencia de tránsito |
| Frenos | Eficiencia de freno delantero y trasero, fugas, estado de pastillas/guayas |
| Luces y sistema eléctrico | Luz baja/alta, direccionales, stop, posición, bocina, batería |
| Emisiones | **Gases contaminantes (CO, HC)** según tecnología 2T/4T — la “revisión de gases” **está incluida** en la RTM de motos |
| Llantas | Labrado mínimo, presión, desgaste irregular, rin |
| Dirección y suspensión | Holguras, amortiguadores, rodamientos de dirección |
| Espejos retrovisores | Presencia y ajuste (obligatorios, art. 96 CNT) |
| Carrocería y chasis | Estado estructural, fugas de combustible/aceite |
| Seguridad | Guardafangos, cadenilla/transmisión, escape (ruido), elementos de emergencia |
| Documentos | SOAT vigente cargado en RUNT |

### 2.3 Costo en Bogotá (2026)

| Antigüedad | Rango de tarifa |
|---|---|
| 0 – 2 años | $217.781 – $246.890 |
| 3 – 7 años | $218.081 – $247.190 |
| 8 – 16 años | $218.381 – $247.490 |
| 17 años o más | $218.081 – $247.190 |

- **Rango general 2026: $217.781 – $247.490** (aumento ~6 % frente a 2025). Valores **con IVA incluido**, varían por CDA.
- Fuente: [Caracol Radio, 26-feb-2026](https://caracol.com.co/2026/02/26/en-cuanto-quedo-la-tecnomecanica-para-motos-en-2026-valor-segun-antiguedad-incluye-iva-explicamos/).
- Contraste de mercado (CDA privados): [CDA Seikou – tarifas 2026](https://cdaseikou.com/tarifas-revision-tecnomecanica-2026-bogota/), [CDA Tu Revisión](https://cdaturevision.com/). **(estimado: usar $220.000–$250.000 como banda de presupuesto en la app)**

### 2.4 Si se vence la RTM

| Concepto | Valor |
|---|---|
| Infracción **C.35** — “No realizar la revisión técnico-mecánica en el plazo legal establecido […] aun cuando porte los certificados” | **52,28 UVB = $633.200** (2026) |
| Medida | **Inmovilización** |
| Riesgo adicional | El traspaso y otros trámites se bloquean (la VUS exige RTM cargada en RUNT) |

- Base: art. 131 literal **C.35** del CNT; valor en la tabla oficial SDM 2026 (ver §6).

> **🟩 Regla para calcular el próximo vencimiento (RTM)**
> ```
> si (hoy < matriculo + 2 años):
>     proxima_rtm = fecha_matricula + 2 años       // primera revisión
> sino:
>     anio_base   = anio(matricula) + 2
>     proxima_rtm = fecha_matricula + k años, con k = mínimo entero tal que
>                   (matricula + k años) > última_rtm_realizada
>     // en la práctica: última RTM + 1 año, en el mismo día/mes de la matrícula
> alertas: 60, 30, 15, 7 días
> ```
> - **Ojo:** si la moto se matriculó el 15-mar-2024, la primera RTM vence el **15-mar-2026** y las siguientes cada 15 de marzo.
> - Si el usuario no registra la RTM hecha, estimar por matrícula; ofrecer “marcar como realizada” con fecha del certificado.
> - Guardar también `fecha_ultima_rtm` + `cdae` (nombre del CDA) para el historial.

---

## 3. Impuesto vehicular (Bogotá / Cundinamarca)

### 3.1 ¿Están gravadas las motos?

**Depende del cilindraje.** El art. 141 de la **Ley 488 de 1998** exonera expresamente:

> “Las bicicletas, **motonetas, y motocicletas con motor hasta de 125 c.c. de cilindrada**.”

Por lo tanto:

| Cilindraje | ¿Paga impuesto vehicular? |
|---|---|
| Hasta **125 cc** | **NO** (exenta por ley nacional) |
| **Más de 125 cc** (incluye la 250 cc) | **SÍ** |

- Fuente oficial: Gobernación de Cundinamarca, FAQ de impuesto sobre vehículos — <https://estampillas.cundinamarca.gov.co/preguntas-frecuentes/4/impuesto-sobre-vehiculos/> (transcribe el art. 141 de la Ley 488 de 1998).

### 3.2 Tarifas

| Jurisdicción | Tarifa para motos > 125 cc | Notas |
|---|---|---|
| **Cundinamarca** | **1,7 %** del avalúo comercial | 1,5 % base + **0,2 %** del art. 33 de la Ley 2199 de 2022 (Regiotram, región metropolitana Bogotá–Cundinamarca) |
| **Bogotá D.C.** | **1,5 %** (rango de avalúo más bajo) — **(pendiente de confirmación** si Bogotá aplica también el +0,2 % de Regiotram) | La factura oficial es la fuente definitiva |

Rangos de avalúo y tarifas en **Cundinamarca (2026)**, con el incremento del 0,2 %:

| Rango de avalúo comercial | Tarifa |
|---|---|
| Desde $1 hasta $57.349.000 | **1,70 %** |
| Más de $57.349.000 y hasta $129.032.000 | 2,70 % |
| Más de $129.032.000 | 3,70 % |
| Vehículos eléctricos | 1,20 % |
| **Motos de más de 125 cc** | **1,70 %** |

- La **base gravable** es el avalúo comercial fijado cada año por el **Ministerio de Transporte** (resolución de noviembre del año anterior) y consultable en **SIBGA**: <https://web.mintransporte.gov.co/sibga/> · tablas: <https://mintransporte.gov.co/documentos/1035/tablas-2026/>
- Una moto 250 cc de gama media suele tener avalúo en el primer rango → **~1,7 % del avalúo**. Ejemplo: avalúo $10.000.000 → **~$170.000/año** **(estimado)**.

### 3.3 Fechas de pago 2026

| Concepto | **Bogotá D.C.** | **Cundinamarca** |
|---|---|---|
| Factura disponible | Desde el **1-feb-2026** | Desde el **1-ene-2026** (el impuesto se causa el 1 de enero) |
| Descuento **10 %** | Hasta **15-may-2026** | Hasta **31-may-2026** |
| Descuento **5 %** | No aplica | Hasta **31-jul-2026** |
| **Plazo límite sin descuento** | **24-jul-2026** | **(pendiente de confirmación)** — el calendario (Res. 2424 de 24-dic-2025) solo publica los dos plazos con descuento |
| Pago en cuotas | **SPAC**: declaración inicial hasta 12-jun; cuotas 3-jul y 4-sep | No verificado |
| Descuentos por matrícula nueva | No verificado | **50 %** el año siguiente a la matrícula y **20 %** en la vigencia subsiguiente (motos > 125 cc nuevas); híbridos/eléctricos 40 % por 5 años |

Fuentes: [Bogotá – fechas con descuento 2026](https://bogota.gov.co/mi-ciudad/hacienda/cuando-vence-plazo-para-pagar-impuestos-con-descuento-en-bogota-2026) · [Bogotá – pago y SPAC 2026](https://bogota.gov.co/mi-ciudad/hacienda/como-pagar-y-descargar-facturas-de-impuesto-y-vehicular-2026-en-bogota) · [Cundinamarca – FAQ impuesto de vehículos](https://estampillas.cundinamarca.gov.co/preguntas-frecuentes/4/impuesto-sobre-vehiculos/)

### 3.4 Si no se paga

Intereses moratorios cada mes + **sanción por no declarar/declarar extemporáneamente** (hasta el 10 % del impuesto, según el estatuto tributario de cada jurisdicción) **(estimado; verificar tarifa exacta)** y, sobre todo, **bloqueo de trámites**: el traspaso exige paz y salvo de impuesto vehicular verificado en la Secretaría de Hacienda ([VUS – traspaso](https://www.ventanillamovilidad.com.co/tramites/traspaso-propiedad)). No hay inmovilización directa por impuesto, pero sí riesgo de cobro coactivo y de que el vendedor siga figurando como propietario.

> **🟩 Regla para calcular el próximo vencimiento (impuesto vehicular)**
> ```
> si (cc <= 125):  no_aplica                    // exención Ley 488/1998 art. 141
> sino:
>   causacion   = 1 de enero de cada año
>   alerta_10   = 15-may  (Bogotá) | 31-may (Cundinamarca)
>   alerta_lim  = 24-jul  (Bogotá) | (pendiente Cundinamarca)
>   valor       = avaluo_comercial * 0.015   (Bogotá, rango bajo)
>                 avaluo_comercial * 0.017   (Cundinamarca / Regiotram)
> ```
> - La app no puede calcular el avalúo: pedirlo al usuario (aparece en la factura) o dejar que lo ingrese una vez al año.
> - Si `cc <= 125`, mostrar “**Exenta — no causa impuesto vehicular**” y no generar alerta.

---

## 4. Pico y placa para motos en Bogotá

### 4.1 Regla vigente: **las motos NO tienen pico y placa**

| Aspecto | Situación a oct-2026 |
|---|---|
| ¿Aplica a motos? | **No.** La medida del Decreto Distrital 003 de 2023 (mod. Decreto 463 de 2024) cubre **vehículos de servicio particular, taxis, transporte especial y carga > 20 años** |
| Días / horario (para carros) | Lunes a viernes; particulares **6:00–21:00**; taxis y especial desde **5:30**; pares/impares según último dígito |
| Dependencia | Para carros: último dígito de placa + día. **Para motos: no hay restricción por dígito, cilindraje ni tipo** |
| Excepciones | Motos están en la lista de exentos (junto con eléctricos, híbridos, diplomáticos, emergencias, etc.) |

Fuentes:
- SDM, página oficial **Pico y Placa** (actualizada 05-oct-2026): <https://www.movilidadbogota.gov.co/pico-y-placa> — solo publica calendarios y normativa de **particulares, taxis, especial y carga**.
- Verificación independiente: *“Motos: **No aplica**”* en el reporte diario de pico y placa — [Infobae, 7-may-2026](https://www.infobae.com/colombia/2026/05/07/evita-sanciones-en-bogota-consulta-si-puedes-circular-con-tu-vehiculo/).

> **Nota de riesgo para el producto:** en 2025–2026 hubo **debate público** sobre implementar pico y placa para motos en Bogotá, sin norma adoptada al cierre de esta investigación. La app debe tratar esta regla como **configurable por año** y no hardcodear “nunca aplica”.

### 4.2 Pico y Placa Solidario (permiso de pago)

| Duración del permiso | Valor base 2026 |
|---|---|
| 1 día | **$70.294** |
| 1 mes | **$561.808** |
| 6 meses | **$2.809.311** |

- El **valor final** = valor base × factores por **avalúo, modelo, tipo de combustible y municipio de matrícula**. Para vehículos matriculados **fuera de Bogotá** el factor de municipio subió de **1,2 a 1,5**.
- Base normativa: **Resolución 120963 de 2026** de la SDM; ajuste por IPC.
- Fuente: [Bogotá.gov.co, 3-feb-2026](https://bogota.gov.co/mi-ciudad/movilidad/pico-y-placa-solidario-bogota-valores-base-actualizados-2026)
- **Para una moto: no aplica ni es necesario**, porque las motos no están sujetas a pico y placa. El Solidario es un permiso para **vehículos restringidos**. (La app debe mostrar “no requerido” en lugar de ofrecerlo.)

### 4.3 Restricciones que SÍ afectan a las motos en Bogotá

| Medida | Cuándo | Alcance | Multa |
|---|---|---|---|
| **Día sin Carro y sin Moto** | Jornada anual (2026: **jueves 5 de febrero, 5:00–21:00**) | Motos particulares **no circulan**; exceptúan mensajería/domicilios, eléctricas, vigilancia privada, control de emisiones, etc. | **$633.000 + inmovilización** (C.14) |
| **Restricción de parrillero / corredores** | Medidas temporales por eventos (2026: **29-oct a 2-nov**, Halloween: sin parrillero 18:00–06:00 y 19 corredores restringidos 20:00–04:00) | Motos con acompañante y circulación por corredores | **$633.200** (C.14) |
| **Pico y placa regional** | Último día de puentes festivos (9 corredores de entrada) | Regla para **carros** (pares/impares por franjas) | C.14 |

Fuentes: [Día sin Carro y sin Moto 2026](https://bogota.gov.co/mi-ciudad/movilidad/multa-por-transitar-durante-el-dia-sin-carro-y-sin-moto-en-bogota-2026) · [Restricción de parrillero Halloween 2026](https://caracol.com.co/2026/10/28/restriccion-de-parrillero-en-bogota-de-cuantos-smlv-es-la-multa-por-incumplirla-hora-de-inicio/)

### 4.4 Fuera de Bogotá (Cundinamarca)

Al menos **20 municipios** del país tienen pico y placa para motos (por dígito de placa y/o restricción de parrillero), según reporte de prensa de dic-2025 ([Caracol Radio](https://caracol.com.co/2025/12/05/como-quedo-el-pico-y-placa-para-motos-20-municipios-con-restriccion-horario-y-multas-por-incumplirlo/)) — **dato no verificado en fuente oficial**. **No se verificó** el listado específico de municipios cundinamarqueses; **(pendiente de confirmación)** si la app cubre Soacha, Chía, Zipaquirá, Facatativá, etc.

> **🟩 Regla para calcular el próximo vencimiento (pico y placa)**
> ```
> si (ciudad == "Bogotá" && tipo == "moto particular"):
>     restriccion_diaria = NINGUNA
>     alertas = [ "Día sin Carro y sin Moto" (fecha anual publicada por la SDM),
>                 "restricciones temporales de parrillero/corredores" (eventos) ]
> sino:
>     consultar tabla municipal (dato externo, actualizar cada año)
> ```
> - No generar alertas diarias de pico y placa para motos en Bogotá: sería un falso positivo masivo.
> - Sí conviene un aviso anual (“consulta si tu moto tiene pico y placa en tu municipio”) y un aviso por evento.

---

## 5. Trámites y documentos

### 5.1 Documentos del vehículo y del conductor

| Documento | Quién lo expide | Vigencia / renovación |
|---|---|---|
| **Licencia de tránsito** (tarjeta de propiedad) | Organismo de tránsito / RUNT | Permanente; se actualiza en traspaso, cambio de motor/color, prenda |
| **SOAT** | Aseguradora autorizada | 1 año |
| **RTM + emisiones** | CDA clase B o D | Anual (motos, desde el año 2) |
| **Licencia de conducción A2** | Organismo de tránsito / VUS | 10 años (< 60 años), 5 años (60–80), 1 año (> 80) |
| **Impuesto vehicular** (paz y salvo) | Secretaría de Hacienda (Bogotá o Cundinamarca) | Anual |

**Sobre llevar documentos físicos:** el parágrafo del **art. 135 del CNT** obliga a las autoridades a **dar por cumplida** la obligación de portar documento de identidad, licencia de conducción, licencia de tránsito, SOAT y certificado de RTM **mediante consulta en los sistemas de información**, “sin que sea exigible su presentación en físico”.
→ **Recomendación para la app:** modelar la “guantera digital” como *checklist de vigencias*, no como exigencia de papeles físicos.

### 5.2 Licencia de conducción: A1 vs A2

| Categoría | Qué habilita | Edad mínima |
|---|---|---|
| **A1** | Motocicletas y motociclos **hasta 125 cc** | **16 años** cumplidos |
| **A2** | Motocicletas y motociclos **de más de 125 cc** → **la 250 cc exige A2** | **16 años** cumplidos |

- Base legal: **art. 19 del CNT**, modificado por el **art. 7 de la Ley 2251 de 2022**: para vehículos **particulares** se exigen **16 años**; los **18 años** aplican solo a **servicio público**.
- Requisitos: saber leer y escribir; aprobar **exámenes teórico y práctico** (practicados por IES públicas o entidades registradas en RUNT); **certificado de un CEA** registrado en RUNT; **certificado de aptitud física, mental y de coordinación motriz** (IPS o CRC); inscripción en RUNT; paz y salvo de multas.
- **Costo (estimado):** A1 **$600.000–$800.000+**; **A2 $900.000–$1.000.000+** (incluye CEA + CRC + derechos). Fuente: [Caracol Radio, 6-feb-2026](https://caracol.com.co/2026/02/06/que-es-la-licencia-a1-y-a2-diferencias-clave-sobre-las-motos-que-pueden-manejar-y-precios/). Contraste: [Semana – licencia de moto 2026](https://www.semana.com/economia/macroeconomia/articulo/licencia-para-moto-en-colombia-requisitos-costos-y-errores-que-debe-evitar-en-2026/202624/).
- **Vigencia:** art. 22 del CNT (mod. art. 197 del Decreto 019 de 2012) — 10 / 5 / 1 año según edad.

### 5.3 Traspaso (compraventa de usada)

| Ítem | Dato |
|---|---|
| Tarifa del trámite en Bogotá (moto) | **$145.500** + **retefuente del 1 %** sobre el avalúo |
| Dónde | Ventanilla Única de Servicios (VUS) de Bogotá, con cita |
| Requisitos clave | Ambos inscritos en RUNT; **SOAT vigente** en RUNT; **RTM** cargada en RUNT; **paz y salvo de multas** (nacional) de comprador y vendedor; **paz y salvo de impuesto vehicular**; contrato de compraventa con **improntas** (motor/chasis/VIN); formulario de solicitud; cédulas |
| Prenda | Si hay gravamen: **autorización del acreedor** para continuar la prenda o **documento de levantamiento** |
| Riesgo de no traspasar | El vendedor sigue figurando como propietario y responde solidariamente por multas e impuesto. Existe la figura de **“registro a favor del interesado”** para que el comprador legalice el traspaso (vigente hasta el **06-feb-2027**, Res. 20223040045295 de 2022 mod. por Res. 20253040049955 de 2025) |

Fuentes: [VUS – Traspaso de propiedad](https://www.ventanillamovilidad.com.co/tramites/traspaso-propiedad) · [Bogotá.gov.co – cómo hacer el traspaso](https://bogota.gov.co/mi-ciudad/movilidad/vendiste-tu-vehiculo-en-bogota-pasos-para-hacer-el-traspaso)

### 5.4 Prenda y levantamiento, duplicados

| Trámite | Observación |
|---|---|
| **Constitución de prenda** | Se registra en el organismo de tránsito; la hace el acreedor (banco/financiera) o el propietario con el contrato |
| **Levantamiento de prenda** | Requiere **autorización/cancelación del acreedor**; sin ella el traspaso se bloquea. Verificar en RUNT si la moto tiene gravamen **antes** de comprar |
| **Duplicado de licencia de tránsito** | Trámite en VUS/organismo de tránsito (denuncia por pérdida) — **(estimado: $100.000–$150.000; pendiente de confirmar tarifa exacta 2026)** |
| **Duplicado de placas** | VUS; requiere denuncia y pago de elaboración — **(pendiente de confirmación)** |
| **Duplicado de licencia de conducción** | Organismo de tránsito/VUS — **(estimado: ~$100.000)** |

Tarifario oficial de referencia: <https://www.ventanillamovilidad.com.co/tarifas>

### 5.5 ¿Aplica “revisión de gases” a las motos?

**Sí, pero no es un trámite separado:** la **RTM** de motos incluye el componente de **emisiones contaminantes** (la norma la llama “revisión técnico-mecánica **y de emisiones contaminantes**”). No existe un certificado de gases independiente para motos.
Además, la autoridad puede imponer comparendo por **emisiones o ruido** cuando se detecte infracción a las normas ambientales (literal del art. 131 del CNT, grupo E) y hay operativos específicos de **motos ruidosas** en 2026.

> **🟩 Regla para calcular el próximo vencimiento (documentos)**
> ```
> licencia_conduccion: vence = fecha_expedicion + (10|5|1) años según edad al vencer
> traspaso / prenda / duplicados: sin vencimiento periódico -> solo checklist
> ```
> - Alertar la licencia **90 días antes** (renovación exige nuevo examen de aptitud).
> - Si la moto tiene prenda activa en RUNT, mostrar aviso en el flujo de venta.

---

## 6. Multas y comparendos típicos de moto (2026)

### 6.1 Escala de sanciones en UVB (2026)

| Grupo | Equivalencia histórica | UVB 2026 | **Valor 2026** | 50 % (día 1–5, con curso) | 75 % (día 6–20, con curso) |
|---|---|---|---|---|---|
| A | 4 SMLDV | 13,95 | **$168.935** (~$168.900) | $84.450 | $126.675 |
| B | 8 SMLDV | 27,86 | **$337.385** (~$337.400) | $168.700 | $253.050 |
| **C** | 15 SMLDV | 52,28 | **$633.200** | $316.600 | $474.900 |
| **D** | 30 SMLDV | 104,55 | **$1.266.100** | $633.050 | $949.575 |
| E | 45 SMLDV | ~156,8 **(estimado)** | ~**$1.899.000 (estimado)** | — | — |

- Fuente: **Tabla de autoliquidación de infracciones 2026**, SDM — <https://www.movilidadbogota.gov.co/sites/default/files/2026-01-03/tabla_autoliquidacion_2026.pdf> (valores exactos y aproximados verificados en el PDF oficial).
- **Descuentos (art. 136 CNT, mod. art. 205 del Decreto 019 de 2012 y art. 118 del Decreto 2106 de 2019):** **50 %** si se paga dentro de los **5 días** siguientes a la orden de comparendo **con asistencia obligatoria a curso** de normas de tránsito; **75 %** si se paga dentro de los **20 días** siguientes, también con curso; **100 % + intereses** si no se paga en esas oportunidades. (La tabla de la SDM rotula esos plazos como “día 1 a 5 **hábil**” y “día 6 a 20 **hábil**”.)
- **Comparación con 2025** (liquidado en SMLDV, SMLDV 2025 = $47.450): 15 SMLDV = **$711.750**; 30 SMLDV = **$1.423.500**. En 2026 el mismo hecho cuesta **$633.200** y **$1.266.100** respectivamente → **bajaron** por el cambio a UVB.
- **Advertencia municipal:** esta tabla es la de **Bogotá**. Si el organismo de tránsito del municipio aún liquida en SMLDV, los valores serían **15 SMLDV = $875.460** y **30 SMLDV = $1.750.920** (con SMLDV 2026). **Verificar por municipio.**

### 6.2 Infracciones más comunes de una moto

| Código | Conducta | Valor 2026 | Inmovilización |
|---|---|---|---|
| **D.2** | Conducir **sin SOAT** | **$1.266.100** | **Sí** |
| **D.1** | Conducir **sin licencia de conducción** | **$1.266.100** | Sí |
| **C.35** | **RTM vencida** o vehículo sin condiciones técnico-mecánicas/emisiones | **$633.200** | Sí |
| **C.24** | **Conducir motocicleta sin observar las normas del CNT** (comodín: **sin casco**, sin chaleco reflectivo, parrillero sin casco, mal transporte de objetos, espejos) | **$633.200** | Sí (cuando la falta es no usar casco) |
| **C.14** | Transitar por **sitios restringidos u horas prohibidas** (pico y placa, Día sin Carro, restricción de parrillero) | **$633.200** | Sí |
| **C.8** | Transitar **sin dispositivos luminosos** requeridos | **$633.200** | — |
| **B.1 / B.2** | No **portar** la licencia de conducción / portarla vencida | **$337.385** | — |
| **B.3–B.6** | Sin placas, placas adulteradas, una sola placa, placas falsas | **$337.385** | Sí |

- Base legal: art. 131 del CNT, literales citados (texto verificado en el compilado oficial): <http://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=5557>
- **C.24** es la infracción “comodín” del motociclista (arts. 94 y 96 del CNT: casco, chaleco reflectivo, luces encendidas, máximo un parrillero con casco, espejos). El comparendo debe **describir la conducta**, no basta citar el código.
- **Casco:** el art. 94 ordena el uso de casco por conductor y acompañante y dispone que **la no utilización da lugar a la inmovilización del vehículo**.
- **Nota de arnés legal:** el **art. 135** exige datos completos y firma del agente; el **art. 142** da recurso de reposición/apelación; el **art. 136** regula descuentos. Útil si la app muestra “cómo impugnar”.

> **🟩 Regla para calcular el próximo vencimiento (multas)**
> ```
> no hay "vencimiento" de la multa, pero sí CURSO/PAGO con descuento:
> fecha_comparendo + 5 días hábiles  -> 50 %  (requiere curso)
> fecha_comparendo + 20 días hábiles -> 75 %  (requiere curso)
> después: 100 % + intereses
> ```
> - Para la app: mostrar el **valor de la multa según el grupo UVB** y el **timer de descuento** si el usuario registra un comparendo.

---

## 7. SIMIT / RUNT: qué se puede consultar y qué es automatizable

### 7.1 SIMIT (Sistema Integrado de Información sobre las Multas)

- **Qué muestra:** comparendos y multas **por placa y/o por documento**, estado (pendiente/pagada/en cobro coactivo), acuerdos de pago, **paz y salvo**, e historial de infracciones.
- **Acceso:** portal público de la Federación Colombiana de Municipios — <https://fcm.org.co/simit/> (aplicación web; la consulta se resuelve en el navegador y está protegida con verificación tipo captcha).
- **API pública:** **no existe una API pública documentada** de SIMIT para consulta ciudadana masiva al cierre de esta investigación. Las integraciones existen solo vía **convenios institucionales** (organismos de tránsito, entidades) o mediante **proveedores privados**.

### 7.2 RUNT (Registro Único Nacional de Tránsito)

- **Consulta ciudadana por placa:** <https://www.runt.gov.co/consultaCiudadana/> → SOAT, RTM, estado del vehículo, gravámenes, historial de propietarios/trámites (con las limitaciones de **habeas data**: los datos personales del propietario requieren identificación del titular o autorización).
- **API:** el RUNT **sí** tiene servicios REST, pero **restringidos a entidades autorizadas**. Evidencia oficial: *“Manual Técnico para consulta de aseguradoras, servicio REST”* — <https://www.runt.gov.co/sites/default/files/Manual%20T%C3%A9cnico%20para%20consulta%20de%20aseguradoras%20servicio%20REST_v_controlada.pdf> — que describe **SDK-RUNT, modelo de seguridad y credenciales** entregadas por el RUNT a las aseguradoras. No es un API abierta al público ni a emprendedores sin convenio.

### 7.3 ¿Qué es automatizable hoy?

| Vía | Automatizable | Observaciones |
|---|---|---|
| **RUNT consulta ciudadana** (web) | ❌ No de forma fiable | Requiere interacción humana y validaciones; sin API pública |
| **SIMIT** (web) | ❌ No de forma fiable | Captcha/validación en el flujo |
| **API RUNT para aseguradoras** | ✅ Solo con convenio | Requiere credenciales del RUNT y ser entidad autorizada |
| **Proveedores privados** (PlacAPI, Verifik, Apitude y similares) | ✅ Sí, con costo por consulta | Documentan endpoints de “consulta vehicular por placa” y de **SIMIT** (comparendos, acuerdos). Ej.: <https://placapi.com/api-runt-colombia>, <https://placapi.com/api-consulta-vehicular-colombia>, <https://verifik.co/acceso-instantaneo-a-todos-los-registros-de-transito-del-simit-en-colombia/> |
| **Datos del propio usuario** | ✅ Sí | La vía más barata y legal: el usuario ingresa placa, fecha de matrícula, vencimiento del SOAT, avalúo, última RTM |

**Recomendación de producto (para la app):**
1. **Modelo “usuario como fuente de verdad”**: formulario guiado + validación de formato de placa (AAA123 / AAA12B) y cálculo local de vencimientos. Cero dependencia de scraping.
2. **Deep links** a RUNT y SIMIT para que el usuario verifique (abrir en pestaña nueva), mostrando “verificado por el usuario el …”.
3. Si se quiere verificación automática, **contratar API de terceros** con presupuesto por consulta y consentimiento explícito del usuario (Ley 1581 de 2012, habeas data).
4. **No** implementar scraping con captcha: es frágil, viola términos de uso y expone datos personales.

---

## 8. Resumen ejecutivo de valores (2026) para la moto 250 cc en Bogotá

| Obligación | Valor 2026 | Periodicidad | Regla de vencimiento |
|---|---|---|---|
| **SOAT** (> 200 cc) | **$761.400** | Anual | expedición + 1 año |
| **RTM** | **$217.781 – $247.490 (estimado)** | Anual desde el año 2 | matrícula + 2 años, luego +1 año |
| **Impuesto vehicular** (> 125 cc) | **1,5 % (Bogotá) / 1,7 % (Cundinamarca)** del avalúo | Anual | causa 1-ene; 10 % hasta 15-may (Bogotá) / 31-may (Cund.); límite 24-jul (Bogotá) |
| **Pico y placa** | **No aplica a motos** | — | solo eventos (Día sin Carro, parrillero) |
| **Licencia A2** | $900.000–$1.000.000 **(estimado)** | 10 años (< 60) | expedición + 10 años |
| **Multa sin SOAT (D.2)** | **$1.266.100** + inmovilización | Por evento | 50 % en 5 días hábiles con curso |
| **Multa sin RTM (C.35)** | **$633.200** + inmovilización | Por evento | ídem |
| **Multa casco/luces (C.24/C.8)** | **$633.200** | Por evento | ídem |

---

## 9. Anexo: modelo de datos sugerido para el cálculo de vencimientos

```
Vehiculo {
  placa, marca, linea, modelo_anio, cilindraje_cc, tipo_servicio: "particular",
  ciudad_matricula: "Bogotá" | "Cundinamarca" | otro,
  fecha_matricula, avaluo_comercial,
  soat: { aseguradora, numero_poliza, fecha_expedicion, fecha_vencimiento },
  rtm:  { cda, fecha_ultima, fecha_vencimiento, aprobada },
  impuesto: { jurisdiccion, anio_gravable, valor, fecha_pago, paz_y_salvo },
  licencia_conductor: { categoria: "A1"|"A2", fecha_expedicion, fecha_vencimiento },
  prenda: { activa, acreedor },
  restricciones: { pico_y_placa: false, dia_sin_carro: true, parrillero_eventos: true }
}
```

## 10. Pendientes explícitos (para una segunda pasada)

1. **Tarifa exacta del impuesto vehicular en Bogotá** para motos > 125 cc: confirmar si aplica 1,5 % o 1,5 % + 0,2 % Regiotram (leer una factura real de una 250 cc).
2. **Fecha límite sin descuento del impuesto vehicular en Cundinamarca** (Resolución 2424 de 24-dic-2025): la FAQ solo publica los plazos con descuento (31-may y 31-jul).
3. **Tarifas 2026 de duplicados de licencia de tránsito, placas y licencia de conducción** en la VUS (no publicadas en la página consultada).
4. **Listado de municipios de Cundinamarca con pico y placa para motos** (Soacha, Chía, Zipaquirá, Facatativá, etc.).
5. **Valor oficial del grupo E de multas 2026** (no fue legible en el PDF; calculado por proporción ≈ 156,8 UVB).
6. **SOAT 2027**: se conocerá con la Resolución de la Superfinanciera de finales de diciembre de 2026 y el nuevo valor de la UVB (enero 2027).

---

### Fuentes principales (todas consultadas el 28-oct-2026)

| # | Fuente | Uso |
|---|---|---|
| 1 | [Fasecolda – Tarifas máximas SOAT 2026 (PDF)](https://www.fasecolda.com/wp-content/uploads/Tarifas-SOAT-2026-referencia.pdf) | Tarifas SOAT 2026 |
| 2 | [Previsora – Tarifas SOAT 2025 (PDF)](https://previsora.gov.co/documents/d/global/tarifas-soat-2025_4-3) | Tarifas SOAT 2025 |
| 3 | [Fasecolda – Cobertura por víctima](https://www.fasecolda.com/ramos/soat/tarifas-comerciales/cobertura-por-victima/) | Montos de cobertura |
| 4 | [SDM – ¿Cada cuánto debo hacer la RTM?](https://www.movilidadbogota.gov.co/preguntas-frecuentes/cada-cuanto-debo-realizar-la-revision-tecnico-mecanica-de-mi-vehiculo) | Periodicidad RTM |
| 5 | [SDM – Tabla de autoliquidación de infracciones 2026 (PDF)](https://www.movilidadbogota.gov.co/sites/default/files/2026-01-03/tabla_autoliquidacion_2026.pdf) | Valores de multas y UVB |
| 6 | [SDM – Pico y Placa](https://www.movilidadbogota.gov.co/pico-y-placa) | Alcance del pico y placa |
| 7 | [Bogotá.gov.co – Comparendos y tarifas 2026](https://bogota.gov.co/mi-ciudad/movilidad/tarifas-de-servicios-de-movilidad-y-comparendos-en-bogota-2026) | Marco de tarifas 2026 |
| 8 | [Bogotá.gov.co – Pico y Placa Solidario 2026](https://bogota.gov.co/mi-ciudad/movilidad/pico-y-placa-solidario-bogota-valores-base-actualizados-2026) | Valores del permiso |
| 9 | [Bogotá.gov.co – Fechas impuesto vehicular 2026](https://bogota.gov.co/mi-ciudad/hacienda/cuando-vence-plazo-para-pagar-impuestos-con-descuento-en-bogota-2026) | Plazos Bogotá |
| 10 | [Cundinamarca – FAQ impuesto sobre vehículos](https://estampillas.cundinamarca.gov.co/preguntas-frecuentes/4/impuesto-sobre-vehiculos/) | Exención ≤125 cc, tarifas, plazos |
| 11 | [Ley 769 de 2002 (CNT) – texto compilado](http://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=5557) | Literales de multas, licencias, plazos |
| 12 | [VUS – Traspaso de propiedad](https://www.ventanillamovilidad.com.co/tramites/traspaso-propiedad) | Tarifa y requisitos del traspaso |
| 13 | [RUNT – Manual técnico servicio REST](https://www.runt.gov.co/sites/default/files/Manual%20T%C3%A9cnico%20para%20consulta%20de%20aseguradoras%20servicio%20REST_v_controlada.pdf) | API restringida |
| 14 | [SIMIT – portal público](https://fcm.org.co/simit/) | Consulta de multas |
| 15 | [Siigo – UVB 2026](https://www.siigo.com/blog/obligaciones-fiscales/uvb-unidad-de-valor-basico/) | UVB, UVT, SMMLV |
| 16 | [Caracol – Costos RTM motos 2026](https://caracol.com.co/2026/02/26/en-cuanto-quedo-la-tecnomecanica-para-motos-en-2026-valor-segun-antiguedad-incluye-iva-explicamos/) | Precios RTM |
| 17 | [Caracol – Licencia A1/A2 2026](https://caracol.com.co/2026/02/06/que-es-la-licencia-a1-y-a2-diferencias-clave-sobre-las-motos-que-pueden-manejar-y-precios/) | Costos y categorías |
| 18 | [Bogotá.gov.co – Día sin Carro y sin Moto 2026](https://bogota.gov.co/mi-ciudad/movilidad/multa-por-transitar-durante-el-dia-sin-carro-y-sin-moto-en-bogota-2026) | Restricción anual y multa |
