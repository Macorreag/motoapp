# Yamaha XTZ 250 (Colombia, 2016–2025) — plan de mantenimiento real y verificable

**Fecha del relevamiento:** 28–29 de octubre de 2026
**Objeto:** datos semilla de mantenimiento preventivo para la app MotoApp (uso personal, una XTZ 250 en Bogotá).
**Convención:** cada afirmación lleva la fuente entre corchetes (`[S3]`) o va marcada como **(estimado)** cuando es un rango de mercado sin documento público que lo fije. La lista de fuentes está al final (§9).

---

## 0. Resumen ejecutivo (lo que hay que saber antes de leer las tablas)

| # | Hallazgo | Implicación para la app |
|---|---|---|
| 1 | **El intervalo oficial NO es 3.000 km: es 5.000 km.** El manual Yamaha imprime las columnas como `1000 km (600 mi) · 5000 km (3000 mi) · 10000 km (6000 mi) · 15000 km (9000 mi) · 20000 km (12000 mi)` [S3]. El "3.000" que repiten los talleres colombianos son **millas**, no kilómetros. | Sembrar `intervalo_km: 5000` para aceite, no 3000. |
| 2 | La segunda regla es **tiempo**: "las comprobaciones deben efectuarse cada 6 meses, salvo si en su lugar se realiza un mantenimiento basado en el kilometraje" [S3]. | El motor de alertas debe disparar por **km o por 6 meses, lo que ocurra primero**. |
| 3 | El **filtro de aceite se cambia cada 10.000 km** (1.000 / 10.000 / 20.000), no en cada cambio de aceite [S3]. | No fusionar aceite+filtro en un solo ítem. |
| 4 | **Bujía**: revisar/limpiar en cada servicio, **cambiar a los 10.000 y 20.000 km** [S3]. | Ítem propio con intervalo 10.000. |
| 5 | **Filtro de aire**: limpiar a los 5.000 y 15.000; **cambiar a los 10.000 y 20.000** [S3]. | Ítem con doble operación (limpieza ≠ cambio). |
| 6 | **Cadena**: revisar y lubricar **cada 500 km** (y después de lavar o rodar con lluvia) [S3]. Es el ítem de mayor frecuencia del plan y el que más fallas evita. | Alerta de cadena cada 500 km, independiente del servicio. |
| 7 | **Líquido de frenos cada 2 años; tubo de freno cada 4 años** (por tiempo, no por km) [S3]. | Ítems solo-tiempo (`intervalo_km: null`). |
| 8 | Los datos del manual del propietario son de la versión **XTZ250 ABS de inyección (código de manual B8L-F8199-S0)** [S3], que es la que se vende en Colombia desde ~2021. Para la versión carburada (2016–2020) el motor es el mismo 249 cc SOHC y el plan es equivalente. | Un solo plan cubre ambas generaciones, con notas. |

---

## 1. Ficha técnica

### 1.1 Motor y tren motriz

| Dato | Valor | Fuente |
|---|---|---|
| Motor | Monocilíndrico 4T, SOHC, 2 válvulas, refrigerado por aire **+ enfriador de aceite** (radiador de 3 filas) | [S1][S2][S3] |
| Cilindrada | 249 cc | [S1][S3] |
| Diámetro × carrera | 74,0 × 58,0 mm | [S1][S3] |
| Relación de compresión | 9,8 : 1 | [S1][S3] |
| Potencia máxima | **20,4 HP a 8.000 rpm** | [S1] |
| Torque máximo | **20,5 N·m a 6.500 rpm** | [S1] |
| Alimentación | Inyección electrónica (cuerpo de acelerador 4B43); las 2016–2020 usaban carburador Mikuni | [S1][S3][S4] |
| Encendido | TCI | [S1][S3] |
| Arranque | Eléctrico | [S1][S3] |
| Lubricación | Cárter húmedo, bomba trocoidal | [S1][S4] |
| Ralentí especificado | 1.300 – 1.500 rpm | [S4] |
| Transmisión | 5 velocidades (2,571 / 1,684 / 1,273 / 1,040 / 0,852) | [S1][S3] |
| Transmisión final | Cadena; relación **40/13 = 3,077** | [S1] |
| Embrague | Multidisco en baño de aceite | [S1][S3] |

### 1.2 Dimensiones, pesos y capacidad

| Dato | Valor | Fuente |
|---|---|---|
| Largo × ancho × alto | 2.150 × 820 × 1.210 mm | [S1][S3] |
| Altura al asiento | 875 mm | [S1] |
| Distancia entre ejes | 1.385 mm | [S1][S3] |
| Altura mínima al suelo | 270 mm | [S1] |
| Peso en orden de marcha | **151 kg** (ficha Yamaha Colombia) / **152 kg** (manual y ficha Yamaha Argentina) | [S1] vs [S2][S3] |
| Carga máxima | 157 kg (piloto + pasajero + equipaje) | [S3] |
| Tanque de combustible | **13,6 L** (manual) / **14 L** (ficha comercial) | [S3] vs [S1][S2] |
| Reserva | 3,7 L | [S3] |
| Gasolina | Sin plomo, RON 90 (E10 aceptable) | [S3] |

> **Discrepancia a resolver en el seed:** el manual de propietario declara 13,6 L y la ficha de venta 14 L. Usar **14 L** como dato comercial y **13,6 L / reserva 3,7 L** como dato técnico.

### 1.3 Aceite de motor

