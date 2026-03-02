import { useState } from "react";
import type { Imagen } from "../../services/GetInfo.service";
import { NewsCard } from "./NewsCard";

interface Props {
  label: string;
  catLabel: string;
  items: Imagen[];
  onOpen: (i: Imagen) => void;
  initialItems?: number;
}

export function ListSection({ label, catLabel, items, onOpen, initialItems = 5 }: Props) {
  const [showAll, setShowAll] = useState(false);
  
  if (!items.length) return null;

  const displayItems = showAll ? items : items.slice(0, initialItems);
  const hasMore = items.length > initialItems;

  return (
    <section className="flex flex-col gap-4">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 bg-[#005a9c] rounded-full shrink-0" />
        <h2 className="text-xl font-bold text-gray-800">{label}</h2>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {displayItems.map((item) => (
          <NewsCard
            key={item.id}
            item={item}
            catLabel={catLabel}
            onOpen={() => onOpen(item)}
          />
        ))}
      </div>

      {/* Botón Ver más / Ver menos */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#005a9c] text-[#005a9c] hover:text-white border-2 border-[#005a9c] rounded-full font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
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
