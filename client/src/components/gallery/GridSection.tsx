import type { Imagen } from "../../services/GetInfo";
import { isVideo, formatFecha } from "./utils";

interface Props {
  label: string;
  items: Imagen[];
  onOpen: (i: Imagen) => void;
}

export function GridSection({ label, items, onOpen }: Props) {
  if (!items.length) return null;

  return (
    <section className="col-span-full">
      {/* Encabezado decorativo */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-linear-to-r from-transparent to-[#005a9c]/20" />
        <h2 className="text-xl font-bold text-[#005a9c] px-2 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-[#005a9c] rounded-full inline-block" />
          {label}
        </h2>
        <div className="h-px flex-1 bg-linear-to-l from-transparent to-[#005a9c]/20" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => {
          const video = isVideo(item.poster);
          return (
            <article
              key={item.id}
              onClick={() => onOpen(item)}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-250"
            >
              <div className="relative overflow-hidden" style={{ height: "140px" }}>
                {video ? (
                  <>
                    <video
                      src={item.poster}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                      muted preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/25 transition-colors">
                      <div className="bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-[#005a9c] ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <img
                    src={item.poster}
                    alt={item.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                    loading="lazy"
                  />
                )}
                {/* Overlay sutil en hover */}
                <div className="absolute inset-0 bg-[#005a9c]/0 group-hover:bg-[#005a9c]/10 transition-colors duration-250" />
              </div>

              <div className="p-3">
                <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-[#005a9c] transition-colors">
                  {item.titulo}
                </h4>
                {item.fecha_registro && (
                  <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
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
    </section>
  );
}
