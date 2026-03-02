import { useState, useEffect } from "react";
import { getFormulariosActivos, type Formulario } from "../services/GetInfo.service";
import { API_URL } from "../utils/const";

function FormularioModal({ formulario, onClose }: { formulario: Formulario; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen */}
        <div className="w-full bg-black flex items-center justify-center relative" style={{ maxHeight: "60vh" }}>
          <img
            src={formulario.imagen}
            alt={formulario.titulo}
            className="w-full object-contain"
            style={{ maxHeight: "60vh" }}
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Info */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{formulario.titulo}</h3>
          {formulario.descripcion && (
            <p className="text-gray-600 mb-4">{formulario.descripcion}</p>
          )}
          {formulario.fecha_registro && (
            <p className="text-xs text-gray-400 mb-4">
              Publicado: {new Date(formulario.fecha_registro).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
          <a
            href={formulario.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full gap-2 px-5 py-3 bg-linear-to-r from-[#005a9c] to-[#003d6b] hover:from-[#004080] hover:to-[#00295a] text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
          >
            Completar formulario
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function FormulariosPublicos() {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedFormulario, setSelectedFormulario] = useState<Formulario | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const formData = await getFormulariosActivos();
      setFormularios(formData);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando formularios:", error);
      setLoading(false);
    }
  };

  const filteredFormularios = formularios.filter((form) => {
    const matchesSearch =
      form.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (form.descripcion && form.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f4f7] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#005a9c] border-r-transparent mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Cargando formularios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f4f7] py-16 px-4 mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-[#005a9c] to-[#003d6b] text-white mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Formularios y Encuestas
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Completa los formularios y encuestas disponibles. Tu participación es importante para nosotros.
          </p>
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar formularios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#005a9c] focus:ring-2 focus:ring-[#005a9c]/20 outline-none transition-all text-gray-800"
            />
          </div>

          {/* Contador de resultados */}
          {searchQuery && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="bg-[#005a9c] text-white px-3 py-1 rounded-full font-medium">
                {filteredFormularios.length}
              </span>
              <span className="text-gray-600">
                resultado{filteredFormularios.length !== 1 ? "s" : ""} encontrado{filteredFormularios.length !== 1 ? "s" : ""}
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-auto text-[#005a9c] hover:text-[#004080] font-medium"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
        </div>

        {/* Grid de formularios */}
        {filteredFormularios.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No se encontraron formularios
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? "Intenta con otros términos de búsqueda"
                : "No hay formularios disponibles en este momento"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFormularios.map((formulario) => (
              <div
                key={formulario.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 group"
              >
                {/* Imagen */}
                <div
                  className="relative h-48 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedFormulario(formulario)}
                >
                  <img
                    src={formulario.imagen}
                    alt={formulario.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                      <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Título */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#005a9c] transition-colors">
                    {formulario.titulo}
                  </h3>

                  {/* Descripción */}
                  {formulario.descripcion && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {formulario.descripcion}
                    </p>
                  )}

                  {/* Fecha */}
                  {formulario.fecha_registro && (
                    <p className="text-xs text-gray-400 mb-4">
                      Publicado: {new Date(formulario.fecha_registro).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}

                  {/* Botón */}
                  <a
                    href={formulario.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 bg-linear-to-r from-[#005a9c] to-[#003d6b] hover:from-[#004080] hover:to-[#00295a] text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl group"
                  >
                    Completar formulario
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedFormulario && (
          <FormularioModal
            formulario={selectedFormulario}
            onClose={() => setSelectedFormulario(null)}
          />
        )}
      </div>
    </div>
  );
}
