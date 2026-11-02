# Resumen ejecutivo de la investigación

Corte: **28 de octubre de 2026**. Tres informes completos con fuentes en esta carpeta:

| Informe | Qué responde | Volumen |
|---|---|---|
| [`01-tucamo-producto.md`](./01-tucamo-producto.md) | ¿Qué hace Tucamo exactamente y cómo está diseñado su producto? | 589 líneas · 21 capturas |
| [`02-xtz250-mantenimiento.md`](./02-xtz250-mantenimiento.md) | ¿Cuál es el mantenimiento real de una XTZ 250 y cuánto cuesta en Colombia? | 389 líneas · 21 fuentes |
| [`03-normativa-colombia.md`](./03-normativa-colombia.md) | ¿Qué obligaciones legales tiene una moto de 250 cc en Bogotá? | 508 líneas · 52 URLs |
| [`xtz250-seed.json`](./xtz250-seed.json) | Datos semilla (24 componentes con rangos) | JSON |

---

## A. Tucamo en una página

- **Producto**: gestión preventiva de vehículos (motos y carros) para dueños de 1–3 vehículos y para
  talleres. 1 vehículo gratis; Premium 1,99 / 7,99 / 13,99 USD al mes/semestre/año para 3 vehículos.
- **12 módulos**: hoja de vida · mantenimientos · alertas · reportes y PDF · multas y pico y placa ·
  aliados y órdenes · manuales (+1.900) · Zona Tucamo (puntos) · comunidad · herramientas · Premium ·
  modo negocio y flota.
- **Modelo de datos inferido**: `Usuario → Vehículo → {Entrada, PlanMantenimiento → Componente,
  Documento, Alerta, OrdenServicio}` + `Aliado`, `Manual`, `Recompensa`, `Flota`, `PicoYPlaca`.
- **Guantera**: 5 espacios. Rótulos visibles en capturas: “Seguro obligatorio”, “Tecno”, “Seguro”,
  “T. Propiedad” y un quinto cortado que se infiere como “Impuesto”.
- **Indicadores de desgaste** (rótulos exactos): Lubricación de cadena, Cambio de aceite, Filtro de
  aceite, Filtro de aire, Presión aire de llantas, Calibración de válvulas, Cambio de pastillas,
  Batería, Kit de arrastre, SOAT, Tecnomecánica, Impuesto vehicular, entre otros.
- **Semáforo empírico** de los anillos: rojo 0–16 %, ámbar 12–32 %, verde ≥ 38 % → la app usa cortes
  2 % / 15 % / 35 %.
- **Alertas**: legales, personalizadas (Premium) y de día a día (pico y placa). No publican los días de
  anticipación; su propio blog recomienda 30 y 15 días.
- **Gamificación**: 1 mes Premium = 500 puntos; 5 puntos ≈ 1 COP en bonos de gasolina.
- **Dolores reportados en reseñas**: precio/paywall, avisos tardíos, catálogo incompleto o con errores
  por modelo, notificaciones que no se limpian y kilometraje manual.

**Decisiones que tomó este clon a partir de eso**: plan precargado y editable por modelo, días
proyectados según uso real, score explicable, cero paywall y cero nube.

---

## B. XTZ 250: lo esencial

### El dato que corrige el mito

El manual del propietario **B8L-F8199-S0** imprime las columnas `1000 km (600 mi) · 5000 km (3000 mi) ·
10000 km (6000 mi) · 15000 km (9000 mi) · 20000 km (12000 mi)` + **cada 6 meses**. El “cada 3.000”
que repiten los talleres colombianos son **millas**.

### Plan oficial consolidado

| Ítem | Intervalo |
|---|---|
| Aceite de motor (10W-40 JASO MA) | 5.000 km o 6 meses |
| Filtro de aceite | 10.000 km (no en cada cambio) |
| Filtro de aire | limpiar 5.000 · cambiar 10.000 |
| Bujía NGK DR8EA (gap 0,6–0,7) | revisar siempre · cambiar 10.000 |
| Válvulas (holgura + ajuste) | cada servicio; en la práctica 8.000–10.000 |
| Cadena (holgura 30–40 mm + lubricar) | **cada 500 km** |
| Kit de arrastre 13/40 | ~22.000 km (campo; el manual no lo fija) |
| Pastillas delanteras / traseras | 15.000 / 18.000 km |
| Líquido de frenos DOT 4 | cada 2 años |
| Tubo de freno | cada 4 años |
| Llantas 80/90-21 y 120/80-18 | 18.000 / 15.000 km |
| Presión | 18/22 psi solo · 22/29 psi con pasajero |

