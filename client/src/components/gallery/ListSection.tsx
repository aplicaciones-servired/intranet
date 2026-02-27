import type { Imagen } from "../../services/GetInfo";
import { NewsCard } from "./NewsCard";

interface Props {
  label: string;
  catLabel: string;
  items: Imagen[];
  onOpen: (i: Imagen) => void;
}

export function ListSection({ label, catLabel, items, onOpen }: Props) {
  if (!items.length) return null;

  return (
    <section>
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 bg-[#005a9c] rounded-full shrink-0" />
        <h2 className="text-xl font-bold text-gray-800">{label}</h2>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {items.map((item) => (
          <NewsCard
            key={item.id}
            item={item}
            catLabel={catLabel}
            onOpen={() => onOpen(item)}
          />
        ))}
      </div>
    </section>
  );
}
