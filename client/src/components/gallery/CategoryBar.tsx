import { useRef, useState, useEffect, useCallback } from "react";

interface Cat {
  value: string;
  label: string;
}

interface CategoryBarProps {
  categorias: Cat[];
  active: string;
  configured: string;
  onSelect: (v: string) => void;
}

export function CategoryBar({ categorias, active, configured, onSelect }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, categorias]);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 200 : -200, behavior: "smooth" });
  };

  // Scroll activo al tab seleccionado cuando cambia
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const btn = el.querySelector<HTMLButtonElement>(`[data-value="${active}"]`);
    if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  return (
    <div className="bg-[#005a9c] shadow-md relative">
      {/* Gradiente + flecha izquierda */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center">
          <div className="w-16 h-full bg-linear-to-r from-[#005a9c] to-transparent pointer-events-none" />
          <button
            onClick={() => scrollBy("left")}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            aria-label="Desplazar izquierda"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Lista scrollable */}
      <div
        ref={scrollRef}
        className="max-w-7xl mx-auto px-4 flex overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categorias.map((cat) => (
          <button
            key={cat.value}
            data-value={cat.value}
            onClick={() => onSelect(cat.value)}
            className={`relative shrink-0 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all duration-150 border-b-[3px] ${
              active === cat.value
                ? "border-white text-white bg-white/15"
                : "border-transparent text-white/65 hover:text-white hover:bg-white/10"
            }`}
          >
            {cat.label}
            {configured === cat.value && (
              <span
                className="absolute top-2 right-1.5 w-1.5 h-1.5 rounded-full bg-yellow-300"
                title="Categoría del slider principal"
              />
            )}
          </button>
        ))}
      </div>

      {/* Gradiente + flecha derecha */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
          <div className="w-16 h-full bg-linear-to-l from-[#005a9c] to-transparent pointer-events-none" />
          <button
            onClick={() => scrollBy("right")}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            aria-label="Desplazar derecha"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
