import { useRef } from "react";
import type { Imagen } from "../../services/GetInfo";
import { isVideo, formatFecha } from "./utils";

interface Props {
  label: string;
  items: Imagen[];
  onOpen: (i: Imagen) => void;
}

export function CarruselSection({ label, items, onOpen }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (!items.length) return null;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "right" ? 260 : -260, behavior: "smooth" });
  };

  return (
    <section className="col-span-full">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 bg-[#06b6d4] rounded-full shrink-0" />
        <h2 className="text-xl font-bold text-gray-800">{label}</h2>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
          {items.length} items
        </span>
        {/* Flechas */}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => scroll("left")}
            className="w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-[#06b6d4] hover:text-white hover:border-[#06b6d4] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-[#06b6d4] hover:text-white hover:border-[#06b6d4] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tira horizontal */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => {
          const video = isVideo(item.poster);
          return (
            <article
              key={item.id}
              onClick={() => onOpen(item)}
              className="group shrink-0 w-52 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="relative overflow-hidden" style={{ height: "120px" }}>
                {video ? (
                  <>
                    <video src={item.poster} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" muted preload="metadata" />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow">
                        <svg className="w-3.5 h-3.5 text-[#06b6d4] ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <img src={item.poster} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" loading="lazy" />
                )}
              </div>
              <div className="p-2.5">
                <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-[#06b6d4] transition-colors">
                  {item.titulo}
                </h4>
                {item.fecha_registro && (
                  <p className="text-[10px] text-gray-400 mt-1">{formatFecha(item.fecha_registro)}</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
