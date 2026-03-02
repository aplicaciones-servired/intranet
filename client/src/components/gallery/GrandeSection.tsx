import { useState } from "react";
import type { Imagen } from "../../services/GetInfo";
import { isVideo, formatFecha } from "./utils";

interface Props {
  label: string;
  catLabel: string;
  items: Imagen[];
  onOpen: (i: Imagen) => void;
  initialItems?: number;
}

export function GrandeSection({ label, catLabel, items, onOpen, initialItems = 4 }: Props) {
  const [showAll, setShowAll] = useState(false);
  
  if (!items.length) return null;

  const displayItems = showAll ? items : items.slice(0, initialItems);
  const hasMore = items.length > initialItems;

  return (
    <section className="col-span-full flex flex-col gap-4">
      {/* Encabezado */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-linear-to-r from-transparent to-[#14b8a6]/20" />
        <h2 className="text-xl font-bold text-[#0f766e] px-2 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-[#14b8a6] rounded-full inline-block" />
          {label}
        </h2>
        <div className="h-px flex-1 bg-linear-to-l from-transparent to-[#14b8a6]/20" />
      </div>

      {/* Grid 2 columnas: tarjetas grandes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {displayItems.map((item) => {
          const video = isVideo(item.poster);
          return (
            <article
              key={item.id}
              onClick={() => onOpen(item)}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-250"
            >
              {/* Imagen grande */}
              <div className="relative overflow-hidden" style={{ height: "240px" }}>
                {video ? (
                  <>
                    <video src={item.poster} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted preload="metadata" />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-[#14b8a6] ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <img src={item.poster} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                )}
                {/* Pill categoría */}
                <span className="absolute top-3 left-3 text-xs font-bold uppercase tracking-wide bg-[#14b8a6] text-white px-2.5 py-0.5 rounded-full shadow">
                  {catLabel}
                </span>
              </div>

              {/* Texto */}
              <div className="p-4">
                <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-[#0f766e] transition-colors line-clamp-2">
                  {item.titulo}
                </h3>
                {item.descripcion && (
                  <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{item.descripcion}</p>
                )}
                {item.fecha_registro && (
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatFecha(item.fecha_registro)}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Botón Ver más / Ver menos */}
      {hasMore && (
        <div className="flex justify-center mt-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#14b8a6] text-[#0f766e] hover:text-white border-2 border-[#14b8a6] rounded-full font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {showAll ? (
              <>
                <span>Ver menos</span>
                <svg className="w-4 h-4 transform group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                <span>Ver más ({items.length - initialItems} restantes)</span>
                <svg className="w-4 h-4 transform group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
