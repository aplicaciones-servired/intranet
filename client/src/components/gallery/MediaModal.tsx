import { useEffect } from "react";
import type { Imagen } from "../../services/GetInfo";
import { isVideo, formatFecha } from "./utils";

interface Props {
  item: Imagen;
  catLabel: string;
  onClose: () => void;
}

export function MediaModal({ item, catLabel, onClose }: Props) {
  const video = isVideo(item.poster);

  // Cerrar con Escape
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
        className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media */}
        <div className="w-full bg-black flex items-center justify-center relative" style={{ maxHeight: "65vh" }}>
          {video ? (
            <video src={item.poster} controls autoPlay className="w-full" style={{ maxHeight: "65vh" }} />
          ) : (
            <img src={item.poster} alt={item.titulo} className="w-full object-contain" style={{ maxHeight: "65vh" }} />
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Info */}
        <div className="p-5">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
            {catLabel}
          </span>
          <h2 className="text-lg font-bold text-gray-900 mt-3">{item.titulo}</h2>
          {item.descripcion && (
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{item.descripcion}</p>
          )}
          {item.fecha_registro && (
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatFecha(item.fecha_registro)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
