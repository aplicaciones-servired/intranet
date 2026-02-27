import type { Imagen } from "../../services/GetInfo";
import { isVideo, formatFecha } from "./utils";

interface Props {
  label: string;
  catLabel: string;
  items: Imagen[];
  onOpen: (i: Imagen) => void;
}

export function NoticiasSection({ label, catLabel, items, onOpen }: Props) {
  if (!items.length) return null;

  const [hero, ...resto] = items;
  const heroVideo = isVideo(hero.poster);

  return (
    <section className="col-span-full">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 bg-[#ef4444] rounded-full shrink-0" />
        <h2 className="text-xl font-bold text-gray-800">{label}</h2>
        <span className="ml-auto text-xs font-semibold text-[#ef4444] bg-red-50 border border-red-200 px-2 py-0.5 rounded-full shrink-0">
          {items.length} publicaciones
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Hero principal (3/5 de ancho) */}
        <article
          onClick={() => onOpen(hero)}
          className="group lg:col-span-3 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-250"
        >
          <div className="relative overflow-hidden" style={{ height: "260px" }}>
            {heroVideo ? (
              <>
                <video src={hero.poster} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted preload="metadata" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-[#ef4444] ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              <>
                <img src={hero.poster} alt={hero.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                {/* Overlay gradiente inferior */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
              </>
            )}
            {/* Pill de categoría */}
            <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide bg-[#ef4444] text-white px-2.5 py-0.5 rounded-full shadow">
              {catLabel}
            </span>
          </div>

          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-3 group-hover:text-[#dc2626] transition-colors">
              {hero.titulo}
            </h3>
            {hero.descripcion && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{hero.descripcion}</p>
            )}
            {hero.fecha_registro && (
              <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatFecha(hero.fecha_registro)}
              </p>
            )}
          </div>
        </article>

        {/* Lista de noticias secundarias (2/5) */}
        {resto.length > 0 && (
          <div className="lg:col-span-2 flex flex-col gap-3">
            {resto.map((item) => {
              const video = isVideo(item.poster);
              return (
                <article
                  key={item.id}
                  onClick={() => onOpen(item)}
                  className="group flex gap-3 bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 p-2.5"
                >
                  {/* Thumbnail */}
                  <div className="relative shrink-0 w-20 h-16 rounded-lg overflow-hidden bg-gray-100">
                    {video ? (
                      <>
                        <video src={item.poster} className="w-full h-full object-cover" muted preload="metadata" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <img src={item.poster} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    )}
                  </div>

                  {/* Texto */}
                  <div className="flex flex-col justify-center min-w-0">
                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-[#dc2626] transition-colors">
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
        )}
      </div>
    </section>
  );
}
