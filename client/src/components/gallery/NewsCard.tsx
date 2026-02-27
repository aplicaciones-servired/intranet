import type { Imagen } from "../../services/GetInfo";
import { isVideo, formatFecha } from "./utils";

interface Props {
  item: Imagen;
  catLabel: string;
  onOpen: () => void;
}

export function NewsCard({ item, catLabel, onOpen }: Props) {
  const video = isVideo(item.poster);

  return (
    <article
      onClick={onOpen}
      className="group flex gap-3 bg-white rounded-xl overflow-hidden cursor-pointer border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 p-3"
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 w-24 h-18 rounded-lg overflow-hidden bg-gray-100" style={{ height: "72px", width: "96px" }}>
        {video ? (
          <>
            <video src={item.poster} className="w-full h-full object-cover" muted preload="metadata" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
              <div className="bg-white/90 rounded-full w-7 h-7 flex items-center justify-center shadow">
                <svg className="w-3 h-3 text-[#005a9c] ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
                </svg>
              </div>
            </div>
          </>
        ) : (
          <img
            src={item.poster}
            alt={item.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        )}
      </div>

      {/* Texto */}
      <div className="flex flex-col justify-center gap-1 min-w-0 flex-1">
        <span className="inline-block text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full w-fit">
          {catLabel}
        </span>
        <h4 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#005a9c] transition-colors">
          {item.titulo}
        </h4>
        {item.fecha_registro && (
          <p className="text-[11px] text-gray-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatFecha(item.fecha_registro)}
          </p>
        )}
      </div>
    </article>
  );
}
