import { useState, useEffect } from "react";
import {
  getImagenes, getConfig, getEspacios, getCategorias,
  type Imagen, type Espacio, type Categoria,
} from "../services/GetInfo";
import { categories } from "../utils/const";
import { CategoryBar } from "./gallery/CategoryBar";
import { Slider } from "./gallery/Slider";
import { GridSection } from "./gallery/GridSection";
import { ListSection } from "./gallery/ListSection";
import { DestacadaAside } from "./gallery/DestacadaAside";
import { MediaModal } from "./gallery/MediaModal";
import { CarruselSection } from "./gallery/CarruselSection";
import { GrandeSection } from "./gallery/GrandeSection";
import { NoticiasSection } from "./gallery/NoticiasSection";

const STATIC_CATS = categories.items;

/* ── Empty state ── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-gray-400">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-lg font-semibold text-gray-500">No hay contenido publicado aún</p>
      <p className="text-sm mt-1">Las imágenes aparecerán aquí cuando sean subidas desde el panel admin.</p>
    </div>
  );
}

/* ── Loading skeleton ── */
function LoadingSlider() {
  return (
    <div className="w-full bg-gray-900 animate-pulse flex items-end px-8 pb-10" style={{ height: "380px" }}>
      <div className="space-y-3 w-full max-w-lg">
        <div className="h-3 bg-white/10 rounded-full w-24" />
        <div className="h-7 bg-white/15 rounded-lg w-72" />
        <div className="h-3 bg-white/10 rounded-full w-48" />
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
      getConfig("slider_categoria"),
    ])
      .then(([imgs, esp, cats, catConfig]) => {
        setImagenes(imgs);

        const activeCats = cats.filter((c) => c.activa);
        if (activeCats.length > 0) setDinamicCats(activeCats);

        const sorted = [...esp].sort((a, b) => a.orden - b.orden);
        const visibles = sorted.filter((e) => e.visible);
        setEspacios(visibles);

        const sliderSpace = visibles.find((e) => e.tipo === "slider");
        const cat = sliderSpace?.categoria ?? catConfig ?? "comunicaciones";
        setSliderCat(cat);
        setConfiguredSliderCat(cat);
      })
      .catch(() => setError("No se pudo cargar el contenido."))
      .finally(() => setLoading(false));
  }, []);

  const CATEGORIAS = dinamicCats.length > 0 ? dinamicCats : STATIC_CATS;

  const porCategoria = (cat: string) => imagenes.filter((i) => i.categoria === cat);

  // Slider principal: primer espacio tipo slider, con su categoría activa (o lo que el usuario clica)
  const sliderItems = porCategoria(sliderCat).length
    ? porCategoria(sliderCat)
    : imagenes;

  // Sidebar destacada
  const destacadaSpaces = espacios.filter((e) => e.tipo === "destacada");

  // Sliders secundarios (del segundo en adelante)
  const sliderSpaces = espacios.filter((e) => e.tipo === "slider");
  const extraSliders = sliderSpaces.slice(1);

  // Secciones de contenido principal: todo lo que no sea slider ni destacada
  const hayEspaciosContenido = espacios.some((e) => e.tipo !== "slider" && e.tipo !== "destacada");
  const seccionesContenido = hayEspaciosContenido
    ? espacios.filter((e) => e.tipo !== "slider" && e.tipo !== "destacada")
    : (CATEGORIAS as { value: string; label: string }[]).filter((c) => porCategoria(c.value).length > 0);

  return (
    <div className="min-h-screen bg-[#f2f4f7]">

      {/* Barra de categorías */}
      <CategoryBar
        categorias={CATEGORIAS}
        active={sliderCat}
        configured={configuredSliderCat}
        onSelect={setSliderCat}
      />

      {/* Slider principal */}
      {loading ? (
        <LoadingSlider />
      ) : !error ? (
        <Slider items={sliderItems} onOpen={setModalItem} />
      ) : (
        <div className="max-w-lg mx-auto mt-10 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Secciones */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto px-4 py-10">
          {imagenes.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">

              {/* Sidebar: espacios destacados */}
              {destacadaSpaces.length > 0 && (
                <div className="flex flex-col gap-5 lg:w-72 xl:w-80 shrink-0">
                  {destacadaSpaces.map((esp) => {
                    const items = porCategoria(esp.categoria);
                    const catMeta = CATEGORIAS.find((c) => c.value === esp.categoria);
                    return (
                      <DestacadaAside
                        key={esp.id}
                        espacio={esp}
                        catMeta={catMeta as Categoria | undefined}
                        items={items}
                        onOpen={setModalItem}
                      />
                    );
                  })}
                </div>
              )}

              {/* Área principal */}
              <div className="flex-1 min-w-0 flex flex-col gap-10">

                {/* Grid / Lista */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {(seccionesContenido as Array<Espacio | { value: string; label: string }>).map((item) => {
                    const isEspacio = "tipo" in item;
                    const catValue = isEspacio ? (item as Espacio).categoria : (item as { value: string }).value;
                    const label = isEspacio ? (item as Espacio).nombre : (item as { label: string }).label;
                    const tipo = isEspacio ? (item as Espacio).tipo : "lista";
                    const catMeta = CATEGORIAS.find((c) => c.value === catValue);
                    const items = porCategoria(catValue);
                    if (!items.length) return null;

                    if (tipo === "grid") return (
                      <GridSection
                        key={isEspacio ? (item as Espacio).id : catValue}
                        label={label}
                        items={items}
                        onOpen={setModalItem}
                      />
                    );
                    if (tipo === "carrusel") return (
                      <CarruselSection
                        key={isEspacio ? (item as Espacio).id : catValue}
                        label={label}
                        items={items}
                        onOpen={setModalItem}
                      />
                    );
                    if (tipo === "grande") return (
                      <GrandeSection
                        key={isEspacio ? (item as Espacio).id : catValue}
                        label={label}
                        catLabel={catMeta?.label ?? catValue}
                        items={items}
                        onOpen={setModalItem}
                      />
                    );
                    if (tipo === "noticias") return (
                      <NoticiasSection
                        key={isEspacio ? (item as Espacio).id : catValue}
                        label={label}
                        catLabel={catMeta?.label ?? catValue}
                        items={items}
                        onOpen={setModalItem}
                      />
                    );
                    // lista (default)
                    return (
                      <ListSection
                        key={isEspacio ? (item as Espacio).id : catValue}
                        label={label}
                        catLabel={catMeta?.label ?? catValue}
                        items={items}
                        onOpen={setModalItem}
                      />
                    );
                  })}
                </div>

                {/* Sliders secundarios */}
                {extraSliders.map((esp) => {
                  const items = porCategoria(esp.categoria);
                  if (!items.length) return null;
                  return (
                    <Slider
                      key={esp.id}
                      titulo={esp.nombre}
                      items={items}
                      onOpen={setModalItem}
                    />
                  );
                })}
              </div>

            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalItem && (
        <MediaModal
          item={modalItem}
          catLabel={CATEGORIAS.find((c) => c.value === modalItem.categoria)?.label ?? modalItem.categoria}
          onClose={() => setModalItem(null)}
        />
      )}
    </div>
  );
}
