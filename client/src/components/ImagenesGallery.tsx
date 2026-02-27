import { useState, useEffect, useCallback, useRef } from "react";
import { getImagenes, getConfig, getEspacios, getCategorias, type Imagen, type Espacio, type Categoria } from "../services/GetInfo";
import { categories } from "../utils/const";

// Categorías estáticas como fallback mientras carga la API
const STATIC_CATS = categories.items;

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov"];

function isVideo(url: string): boolean {
  return VIDEO_EXTENSIONS.some((ext) => url.toLowerCase().includes(ext));
}

function formatFecha(fecha?: string): string {
  if (!fecha) return "";
  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ─────────────────────────────────────────
   SLIDER principal
───────────────────────────────────────── */
function Slider({ items, onOpen }: { items: Imagen[]; onOpen: (i: Imagen) => void }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => setCurrent((c) => (c + 1) % items.length), [items.length]);
  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);

  useEffect(() => {
    if (items.length <= 1) return;
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, items.length]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 5000);
  };

  if (!items.length) return null;

  const item = items[current];
  const video = isVideo(item.poster);

  return (
    <div className="relative w-full overflow-hidden bg-black" style={{ height: "380px" }}>
      {/* Media */}
      <div className="absolute inset-0 cursor-pointer" onClick={() => onOpen(item)}>
        {video ? (
          <video src={item.poster} className="w-full h-full object-cover" muted autoPlay loop playsInline />
        ) : (
          <img src={item.poster} alt={item.titulo} className="w-full h-full object-cover transition-opacity duration-500" />
        )}
        {/* Gradiente inferior */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
      </div>

      {/* Texto sobre el slider */}
      <div className="absolute bottom-12 left-10 right-24 text-white pointer-events-none">
        <h2 className="text-2xl md:text-3xl font-bold drop-shadow-lg">{item.titulo}</h2>
        {item.descripcion && (
          <p className="text-sm text-white/80 mt-1 line-clamp-2 drop-shadow">{item.descripcion}</p>
        )}
      </div>

      {/* Flecha izquierda */}
      <button
        onClick={() => { prev(); resetTimer(); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white rounded-full w-9 h-9 flex items-center justify-center transition z-10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Flecha derecha */}
      <button
        onClick={() => { next(); resetTimer(); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#005a9c] hover:bg-[#004a84] text-white rounded-full w-9 h-9 flex items-center justify-center transition z-10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Puntos indicadores */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); resetTimer(); }}
            className={`rounded-full transition-all duration-300 ${i === current ? "bg-white w-4 h-2" : "bg-white/50 w-2 h-2"}`}
          />
        ))}
      </div>

      {/* Botón play si es video */}
      {video && (
        <div className="absolute bottom-12 right-10 bg-white/20 rounded-full p-2">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
          </svg>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Card horizontal (estilo "Noticias internas")
───────────────────────────────────────── */
function NewsCard({ item, onOpen }: { item: Imagen; onOpen: () => void }) {
  const video = isVideo(item.poster);
  const catLabel = STATIC_CATS.find((c) => c.value === item.categoria)?.label ?? item.categoria;

  return (
    <div
      onClick={onOpen}
      className="flex gap-3 bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200 p-2"
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 w-28 h-20 bg-gray-100 rounded overflow-hidden">
        {video ? (
          <>
            <video src={item.poster} className="w-full h-full object-cover" muted preload="metadata" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
              </svg>
            </div>
          </>
        ) : (
          <img src={item.poster} alt={item.titulo} className="w-full h-full object-cover" loading="lazy" />
        )}
      </div>

      {/* Texto */}
      <div className="flex flex-col justify-center gap-1 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wide bg-[#00b4d8] text-white px-2 py-0.5 rounded w-fit">
          {catLabel}
        </span>
        <h4 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">{item.titulo}</h4>
        {item.fecha_registro && (
          <p className="text-[11px] text-gray-400">{formatFecha(item.fecha_registro)}</p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Sección por categoría
───────────────────────────────────────── */
function CategoriaSection({ label, items, onOpen }: { label: string; items: Imagen[]; onOpen: (i: Imagen) => void }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="text-2xl font-bold text-[#005a9c] text-center mb-5">{label}</h2>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <NewsCard key={item.id} item={item} onOpen={() => onOpen(item)} />
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Modal
───────────────────────────────────────── */
function Modal({ item, onClose }: { item: Imagen; onClose: () => void }) {
  const video = isVideo(item.poster);
  const catLabel = STATIC_CATS.find((c) => c.value === item.categoria)?.label ?? item.categoria;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded overflow-hidden max-w-4xl w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-full bg-black flex items-center justify-center" style={{ maxHeight: "65vh" }}>
          {video ? (
            <video src={item.poster} controls autoPlay className="w-full" style={{ maxHeight: "65vh" }} />
          ) : (
            <img src={item.poster} alt={item.titulo} className="w-full object-contain" style={{ maxHeight: "65vh" }} />
          )}
        </div>
        <div className="p-5 flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#00b4d8] text-white px-2 py-0.5 rounded">
              {catLabel}
            </span>
            <h2 className="text-lg font-bold text-gray-900 mt-2">{item.titulo}</h2>
            {item.descripcion && <p className="text-sm text-gray-600 mt-1">{item.descripcion}</p>}
            {item.fecha_registro && <p className="text-xs text-gray-400 mt-2">{formatFecha(item.fecha_registro)}</p>}
          </div>
          <button onClick={onClose} className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors mt-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────── */
export function ImagenesGallery() {
  const [imagenes, setImagenes] = useState<Imagen[]>([]);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [dinamicCats, setDinamicCats] = useState<Categoria[]>([]);
  const [sliderCat, setSliderCat] = useState("comunicaciones");
  const [configuredSliderCat, setConfiguredSliderCat] = useState("comunicaciones");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<Imagen | null>(null);

  useEffect(() => {
    Promise.all([
      getImagenes(),
      getEspacios(),
      getCategorias(),
      getConfig("slider_categoria"), // fallback si no hay espacios tipo slider
    ])
      .then(([data, esp, cats, catConfig]) => {
        setImagenes(data);

        // Usar categorías de la API si existen, si no las estáticas
        const activeCats = cats.filter((c) => c.activa);
        if (activeCats.length > 0) setDinamicCats(activeCats);

        const visibleEsp = esp.filter((e) => e.visible);
        setEspacios(visibleEsp);

        // Determinar slider: primer espacio tipo slider, o config guardada, o primer valor
        const sliderSpace = visibleEsp.find((e) => e.tipo === "slider");
        const initialCat = sliderSpace?.categoria ?? catConfig ?? "comunicaciones";
        setSliderCat(initialCat);
        setConfiguredSliderCat(initialCat);

        setLoading(false);
      })
      .catch(() => { setError("No se pudo cargar el contenido."); setLoading(false); });
  }, []);

  // Categorías visibles para las tabs del slider
  const CATEGORIAS = dinamicCats.length > 0 ? dinamicCats : STATIC_CATS;

  const porCategoria = (cat: string) => imagenes.filter((i) => i.categoria === cat);
  const sliderItems = porCategoria(sliderCat);
  const sliderData = sliderItems.length ? sliderItems : imagenes;

  // Espacios tipo "destacada"
  const destacadaSpaces = espacios.filter((e) => e.tipo === "destacada");

  // Espacios tipo "grid" o "lista" → secciones del área principal
  // Si hay espacios configurados, usarlos. Si no, mostrar todas las categorías con contenido.
  const hayEspaciosGrid = espacios.some((e) => e.tipo === "grid" || e.tipo === "lista");
  const seccionesGrid = hayEspaciosGrid
    ? espacios.filter((e) => e.tipo === "grid" || e.tipo === "lista")
    : CATEGORIAS.filter((c) => porCategoria(c.value).length > 0);


  return (
    <div className="min-h-screen bg-[#f4f4f4]">

      {/* ── Selector de categoría para el slider ── */}
      <div className="bg-[#005a9c]">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-0 overflow-x-auto">
          {CATEGORIAS.map((cat) => {
            const isActive = sliderCat === cat.value;
            const isConfigured = configuredSliderCat === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSliderCat(cat.value)}
                className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 border-b-4 ${
                  isActive
                    ? "border-white text-white bg-white/15"
                    : "border-transparent text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat.label}
                {isConfigured && (
                  <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-yellow-300 align-middle" title="Categoría configurada por defecto" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Slider ── */}
      {loading && (
        <div className="flex justify-center items-center bg-black" style={{ height: "380px" }}>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
        </div>
      )}

      {!loading && !error && <Slider items={sliderData} onOpen={setModalItem} />}

      {/* ── Error ── */}
      {error && (
        <div className="max-w-lg mx-auto mt-10 bg-red-50 border border-red-200 rounded p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* ── Secciones ── */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto px-4 py-10">
          {imagenes.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <p className="text-5xl mb-4">📂</p>
              <p className="text-lg">No hay contenido aún.</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">

              {/* ── Columnas izquierdas: espacios destacados ── */}
              {destacadaSpaces.length > 0 && (
                <div className="flex flex-col gap-5 lg:w-80 shrink-0">
                  {destacadaSpaces.map((esp) => {
                    const items = porCategoria(esp.categoria);
                    const catMeta = CATEGORIAS.find((c) => c.value === esp.categoria);
                    if (!items.length) return null;
                    return (
                      <aside key={esp.id} className="bg-white border border-[#005a9c]/20 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-[#005a9c] px-4 py-3 flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">{esp.nombre}</span>
                          {catMeta && (
                            <span className="ml-1 text-white/60 text-xs">({catMeta.label})</span>
                          )}
                          <span className="ml-auto text-white/60 text-xs">{items.length} items</span>
                        </div>
                        <div className="p-3 flex flex-col gap-2">
                          {items.map((item) => (
                            <NewsCard key={item.id} item={item} onOpen={() => setModalItem(item)} />
                          ))}
                        </div>
                      </aside>
                    );
                  })}
                </div>
              )}

              {/* ── Área principal: grid / lista ── */}
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {(seccionesGrid as Array<Espacio | typeof STATIC_CATS[0]>).map((item) => {
                    // Puede ser un Espacio (tiene `tipo`) o una categoría estática
                    const isEspacio = "tipo" in item;
                    const catValue = isEspacio ? (item as Espacio).categoria : (item as typeof STATIC_CATS[0]).value;
                    const label = isEspacio ? (item as Espacio).nombre : (item as typeof STATIC_CATS[0]).label;
                    const items = porCategoria(catValue);
                    if (!items.length) return null;
                    return (
                      <CategoriaSection
                        key={isEspacio ? (item as Espacio).id : catValue}
                        label={label}
                        items={items}
                        onOpen={setModalItem}
                      />
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ── Modal ── */}
      {modalItem && <Modal item={modalItem} onClose={() => setModalItem(null)} />}
    </div>
  );
}