### Ficha

249 cc SOHC, aire + enfriador de aceite · 20,4 hp @ 8.000 · 20,5 N·m @ 6.500 · 151–152 kg ·
tanque 13,6 L (14 L comercial, reserva 3,7 L) · aceite 1,35 L sin filtro / 1,45 L con filtro ·
batería XTZ7L 12 V 6 Ah · consumo real 28–33 km/l (105–125 km/gal).

### Costos (COP 2025–2026)

Aceite + filtro $62.000–$110.000 · filtro de aceite desde $5.227 · filtro de aire desde $11.730 ·
bujía desde $14.800 · kit de arrastre $96.687–$199.499 (+ mano de obra $40.000–$80.000) · pastillas
desde $10.455 (+ $20.000–$40.000) · DOT 4 $32.900 · llanta delantera desde $227.757 · trasera
$382.500 · batería desde $90.312 · válvulas $60.000–$150.000.

**Tenencia anual estimada** (10.000 km/año, Bogotá): ~$840.000–$1.000.000 de mantenimiento +
$761.400 SOAT + ~$210.000 RTM + ~$388.500 impuesto ≈ **$2,2–2,4 millones**.

### Bogotá vs carretera

El informe recomienda acortar intervalos en urbano: aceite 3.000–4.000 km (4 meses), filtro de aceite
8.000 km, cadena cada 300–500 km, pastillas revisar cada 3.000 km. La app arranca con 4.000 km de
aceite y permite editar todo.

---

## C. Normativa: reglas que la app implementa

| Tema | Dato vigente | Regla de cálculo en la app |
|---|---|---|
| SOAT 2026 | <100 cc $256.200 · 101–200 cc $343.300 · **>200 cc $761.400** · ciclomotor $124.100 | Vence al año de la expedición |
| RTM | Motos: **2 años desde la matrícula y luego anual** | Si falta la fecha, se calcula desde `fechaMatricula` |
| Impuesto | ≤125 cc exentas; 250 cc: **1,5 % del avalúo en Bogotá**, 1,7 % Cundinamarca | Tarifas mostradas en Ajustes → Fuentes |
| Pico y placa | **Bogotá: motos exentas** (Decreto 003/2023 mod. 463/2024). Medellín: 2 dígitos/día, 5:00–20:00, primer dígito | Motor de reglas por ciudad + festivos 2026 + override manual |
| Comparendos 2026 | UVB $12.110: sin SOAT/licencia **$1.266.100**; sin RTM/casco/pico y placa **$633.200** | Mostrados como referencia en Ajustes |
| Trámites | Licencia A2 (>125 cc), traspaso ≈ $145.500 + retefuente 1 % | Texto informativo |
| SIMIT / RUNT | Consulta web por placa, **sin API pública** (captcha); RUNT REST solo para entidades autorizadas | No se automatiza: enlaces oficiales + registro manual |

**Advertencia que la app repite en pantalla**: no es una entidad gubernamental; las reglas pueden
cambiar por decreto y deben confirmarse en la secretaría de movilidad.

---

## D. Vacíos declarados (no se inventaron datos)

1. Holgura de válvulas de la XTZ 250 de inyección (los valores disponibles son del manual de la
   carburada 4B41).
2. Paso y número de eslabones OEM del kit 13/40 colombiano (el kit oficial aftermarket es 520H×122;
   el manual de la Lander da 428×130 para 15/46).
3. Intervalo oficial del kit de arrastre (Yamaha no lo fija).
4. Tarifas oficiales de mano de obra Yamaha Colombia (solo hay una promoción de aceite + filtro).
5. Fallas de regulador/estator: solo reportes informales, sin fuente primaria.
6. Impuesto vehicular de Bogotá: la tarifa baja (1,5 %) está confirmada; el 0,2 % de Regiotram en
   Bogotá sigue pendiente de confirmación.

Todo lo demás está respaldado por documento oficial y enlazado en el informe correspondiente.
