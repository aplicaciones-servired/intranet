import { useState } from "react";
import { createCartaLaboral } from "../services/carta_laboral.service";

type Step = "form" | "success";

export default function SolicitudCartaLaboral() {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre_completo: "",
    cedula: "",
    correo: "",
    cargo: "",
    empresa: "" as "Multired" | "Servired" | "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { nombre_completo, cedula, correo, cargo, empresa } = form;

    if (!nombre_completo.trim() || !cedula.trim() || !correo.trim() || !cargo.trim() || !empresa) {
      setError("Por favor completa todos los campos.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setError("Ingresa un correo corporativo válido.");
      return;
    }
    const cedulaRegex = /^\d{6,12}$/;
    if (!cedulaRegex.test(cedula.trim())) {
      setError("Ingresa un número de cédula válido (entre 6 y 12 dígitos).");
      return;
    }

    setLoading(true);
    try {
      await createCartaLaboral({
        nombre_completo: nombre_completo.trim(),
        cedula: cedula.trim(),
        correo: correo.trim().toLowerCase(),
        cargo: cargo.trim(),
        empresa: empresa as "Multired" | "Servired",
      });
      setStep("success");
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Error al enviar la solicitud. Intenta de nuevo.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaSolicitud = () => {
    setForm({ nombre_completo: "", cedula: "", correo: "", cargo: "", empresa: "" });
    setError(null);
    setStep("form");
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#f2f4f7] flex items-center justify-center px-4 mt-20">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">¡Solicitud enviada!</h2>
          <p className="text-gray-600 mb-6">
            Tu solicitud de carta laboral fue recibida. El área de Recursos Humanos la procesará en los próximos días hábiles y recibirás una respuesta en tu correo corporativo.
          </p>
          <button
            onClick={handleNuevaSolicitud}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#005a9c] to-[#003d6b] hover:from-[#004080] hover:to-[#00295a] text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
          >
            Hacer otra solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f4f7] py-16 px-4 mt-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#005a9c] to-[#003d6b] text-white mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Carta Laboral</h1>
          <p className="text-gray-600 text-lg">
            Solicita tu carta laboral. Diligencia el formulario con tus datos y el área de RRHH la procesará.
          </p>
        </div>

        {/* Card formulario */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#005a9c]/10 text-[#005a9c] text-sm font-bold">1</span>
            Tus datos
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Juan Carlos Pérez Gómez"
                value={form.nombre_completo}
                onChange={(e) => handleChange("nombre_completo", e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#005a9c] focus:ring-2 focus:ring-[#005a9c]/20 outline-none transition-all text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Cédula */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Número de cédula <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: 1001234567"
                value={form.cedula}
                onChange={(e) => handleChange("cedula", e.target.value.replace(/\D/g, ""))}
                maxLength={12}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#005a9c] focus:ring-2 focus:ring-[#005a9c]/20 outline-none transition-all text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Correo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo corporativo <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="ejemplo@empresa.com"
                value={form.correo}
                onChange={(e) => handleChange("correo", e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#005a9c] focus:ring-2 focus:ring-[#005a9c]/20 outline-none transition-all text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Cargo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Cargo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Analista de Aplicaciones"
                value={form.cargo}
                onChange={(e) => handleChange("cargo", e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#005a9c] focus:ring-2 focus:ring-[#005a9c]/20 outline-none transition-all text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Empresa <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["Multired", "Servired"] as const).map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => handleChange("empresa", op)}
                    className={`py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                      form.empresa === op
                        ? "border-[#005a9c] bg-[#005a9c]/5 text-[#005a9c]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            {/* Nota informativa */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Una vez enviada la solicitud, el área de RRHH validará tu información y completará los datos de la carta. Recibirás una confirmación en tu correo corporativo.
              </span>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#005a9c] to-[#003d6b] hover:from-[#004080] hover:to-[#00295a] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-base transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Enviar solicitud
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