| Dato | Valor | Fuente |
|---|---|---|
| Viscosidad | **SAE 10W-40** | [S3] |
| Calidad | **API SG o superior, JASO MA** | [S3] |
| Capacidad con cambio de aceite (sin filtro) | **1,35 L** | [S3][S4] |
| Capacidad con cambio de aceite **y filtro** | **1,45 L** | [S3][S4] |
| Capacidad total (motor seco / reparación) | 1,55 L | [S4] |
| Filtro de aceite | Cartucho de papel, ref. Yamaha **38B-E3440-00-00** | [S4][S5] |
| Aceite de la versión carburada (2016–2020) | El manual de taller especifica **Yamalube 4T 20W-50 API SH o superior** | [S4] |
| Aceite de horquilla | 10W o equivalente, **541 cc** por barra, nivel 134 mm | [S4] |

> **Nota de compatibilidad:** el manual de la versión de inyección (B8L) pide 10W-40 JASO MA; el manual de taller de la versión carburada (4B41) dice 20W-50 API SH. En Colombia se consigue Yamalube 10W-40 y 20W-50; **para la versión FI usar 10W-40 JASO MA/MA2**. Cualquier aceite 10W-40 o 20W-50 **JASO MA/MA2** es válido; no usar aceites "Energy Conserving" (API SP con friction modifiers) por el embrague húmedo.

### 1.4 Encendido, batería y bujía

| Dato | Valor | Fuente |
|---|---|---|
| Bujía | **NGK DR8EA** | [S3][S4] |
| Separación de electrodos | **0,6 – 0,7 mm** | [S3][S4] |
| Par de apriete de bujía | 18 N·m | [S3] |
| Batería | **XTZ7L, 12 V, 6 Ah (10 HR)**, VRLA (libre de mantenimiento) | [S1][S3][S4] |

> No confundir con la ficha de sitios genéricos: hay webs que listan "NGK CPR8EA-9, gap 0,8 mm" para la XTZ 250 [S15]; **el manual Yamaha dice DR8EA / 0,6–0,7 mm** [S3][S4]. La referencia CPR8EA-9 corresponde a otros motores Yamaha.

### 1.5 Llantas, frenos y suspensión

| Dato | Valor | Fuente |
|---|---|---|
| Llanta delantera | **80/90-21 M/C 48S**, con cámara | [S1][S3] |
| Llanta trasera | **120/80-18 M/C 62S**, con cámara | [S1][S3] |
| Modelo de fábrica | Metzeler Tourance (enduro mixto) | [S3] |
| Presión **1 persona** | Delantera **125 kPa (1,25 kgf/cm², 18 psi)** · Trasera **150 kPa (1,50 kgf/cm², 22 psi)** | [S3] |
| Presión **2 personas** | Delantera **150 kPa (1,50 kgf/cm², 22 psi)** · Trasera **200 kPa (2,00 kgf/cm², 29 psi)** | [S3] |
| Freno delantero | Disco **245 × 3,5 mm**, pinza de 2 pistones, **ABS monocanal** | [S1][S2][S3] |
| Freno trasero | Disco **203 × 4,5 mm**, pinza de 1 pistón | [S1][S2][S3] |
| Líquido de frenos | **DOT 4** | [S3][S4] |
| Suspensión delantera | Horquilla telescópica de 41 mm, recorrido **220 mm** | [S1][S3] |
| Suspensión trasera | Basculante con bieletas (monocross), recorrido **205 mm** | [S1][S3] |

### 1.6 Cadena y kit de arrastre

| Dato | Valor | Fuente |
|---|---|---|
| Holgura de cadena | **30–40 mm** (versión FI/ABS) · 25–35 mm en el manual de taller de la carburada | [S3] vs [S4] |
| Paso / eslabones (OEM) | **428, 130 eslabones** (especificación del manual de taller: "428V / DAIDO, 130") | [S4] |
| Piñón / catalina | **13 / 40 dientes** (relación 3,077) | [S1] |
| Conversión aftermarket vendida en Colombia | Kit **13/40 con cadena 520H × 122 eslabones** (Nitrox) | [S6] |
| Par de apriete tuerca de eje trasero | 46 N·m (contratuerca del tensor: 15 N·m) | [S3] |

