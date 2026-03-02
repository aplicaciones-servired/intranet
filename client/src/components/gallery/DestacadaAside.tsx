import { useState } from "react";
import type { Imagen, Espacio, Categoria } from "../../services/GetInfo";
import { isVideo } from "./utils";

interface Props {
  espacio: Espacio;
  catMeta?: Categoria;
  items: Imagen[];
  onOpen: (i: Imagen) => void;
  initialItems?: number;
}

export function DestacadaAside({ espacio, catMeta, items, onOpen, initialItems = 5 }: Props) {
  const [showAll, setShowAll] = useState(false);
  
  if (!items.length) return null;

  const displayItems = showAll ? items : items.slice(0, initialItems);
  const hasMore = items.length > initialItems;

  return (
    <div className="flex flex-col gap-3">
      <aside className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ background: "linear-gradient(135deg, #005a9c 0%, #003d6b 100%)" }}
      >
        <div className="w-2 h-2 rounded-full bg-yellow-300 shrink-0" />
        <span className="text-white font-semibold text-sm">{espacio.nombre}</span>
        {catMeta && (
          <span className="text-white/50 text-xs ml-0.5">· {catMeta.label}</span>
        )}
        <span className="ml-auto bg-white/15 text-white/80 text-[10px] font-medium px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      {/* Items */}
      <div className="p-3 flex flex-col gap-2.5">
        {displayItems.map((item) => {
          const video = isVideo(item.poster);
          return (
            <div
              key={item.id}
              onClick={() => onOpen(item)}
              className="group flex gap-2.5 cursor-pointer hover:bg-blue-50/70 rounded-lg p-1.5 transition-colors duration-150"
            >
              {/* Thumbnail */}
              <div className="relative shrink-0 rounded-lg overflow-hidden bg-gray-100" style={{ width: "80px", height: "60px" }}>
                {video ? (
                  <>
                    <video src={item.poster} className="w-full h-full object-cover" muted preload="metadata" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <img
                    src={item.poster}
                    alt={item.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                )}
              </div>

              {/* Texto */}
              <p className="text-sm font-medium text-gray-700 leading-snug line-clamp-2 group-hover:text-[#005a9c] transition-colors pt-0.5 flex-1 min-w-0">
                {item.titulo}
              </p>
            </div>
          );
        })}
      </div>
    </aside>

    {/* Botón Ver más / Ver menos */}
    {hasMore && (
      <button
        onClick={() => setShowAll(!showAll)}
        className="group flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-[#005a9c] text-[#005a9c] hover:text-white border border-[#005a9c] rounded-lg font-medium text-xs transition-all duration-200 shadow-sm hover:shadow-md"
      >
        {showAll ? (
          <>
            <span>Ver menos</span>
            <svg className="w-3.5 h-3.5 transform group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
            </svg>
          </>
        ) : (
          <>
            <span>Ver más ({items.length - initialItems})</span>
            <svg className="w-3.5 h-3.5 transform group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>
    )}
  </div>
  );
}
