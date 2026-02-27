import { useState, useEffect, useCallback, useRef } from "react";
import type { Imagen } from "../../services/GetInfo";
import { isVideo } from "./utils";

interface Props {
  items: Imagen[];
  onOpen: (i: Imagen) => void;
  /** Si se pasa, se muestra como título encima del slider */
  titulo?: string;
}

export function Slider({ items, onOpen, titulo }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => setCurrent((c) => (c + 1) % items.length), [items.length]);
  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 5000);
  }, [next]);

  useEffect(() => {
    if (items.length <= 1 || paused) return;
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, items.length, paused, startTimer]);

  if (!items.length) return null;

  const item = items[current];
  const video = isVideo(item.poster);

  return (
    <div className="w-full">
      {titulo && (
        <h2 className="text-2xl font-bold text-[#005a9c] text-center mb-4 px-4">{titulo}</h2>
      )}
      <div
        className="relative w-full overflow-hidden bg-gray-900 group"
        style={{ height: "380px" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Media con fade entre slides */}
        <div className="absolute inset-0 cursor-pointer" onClick={() => onOpen(item)}>
          {video ? (
            <video
              key={item.id}
              src={item.poster}
              className="w-full h-full object-cover"
              muted autoPlay loop playsInline
            />
          ) : (
            <img
              key={item.id}
              src={item.poster}
              alt={item.titulo}
              className="w-full h-full object-cover transition-opacity duration-700"
            />
          )}
          {/* Gradiente */}
          <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />
        </div>

        {/* Badge paused */}
        {paused && items.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
            ⏸ pausado
          </div>
        )}

        {/* Texto */}
        <div className="absolute bottom-14 left-8 right-16 text-white pointer-events-none">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-widest bg-white/20 backdrop-blur-sm text-white/90 px-2.5 py-0.5 rounded-full border border-white/20">
              {item.categoria}
            </span>
            <span className="text-white/50 text-xs">{current + 1} / {items.length}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold drop-shadow-lg leading-tight line-clamp-2">
            {item.titulo}
          </h2>
          {item.descripcion && (
            <p className="text-sm text-white/75 mt-1.5 line-clamp-1 drop-shadow">{item.descripcion}</p>
          )}
        </div>

        {/* Flecha izquierda */}
        <button
          onClick={(e) => { e.stopPropagation(); prev(); startTimer(); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 backdrop-blur-sm text-white rounded-full w-9 h-9 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 z-10 shadow"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Flecha derecha */}
        <button
          onClick={(e) => { e.stopPropagation(); next(); startTimer(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#005a9c]/80 hover:bg-[#005a9c] backdrop-blur-sm text-white rounded-full w-9 h-9 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 z-10 shadow"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Barra de progreso + dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); startTimer(); }}
              className={`rounded-full transition-all duration-300 ${
                i === current ? "bg-white w-5 h-2" : "bg-white/40 hover:bg-white/70 w-2 h-2"
              }`}
            />
          ))}
        </div>

        {/* Icono play si es video */}
        {video && (
          <div className="absolute bottom-14 right-8 bg-white/20 backdrop-blur-sm rounded-full p-2 border border-white/20">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
