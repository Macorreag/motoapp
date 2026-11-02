import { useState } from "react";
import { ArrowRight, Bike, Check, Sparkles } from "lucide-react";
import { useApp } from "../store/AppStore";
import { componentesIniciales, crearVehiculo, documentosIniciales, type DatosOnboarding } from "../data/seed";
import { Field } from "../components/ui";
import { isoDate } from "../lib/format";
import { CIUDADES } from "../lib/picoPlaca";

export function Onboarding() {
  const { completarOnboarding, capacidades } = useApp();
  const [paso, setPaso] = useState(0);
  const [nombre, setNombre] = useState("");
  const [apodo, setApodo] = useState("La XTZ");
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("2023");
  const [color, setColor] = useState("Azul Yamaha");
  const [km, setKm] = useState("");
  const [matricula, setMatricula] = useState("");
  const [ciudad, setCiudad] = useState("bogota");
  const [soat, setSoat] = useState("");
  const [tecno, setTecno] = useState("");
  const [impuesto, setImpuesto] = useState("");
  const [sinDocs, setSinDocs] = useState(false);
  const [error, setError] = useState("");

  function terminar() {
    if (!placa.trim()) {
      setError("Necesito la placa para calcular el pico y placa y las alertas.");
      setPaso(0);
      return;
    }
    const datos: DatosOnboarding = {
      apodo,
      placa,
      modelo: Number(modelo) || 2023,
      color,
      kmActual: Number(km.replace(/[^\d]/g, "")) || 0,
      fechaMatricula: matricula || isoDate(),
      ciudad: CIUDADES.find((c) => c.id === ciudad)?.nombre ?? "Bogotá",
      nombre,
      soatVence: sinDocs ? undefined : soat || undefined,
      tecnoVence: sinDocs ? undefined : tecno || undefined,
      impuestoVence: sinDocs ? undefined : impuesto || undefined,
    };
    const vehiculo = crearVehiculo(datos);
    completarOnboarding({
      vehiculo,
      componentes: componentesIniciales(vehiculo.id, vehiculo.kmActual, isoDate()),
      documentos: documentosIniciales(vehiculo.id, datos),
      ajustes: { nombre, ciudad },
    });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-lg">
        <div className="mb-4 flex items-center gap-2.5">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-white"
            style={{ background: "linear-gradient(135deg,#fb923c,#ea580c)" }}
          >
            <Bike size={21} />
          </span>
          <div>
            <div className="ink text-[1.05rem] font-extrabold leading-tight tracking-tight">MotoApp</div>
            <div className="ink-3 text-[0.66rem] font-semibold uppercase tracking-wider">Tu XTZ 250, al día</div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div
            className="px-5 pb-6 pt-7 text-white"
            style={{ background: "linear-gradient(135deg,#f97316,#c2410c)" }}
          >
            <div className="mb-1 flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-widest text-white/80">
              <Sparkles size={13} /> Configuración inicial · {paso + 1} de 2
            </div>
            <h1 className="text-[1.4rem] font-extrabold leading-tight">
              {paso === 0 ? "Cuéntame de tu moto" : "Lo legal, sin sustos"}
            </h1>
            <p className="mt-1 text-[0.82rem] text-white/85">
              {paso === 0
                ? "Con esto armo tu hoja de vida y el plan de mantenimiento real de la XTZ 250."
                : "Si no sabes las fechas, déjalas vacías y las agregas después en la guantera."}
            </p>
          </div>

          <div className="px-5 py-5">
            {paso === 0 ? (
              <div className="flex flex-col gap-3">
                <Field label="¿Cómo te llamas?">
                  <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Apodo de la moto">
                    <input className="input" value={apodo} onChange={(e) => setApodo(e.target.value)} />
                  </Field>
                  <Field label="Placa">
                    <input className="input uppercase" value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="ABC12D" />
                  </Field>
                  <Field label="Modelo (año)">
                    <input className="input nums" inputMode="numeric" value={modelo} onChange={(e) => setModelo(e.target.value)} />
                  </Field>
                  <Field label="Color">
                    <input className="input" value={color} onChange={(e) => setColor(e.target.value)} />
                  </Field>
                  <Field label="Kilometraje actual">
                    <input className="input nums" inputMode="numeric" value={km} onChange={(e) => setKm(e.target.value)} placeholder="18450" />
                  </Field>
                  <Field label="Fecha de matrícula">
                    <input className="input" type="date" value={matricula} onChange={(e) => setMatricula(e.target.value)} />
                  </Field>
                </div>
                <Field label="Ciudad">
                  <select className="input" value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
                    {CIUDADES.filter((c) => c.id !== "otra").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </Field>
                {error && <p className="text-xs font-semibold" style={{ color: "var(--bad)" }}>{error}</p>}
                <button className="btn btn-primary mt-1" onClick={() => setPaso(1)}>
                  Continuar <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <label className="ink-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold" style={{ background: "var(--surface-2)" }}>
                  <input
                    type="checkbox"
                    checked={sinDocs}
                    onChange={(e) => setSinDocs(e.target.checked)}
                  />
                  Todavía no tengo estas fechas
                </label>
                <div className={`flex flex-col gap-3 ${sinDocs ? "pointer-events-none opacity-40" : ""}`}>
                  <Field label="SOAT vence" hint="Moto > 200 cc: tarifa 2026 de $761.400">
                    <input className="input" type="date" value={soat} onChange={(e) => setSoat(e.target.value)} disabled={sinDocs} />
                  </Field>
                  <Field label="Tecnomecánica vence" hint="Motos: primera a los 2 años de matrícula, luego cada año">
                    <input className="input" type="date" value={tecno} onChange={(e) => setTecno(e.target.value)} disabled={sinDocs} />
                  </Field>
                  <Field label="Impuesto vehicular vence">
                    <input className="input" type="date" value={impuesto} onChange={(e) => setImpuesto(e.target.value)} disabled={sinDocs} />
                  </Field>
                </div>
                <div className="mt-1 flex gap-2">
                  <button className="btn btn-ghost flex-1" onClick={() => setPaso(0)}>
                    Atrás
                  </button>
                  <button className="btn btn-primary flex-[2]" onClick={terminar}>
                    <Check size={16} /> Empezar a usarla
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="ink-3 mt-3 px-2 text-center text-[0.68rem] leading-relaxed">
          {capacidades.backend === "gas"
            ? "Tus datos se guardan en tu propia hoja de cálculo de Google. Solo tu cuenta puede abrir esta app."
            : "Tus datos se guardan solo en este navegador (IndexedDB). Nada se envía a ningún servidor."}
        </p>
      </div>
    </div>
  );
}