> **Ojo:** la versión brasileña (Lander 250) salió con 15/46 y cadena 428 × 130 [S4]; la **XTZ 250 colombiana usa 13/40** [S1]. Por eso los kits "Lander" brasileños no sirven. El kit correcto en Colombia es **13/40** y, según el fabricante del kit, cadena **520H × 122** (paso 5/8") o **428 × 130** si se conserva el paso original.

### 1.7 Rendimiento real reportado

| Fuente | Consumo | Equivalencia |
|---|---|---|
| Prueba en Colombia (demotos, XTZ 250 FI) | **125 km/galón** | ≈ 33,0 km/L |
| Prueba en Brasil (autoesporte, Lander 2019 ABS) | **29,9 km/L** | ≈ 113 km/gal |
| Ficha de usados (webmotors, Ténéré 250) | **27 km/L** | ≈ 102 km/gal |
| **Rango para la app** | — | **28–33 km/L · 105–125 km/gal** |

> Las tres cifras son de pruebas de prensa, no de normativa. Para Bogotá (tráfico, 2.600 m) el valor bajo del rango es el realista: **~28–30 km/L (~105–113 km/gal)**.

---

## 2. Plan de mantenimiento periódico oficial

**Fuente primaria:** *Manual del propietario XTZ250 ABS*, Yamaha, código **B8L-F8199-S0**, sección 6 "Mantenimiento y ajustes periódicos", págs. 6-2 a 6-6 (PDF: págs. 37–41) [S3].

**Reglas del propio manual** [S3]:

- Columnas: **1.000 km (primer servicio) · 5.000 · 10.000 · 15.000 · 20.000** y **cada 6 meses**.
- "Las comprobaciones deben efectuarse **cada 6 meses**, salvo si en su lugar se realiza un mantenimiento basado en el kilometraje."
- "A partir de los 15.000 km, repita los intervalos de mantenimiento desde el de los 5.000 km."
- Las operaciones marcadas con **asterisco (\*)** debe realizarlas un concesionario Yamaha.
- "Según la meteorología, el terreno, el área geográfica y las condiciones particulares de uso, puede ser necesario **acortar** los intervalos."

### 2.1 Tabla consolidada (✓ = se ejecuta)

| Sistema / ítem | Operación | 1.000 | 5.000 | 10.000 | 15.000 | 20.000 | 6 meses | Notas |
|---|---|:--:|:--:|:--:|:--:|:--:|:--:|---|
| **Aceite de motor** | Cambiar + comprobar nivel y fugas | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 1,35 L (1,45 L con filtro) |
| **Filtro de aceite** | Cambiar cartucho | ✓ | – | ✓ | – | ✓ | – | Cada 10.000 km |
| **Filtro de aire** | Limpiar (espuma, aceite de filtro) | – | ✓ | – | ✓ | – | – | Cada 5.000 / 15.000 |
| **Filtro de aire** | **Cambiar** | – | – | ✓ | – | ✓ | – | Cada 10.000 km |
| **Bujía** | Comprobar estado / limpiar / ajustar gap 0,6–0,7 mm | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | En cada servicio |
| **Bujía** | **Cambiar** | – | – | ✓ | – | ✓ | – | Cada 10.000 km |
| **Válvulas** | Comprobar holgura **y ajustar** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Motor frío; en concesionario |
| **Inyección** | Ajustar ralentí (1.300–1.500 rpm) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | En cada servicio |
| **Línea de combustible** | Comprobar agrietamiento / fugas | – | ✓ | ✓ | ✓ | ✓ | ✓ | |
| **Silenciador y tubo de escape** | Comprobar apriete de abrazaderas | – | ✓ | ✓ | ✓ | ✓ | ✓ | |
| **Embrague** | Comprobar funcionamiento y ajustar juego | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| **Freno delantero** | Comprobar funcionamiento, nivel de líquido y fugas | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| **Freno trasero** | Comprobar funcionamiento, nivel de líquido y fugas | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| **Pastillas de freno (del. y tras.)** | Cambiar | al límite | al límite | al límite | al límite | al límite | al límite | "Siempre que lleguen al límite de desgaste" |
| **Tubo de freno** | Comprobar agrietamiento, posición y fijación | – | ✓ | ✓ | ✓ | ✓ | ✓ | |
| **Tubo de freno** | **Cambiar** | — | — | — | — | — | — | **Cada 4 años** (tiempo) |
| **Líquido de frenos** | **Cambiar (DOT 4)** | — | — | — | — | — | — | **Cada 2 años** (tiempo) |
| **Ruedas** | Comprobar descentrado, daños y apriete de radios | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Rines de radios |
| **Neumáticos** | Presión, profundidad de dibujo, daños | – | ✓ | ✓ | ✓ | ✓ | ✓ | Presión antes de cada uso |
| **Cojinetes de rueda** | Comprobar flojedad / daño | – | ✓ | ✓ | ✓ | ✓ | ✓ | |
| **Basculante** | Comprobar juego | – | ✓ | ✓ | ✓ | – | – | |
| **Basculante** | Lubricar (grasa de litio) | — | — | ✓ | — | ✓ | — | Cada 10.000 km |
| **Cadena de transmisión** | Comprobar holgura (30–40 mm), alineación y estado; **ajustar y lubricar** | **cada 500 km** y después de lavar / lluvia / polvo | | | | | | Ítem de mayor frecuencia |
| **Cojinetes de dirección** | Comprobar juego / dureza | ✓ | ✓ | ✓ | ✓ | ✓ | – | |
| **Cojinetes de dirección** | Lubricar (grasa de litio) | — | — | ✓ | — | ✓ | — | Cada 10.000 km |
| **Fijaciones del bastidor** | Comprobar apriete de tuercas, pernos y tornillos | – | ✓ | ✓ | ✓ | ✓ | ✓ | |
| **Eje pivote maneta de freno** | Lubricar (grasa de silicona) | – | ✓ | ✓ | ✓ | ✓ | ✓ | |
| **Eje pivote pedal de freno** | Lubricar (grasa de litio) | – | ✓ | ✓ | ✓ | ✓ | ✓ | |
| **Eje pivote maneta de embrague** | Lubricar (grasa de litio) | – | ✓ | ✓ | ✓ | ✓ | ✓ | |
| **Caballete lateral** | Comprobar funcionamiento y lubricar | – | ✓ | ✓ | ✓ | ✓ | ✓ | |
| **Interruptor del caballete lateral** | Comprobar funcionamiento | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Corte de encendido |
| **Horquilla delantera** | Comprobar funcionamiento y fugas de aceite | – | ✓ | ✓ | ✓ | ✓ | ✓ | |
| **Conjunto amortiguador trasero** | Comprobar funcionamiento y fugas | – | ✓ | ✓ | ✓ | ✓ | ✓ | |
| **Pivotes de bieletas / brazo de relé** | Comprobar funcionamiento | – | ✓ | ✓ | ✓ | – | – | |
| **Pivotes de bieletas / brazo de relé** | Lubricar | – | – | ✓ | – | ✓ | – | Cada 10.000 km |
| **Interruptores de freno (del. y tras.)** | Comprobar funcionamiento | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| **Piezas móviles y cables** | Lubricar | – | ✓ | ✓ | ✓ | ✓ | ✓ | Cable de embrague/acelerador |
| **Refrigerante** | — | — | — | — | — | — | — | **No aplica**: refrigeración por aire + enfriador de aceite |
| **Sincronización** | — | — | — | — | — | — | — | **No aplica**: monocilíndrico, un solo cuerpo de acelerador |

### 2.2 Primer servicio (1.000 km) — lo que realmente se hace

Además de la tabla, en el primer servicio se debe [S3]:

1. **Cambiar aceite y filtro de aceite** (el filtro sí se cambia a los 1.000 km).
2. Revisar y ajustar **holgura de válvulas** (asentamiento inicial).
3. Revisar **ralentí** y sincronizar la inyección.
4. **Reapretar** fijaciones del bastidor y revisar torque de ejes.
5. Comprobar **tensión y lubricación de cadena** (se estira mucho en los primeros 1.000 km).
6. Comprobar frenos, niveles y fugas.
7. El manual exige el **periodo de asentamiento 0–1.000 km**: 0–150 km sin pasar de 5.000 rpm; 150–500 km sin pasar de 6.000 rpm; 500–1.000 km sin pasar de 7.500 rpm; variar el régimen [S3].

### 2.3 Chequeo diario / antes de cada uso (manual §6) [S3]

- Nivel de aceite de motor.
- Presión de llantas **en frío**.
- Funcionamiento de frenos (si el tacto es "esponjoso" → taller).
- Juego del puño del acelerador y de la maneta de embrague.
- Luces, intermitentes, bocina, luz de freno.
- Cadena: holgura y lubricación.
- Interruptor del caballete lateral (corte de encendido).

---

## 3. Vida útil esperada de componentes de desgaste

Rangos **mín / típico / máx**. "Oficial" = lo fija el manual; "campo" = práctica de talleres y foros; "estimado" = deducción por diseño y uso.

| Componente | Unidad | Mín | **Típico** | Máx | Base del dato |
|---|---|---|---|---|---|
| Aceite de motor | km | 3.000 | **5.000** | 7.000 | **Oficial 5.000 km / 6 meses** [S3]; 3.000–4.000 en urbano severo |
| Aceite de motor | meses | 4 | **6** | 12 | Oficial [S3] |
| Filtro de aceite | km | 8.000 | **10.000** | 15.000 | **Oficial 10.000** [S3] |
| Filtro de aire (limpieza) | km | 2.500 | **5.000** | 5.000 | Oficial 5.000 [S3]; 2.500–3.000 en polvo |
| Filtro de aire (cambio) | km | 8.000 | **10.000** | 20.000 | Oficial 10.000 [S3] |
| Bujía | km | 6.000 | **10.000** | 15.000 | Oficial 10.000 [S3]; campo 8.000–12.000 |
| Holgura de válvulas (revisión) | km | 5.000 | **10.000** | 10.000 | Oficial: cada servicio [S3]; en la práctica 10.000 si no hay síntomas |
| Kit de arrastre (cadena + piñón + catalina) | km | 15.000 | **25.000** | 35.000 | Campo (el manual no fija intervalo, solo lubricación cada 500 km) [S3] |
| Cadena sola (con buen mantenimiento) | km | 15.000 | **20.000** | 30.000 | Campo |
| Pastillas de freno delanteras | km | 8.000 | **15.000** | 22.000 | Campo (uso urbano castiga más) |
| Pastillas de freno traseras | km | 10.000 | **18.000** | 25.000 | Campo |
| Llanta delantera (80/90-21) | km | 12.000 | **18.000** | 25.000 | Campo; mixto destapado baja a 10.000–12.000 |
| Llanta trasera (120/80-18) | km | 10.000 | **15.000** | 22.000 | Campo; mixto destapado baja a 8.000–10.000 |
| Líquido de frenos | meses | 24 | **24** | 36 | **Oficial cada 2 años** [S3] |
| Tubo de freno | meses | 48 | **48** | 60 | **Oficial cada 4 años** [S3] |
| Batería (VRLA 6 Ah) | meses | 24 | **36** | 48 | Campo (2–4 años en clima frío de Bogotá) |
| Retenes de horquilla | km | 15.000 | **30.000** | 45.000 | Estimado; antes si hay polvo/óxido |
| Aceite de horquilla | km | 15.000 | **20.000** | 25.000 | Estimado (el manual no lo fija) |
| Amortiguador trasero (reparación/recambio) | km | 25.000 | **40.000** | 60.000 | Estimado |
| Rodamientos de dirección (lubricación) | km | 10.000 | **10.000** | 20.000 | **Oficial cada 10.000** [S3] |
| Cables de embrague / acelerador | km | 12.000 | **20.000** | 30.000 | Estimado; se lubrican en cada servicio |
| Correa/kit de arrastre — piñón solo | km | 10.000 | **15.000** | 20.000 | Campo (se desgasta antes que la catalina) |

---

## 4. Fallas y problemas conocidos en Colombia

> **Advertencia de honestidad:** la XTZ 250 es un modelo de fama "indestructible" y **no hay un patrón documentado de fallas graves en fuentes primarias** (no encontramos recalls ni boletines Yamaha para este modelo en Colombia). Lo que sigue combina (a) advertencias textuales del manual, (b) desgaste geométrico esperable y (c) reportes de foros/talleres **sin confirmación documental**, señalados como tales.

| # | Falla / síntoma | Causa raíz | ¿Qué mantenimiento la previene? | Evidencia |
|---|---|---|---|---|
| 1 | **Cadena estirada, salta dientes, desgaste de piñón/catalina** | Falta de lubricación y holgura mal ajustada. El manual lo dice literalmente: "la cadena debe limpiarse y engrasarse según los intervalos… ya que de lo contrario **se desgastará rápidamente**, especialmente si hay mucha humedad o polvo" [S3] | Lubricar y revisar **cada 500 km**; holgura 30–40 mm; limpiar con queroseno y grasa para juntas tóricas | Manual [S3] |
| 2 | **Motor ruidoso, ralentí inestable, arranque difícil, pérdida de potencia** | Holgura de válvulas fuera de especificación ("el desajuste de las válvulas puede ocasionar una mezcla inadecuada, **ruido del motor** y, en última instancia, **dañar el motor**") [S3] | Revisar/ajustar válvulas cada 5.000–10.000 km, con motor frío | Manual [S3] |
| 3 | **Consumo de aceite / nivel bajo y motor fundido** | Uso a altas rpm sostenidas, aceite degradado, nivel no revisado | Revisar nivel antes de cada uso; cambiar 5.000 km/6 meses; en Bogotá 3.000–4.000 km | Manual (nivel antes de cada uso) [S3] |
| 4 | **Sobrecalentamiento en tráfico** | El motor es **refrigerado por aire**, con enfriador de aceite de 3 filas; en tráfico lento no hay flujo de aire | Aceite en buen estado y de la viscosidad correcta; no dejar el motor al ralenti largos periodos; limpiar aletas del cilindro y radiador de aceite | Manual/ficha [S1][S3] |
| 5 | **Fugas en la horquilla (retenes)** | Polvo y barro de Bogotá + sellos que se resecan | Revisar fugas en cada servicio [S3]; limpiar sellos; cambiar retenes 15.000–30.000 km | Manual (revisión cada servicio) [S3] |
| 6 | **Amortiguador trasero con fuga** | Bieletas sin lubricar, uso con pasajero y carga | Lubricar pivotes de bieletas cada 10.000 km [S3]; revisar fugas en cada servicio | Manual [S3] |
| 7 | **Frenos esponjosos / pérdida de frenada** | Líquido DOT 4 higroscópico (absorbe agua) | **Cambiar cada 2 años**; revisar nivel y fugas en cada servicio [S3] | Manual [S3] |
| 8 | **Cortes de encendido a ~4.000 rpm** (reportado en foro colombiano, XTZ 250 2013 con 89.000 km) | Bujía desgastada / filtro sucio (respuesta del foro). Sin diagnóstico confirmado | Cambiar bujía cada 10.000; limpiar/cambiar filtro de aire | Foro [S16] (débil) |
| 9 | **Batería que no carga (regulador/estator)** | Falla del regulador-rectificador o del estator, típica de la familia Yamaha 250 brasileña | Verificar voltaje de carga (~14,1–14,8 V a 3.000 rpm) en cada servicio; no dejar la moto meses sin uso | **Sin fuente primaria**; reportes de talleres/foros brasileños (marcar como no verificado) |
| 10 | **Cables de embrague/acelerador que se rompen o se agarrotan** | Falta de lubricación y polvo | Lubricar piezas móviles y cables en cada servicio [S3]; cambiar 20.000–30.000 km | Manual [S3] |
| 11 | **Tornillos y fijaciones flojas (vibración de monocilíndrico)** | Vibración característica | Reapretar fijaciones del bastidor cada 5.000 km [S3]; usar frenatodo medio | Manual [S3] |

**Fallas que NO están documentadas para este modelo** (y que por tanto no deben sembrarse como "conocidas"): fallo de bomba de aceite, desgaste prematuro de la culata, problemas de inyectores. El manual solo incluye la **comprobación de presión de aceite** por el tornillo de purga como chequeo de diagnóstico [S3], no como falla recurrente.

---

## 5. Costos típicos en Colombia (COP, 2025–2026)

Precios de **repuestos oficiales**: catálogo de la tienda oficial de Auteco/Incolmotos Yamaha (distribuidor Yamaha en Colombia) [S6]. Mano de obra: tarifas de taller/concesionario publicadas o **(estimado)**.

| Ítem | Rango COP | Fuente | Estado |
|---|---|---|---|
| **Cambio de aceite + filtro (con mano de obra)** | **$62.000** (promoción concesionario) – **$110.000** (tarifa normal) | Concesionario Yamaha Yamamotos [S7] | Verificado |
| Aceite 10W-40 JASO MA (1 L) | $35.000 – $55.000 | Mercado | (estimado) |
| Filtro de aceite (38B-E3440-00-00) | **$5.227** – $25.000 | Auteco [S6] | Verificado (repuesto) |
| Filtro de aire (espuma, FAI-1014) | **$11.730** – $30.000 | Auteco [S6] | Verificado |
| Bujía NGK DR8EA | **$14.800** – $25.000 | Auteco [S6] | Verificado |
| **Kit de arrastre completo 13/40 (Nitrox 520H-122)** | **$96.687** (oficial) – $199.499 (aftermarket) – $608.000 (Regina premium Z-ring) | Auteco [S6], MercadoLibre [S8][S9] | Verificado (repuesto) |
| Mano de obra instalación kit de arrastre | $40.000 – $80.000 | Talleres | (estimado) |
| Pastillas de freno delanteras | **$10.455** – $35.000 | Auteco (Nitrox-5) [S6] | Verificado |
| Pastillas de freno traseras | $10.327 – $35.000 | Auteco [S6] | Verificado |
| Mano de obra pastillas (por eje) | $20.000 – $40.000 | Talleres | (estimado) |
| Líquido de frenos DOT 4 (500 ml) | **$32.900** | Auteco [S6] | Verificado |
| Mano de obra cambio de líquido de frenos | $20.000 – $40.000 | Talleres | (estimado) |
| Llanta delantera 80/90-21 | **$227.757** (Pirelli MT70) – $277.567 (Pirelli MT60 90/90-21) | Auteco [S6] | Verificado |
| Llanta trasera 120/80-18 | **$382.500** (Metzeler Tourance) – $514.800 | American Motos [S10], Virtual Llantas [S11] | Verificado |
| Montaje + balanceo (por llanta) | $15.000 – $35.000 | Talleres | (estimado) |
| Batería 12 V 6–7 Ah gel (equivalente XTZ7L) | **$90.312** (Megabat 12N7B gel) – $160.000 | Auteco [S6] | Verificado |
| **Calibración / ajuste de válvulas** | **$60.000 – $100.000** (básico) · **$120.000 – $150.000** (mayor cilindraje/acceso complejo) | MotoFix [S12] | Verificado |
| Revisión general / servicio de 5.000 km (sin repuestos) | $80.000 – $180.000 | Talleres | (estimado) |
| **SOAT 2026 — motos > 200 cc** | **$761.400** | Fasecolda, tarifas máximas 2026 [S13] | Verificado |
| **Tecnomecánica / RTM moto (2025)** | **$189.204 – $233.419** según CDA y antigüedad | Blu Radio [S14] / Grupo R5 [S17] | Verificado |
| **Impuesto vehicular Bogotá (>125 cc)** | **1,5 % del avalúo** (tramo más bajo). Para avalúo ~$25,9 M → **≈ $388.500/año** | Secretaría de Hacienda vía Caracol [S18]; ver también `03-normativa-colombia.md` | Verificado (tarifa) / cálculo (monto) |
| Impuesto vehicular Cundinamarca | **1,7 %** del avalúo (1,5 % + 0,2 % Regiotram) | `03-normativa-colombia.md` §3 | Verificado |
| Derechos de semaforización | **No aplica** (solo motos ≤ 125 cc) | `03-normativa-colombia.md` | Verificado |

**Costo anual aproximado de mantener una XTZ 250 en Bogotá (10.000 km/año, sin incluir SOAT/impuesto/RTM):**

| Concepto | Cálculo | COP/año |
|---|---|---|
| Aceite + filtro (3 cambios de aceite, 1 filtro) | 3 × $62.000 + $5.227 | ≈ $191.000 |
| Bujía (1) + filtro de aire (1) | $14.800 + $11.730 | ≈ $26.500 |
| Cadena: lubricante + ajustes | 20 aplicaciones | ≈ $80.000 |
| Pastillas delanteras (1 juego en 15.000 km) | $10.455 + mano de obra | ≈ $50.000 |
| Llanta trasera (1 en 15.000 km) | $382.500 + montaje | ≈ $410.000 |
| Válvulas (1 revisión) | $60.000–$100.000 | ≈ $80.000 |
| **Total mantenimiento** | | **≈ $840.000 – $1.000.000** |
| SOAT + RTM + impuesto | $761.400 + $210.000 + $388.500 | ≈ $1.360.000 |
| **Costo total de tenencia** | | **≈ $2,2 – 2,4 millones/año** |

---

## 6. Recomendaciones de intervalos: Bogotá urbano vs. carretera/destapado

**Factores de Bogotá:** 2.600 m de altura (densidad del aire ≈ 74 % de la del nivel del mar), tráfico pesado con marcha lenta prolongada, clima frío y húmedo, polvo de obras y sal/arena en época seca.

**Efecto técnico de la altura:** la versión **FI compensa** la altitud con el sensor de oxígeno y el mapa de la ECU; la versión **carburada (2016–2020) queda rica** a 2.600 m (pierde potencia y ensucia la bujía) y requiere ajuste de mezcla/chiclé si se usa permanentemente aquí.

| Ítem | Oficial (manual) | **Recomendado Bogotá urbano** | Recomendado carretera / destapado |
|---|---|---|---|
| Aceite de motor | 5.000 km / 6 meses | **3.000–4.000 km / 4 meses** (marcha lenta, calor, arranques) | 4.000–5.000 km / 6 meses |
| Filtro de aceite | 10.000 km | **8.000 km** (o cada 2 cambios de aceite) | 10.000 km |
| Filtro de aire — limpiar | 5.000 km | **2.500–3.000 km** (polvo de obras) | **1.000–2.000 km** en polvo |
| Filtro de aire — cambiar | 10.000 km | **8.000–10.000 km** | 8.000 km |
| Bujía — revisar | cada servicio | cada 5.000 km | cada 5.000 km |
| Bujía — cambiar | 10.000 km | **10.000 km** (8.000 si hay fallos de encendido) | 10.000 km |
| Válvulas | cada servicio (5.000) | **8.000–10.000 km** (o si hay ruido/ralentí inestable) | 10.000 km |
| Cadena — lubricar/ajustar | 500 km | **300–500 km**; cada 200–300 km en época de lluvia | **300 km** y después de cada salida a tierra |
| Kit de arrastre — cambiar | sin intervalo | **20.000–25.000 km** | **12.000–18.000 km** (barro = desgaste abrasivo) |
| Pastillas delanteras | al límite | revisar cada 3.000 km; cambio ~12.000–15.000 km | revisar cada 3.000; cambio ~15.000 km |
| Líquido de frenos | 2 años | **2 años** (clima húmedo acelera la absorción de agua) | 2 años |
| Llantas — presión | antes de cada uso | **semanal, en frío** (18/22 psi solo; 22/29 psi con pasajero) | revisar cada salida; bajar 2–3 psi en destapado |
| Llantas — cambio | sin intervalo | 15.000–18.000 km (trasera) | 8.000–12.000 km en mixto |
| Batería | sin intervalo | revisar voltaje cada 3 meses; cambio 2–3 años | 3–4 años |
| Horquilla — retenes | sin intervalo | revisar fugas en cada servicio; cambio 20.000–30.000 km | 15.000–20.000 km (polvo) |
| Lavado / limpieza | — | evitar presión directa sobre retenes, cadena y rodamientos | limpiar barro después de cada salida |

**Regla práctica para la app:** el intervalo efectivo debe ser `min(intervalo_km, equivalente_km_de_6_meses)` con un factor de uso. Sugerencia de factor: urbano Bogotá = **0,7 × intervalo oficial**; carretera = **1,0 ×**; destapado = **0,6 ×** (con cadena y filtro de aire aparte, que ya tienen intervalos propios muy cortos).

---

## 7. Datos que no se pudieron verificar (vacíos para el seed)

| # | Dato | Estado | Qué haría falta |
|---|---|---|---|
| 1 | **Holgura de válvulas de la versión FI (B8L)** | No está en el manual del propietario (solo dice "ajustar en concesionario"). Los valores 0,05–0,10 mm (admisión) y 0,08–0,13 mm (escape) provienen del **manual de taller de la versión carburada (4B41)** [S4] | Manual de taller B8L o medición en un motor |
| 2 | **Paso y número de eslabones de la cadena de la versión colombiana 13/40** | El manual de taller da 428 × 130 para la Lander 15/46 [S4]; el kit oficial colombiano usa 520H × 122 [S6]. No hay documento Yamaha Colombia que fije el paso OEM del 13/40 | Ficha de repuesto original (número de parte de la cadena) |
| 3 | **Intervalo oficial del kit de arrastre** | El manual no lo fija (solo lubricación cada 500 km) | No existe en la documentación Yamaha; usar campo |
| 4 | **Vida útil oficial de llantas, batería y pastillas** | No publicada por Yamaha | Datos de campo |
| 5 | **Fallas de regulador/estator y bomba de aceite en Colombia** | Solo reportes informales; **ninguna fuente primaria** | Encuesta a talleres o foros con historial |
| 6 | **Precio de mano de obra oficial Yamaha Colombia** (lista de tarifas por servicio) | No publicada online; solo la promo de aceite+filtro [S7] | Lista de precios de un concesionario |
| 7 | **Torque de culata y pares de apriete del motor** | No están en el manual del propietario | Manual de taller B8L |
| 8 | **Consumo homologado oficial** | Yamaha no publica ciclo de consumo para este modelo en Colombia | Solo pruebas de prensa |
| 9 | **Capacidad exacta del sistema de frenos / DOT 4 requerido** | El manual indica DOT 4 pero no volumen | Manual de taller |

---

## 8. Notas de método (cómo se obtuvo y verificó)

1. El **manual del propietario oficial** se descargó del sitio de Yamaha Argentina (`/modelo/descargar-manual-de-servicio/xtz-250-abs`), que sirve el PDF **B8L-F8199-S0** de 82 páginas [S3]. Es el mismo documento que entrega Yamaha Colombia para la XTZ250 ABS.
2. La **tabla de mantenimiento** se reconstruyó **leyendo las coordenadas de cada "√"** del PDF (no a ojo): las columnas del manual están rotadas 90°, de modo que un OCR normal mezcla filas. Se extrajo con pdf.js y se mapeó cada marca a su columna (1.000/5.000/10.000/15.000/20.000/6 meses). Esto permitió detectar, por ejemplo, que el filtro de aceite solo se cambia a 1.000/10.000/20.000 y no en cada servicio.
3. La **ficha técnica** se cruzó entre la ficha comercial de Yamaha Colombia [S1], la ficha PDF de Yamaha Argentina [S2] y el manual [S3]. Las tres coinciden salvo en peso (151 vs 152 kg) y tanque (14 vs 13,6 L).
4. Los **datos de motor del manual de taller** (válvulas, cadena, DOT 4, aceite de horquilla) provienen del manual de la **versión carburada 4B41** [S4], porque no se encontró el manual de taller de la versión FI.
5. Se **descartó** una fuente secundaria (Oficina Vision) que atribuye a la XTZ 250 "cadena 520 × 110, piñón 15 / catalina 45, bujía CPR8EA-9, llanta 90/90-21": contradice el manual y la ficha de Yamaha en los cuatro datos [S15]. Sirve como ejemplo de por qué no se sembró desde agregadores.

---

## 9. Fuentes

| ID | Fuente | Tipo | URL |
|---|---|---|---|
| S1 | Yamaha Oriente (concesionario Yamaha Colombia) — ficha XTZ250 | Primaria (ficha oficial de red) | https://www.yamahaoriente.com.co/vehiculo/xtz250/ |
| S2 | Yamaha Motor Argentina — ficha técnica PDF XTZ 250 ABS | Primaria (fabricante) | https://www.yamaha-motor.com.ar/modelo/pdf/xtz-250-abs |
| S3 | **Yamaha — Manual del propietario XTZ250 ABS, B8L-F8199-S0 (PDF, 82 págs.)** — tabla de mantenimiento en págs. 6-2 a 6-6 (PDF 37–41); especificaciones en págs. 8-1 y 8-2 (PDF 75–76) | **Primaria (fabricante)** | https://www.yamaha-motor.com.ar/modelo/descargar-manual-de-servicio/xtz-250-abs |
| S4 | Yamaha — Manual de taller LANDER XTZ250 (modelo 4B41, versión carburada), 387 págs. — especificaciones de motor (pág. 23), válvulas (pág. 25), chasis y cadena (págs. 31–33) | Primaria (fabricante, modelo anterior) | https://www.manualslib.mx/manual/38872/Yamaha-Lander-Xtz250.html?page=23 |
| S5 | Auteco Boutique — filtro de aceite 38B-E3440-00-00 | Primaria (repuesto oficial) | https://boutique.auteco.com.co/ |
| S6 | Auteco Boutique — catálogo de repuestos XTZ 250 (kit de arrastre, pastillas, filtro de aire, bujía, batería, líquido DOT 4, llantas) | Primaria (precios oficiales) | https://boutique.auteco.com.co/kit-de-arrastre-nitrox-xtz-250-40t-13t-520h-122-pro-11084715/p |
| S7 | Yamaha Yamamotos (concesionario Colombia) — oferta cambio de aceite y filtro | Primaria (precio concesionario) | https://yamahayamamotos.com.co/oferta-cambio-de-aceite-y-filtro/ |
| S8 | MercadoLibre Colombia — kit de arrastre XTZ 250 aftermarket ($199.499) | Secundaria (precio de mercado) | https://articulo.tucarro.com.co/MCO-2207883084-kit-de-arrastre-yamaha-xtz250-xtz-250-xring-reforzado-choho-_JM |
| S9 | MercadoLibre Colombia — kit Regina Premium Z-ring ($608.000) | Secundaria (precio de mercado) | https://articulo.tucarro.com.co/MCO-1615507763-kit-de-arrastre-regina-premium-z-ring-yamaha-xtz-250-_JM |
| S10 | American Motos Colombia — llanta Metzeler Tourance 120/80-18 ($382.500) | Secundaria (comercio) | https://www.americanmotos.com/products/llanta-metzeler-120-80-18-tourance-tt |
| S11 | Virtual Llantas — Metzeler Tourance trasera 120/80-18 | Secundaria (comercio) | https://www.virtualllantas.com/llanta-metzeler-tourance-trasera-120-80-18_7558 |
| S12 | MotoFix Colombia — cuánto cuesta calibrar válvulas de moto en Colombia | Secundaria (taller) | https://motofix.com.co/blog/mundo-motero/cuanto-cuesta-calibrar-valvulas-de-moto-en-colombia/ |
| S13 | Fasecolda — Tarifas máximas comerciales del SOAT 2026 (PDF) | Primaria (gremio) | https://www.fasecolda.com/wp-content/uploads/Tarifas-SOAT-2026-referencia.pdf |
| S14 | Blu Radio — Precio de revisión tecnomecánica 2025 para motos | Secundaria (prensa) | https://www.bluradio.com/motor/precio-revision-tecnomecanica-2025-so35 |
| S15 | Oficina Vision — ficha XTZ 250 Lander (datos contradictorios; **descartada**) | Secundaria no confiable | https://oficinavision.com.br/motos/yamaha/xtz-250-lander |
| S16 | Foro XTZ (España/LatAm) — "Problemas con la XTZ250" (corte a 4.000 rpm) | Terciaria (foro) | https://xtz125.foroes.org/t4735-problemas-con-la-xtz250 |
| S17 | Grupo R5 — Tecnomecánica 2025: precio para carro y moto | Secundaria (prensa) | https://www.grupor5.com/tecnomecanica/2025 |
| S18 | Caracol Radio — Motos que deben pagar impuesto vehicular en Bogotá 2025 (tarifas 1,5 % / 2,5 % / 3,5 %) | Secundaria (prensa, cita SHD) | https://caracol.com.co/2025/05/06/motos-que-deberan-pagar-impuesto-vehicular-en-bogota-2025-link-oficial-para-consultar-por-placa/ |
| S19 | demotos.com.co — prueba Yamaha XTZ 250 polivalente (125 km/gal) | Secundaria (prensa especializada CO) | https://demotos.com.co/pruebas-de-manejo/yamaha-xtz-250-polivalente-examen-a-fondo/ |
| S20 | autoesporte / Globo — teste Yamaha Lander 250 2019 ABS (29,9 km/l) | Secundaria (prensa BR) | https://autoesporte.globo.com/testes/noticia/2019/01/teste-yamaha-250-lander-2019-chega-com-freio-abs-e-novo-visual-para-encostar-na-honda-xre-300.ghtml |
| S21 | webmotors — Yamaha Ténéré 250 usada (27 km/l) | Secundaria (prensa BR) | https://www.webmotors.com.br/wm1/motos/tenere-250-e-boa-compra-por-menos-de-r-20-mil |

---

*Documento complementario:* los datos de SOAT, RTM, impuestos y trámites están desarrollados en [`03-normativa-colombia.md`](./03-normativa-colombia.md). El seed para la app está en [`xtz250-seed.json`](./xtz250-seed.json).
