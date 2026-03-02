import { useState, useEffect } from "react";

interface Props {
  onSearch: (query: string) => void;
  totalResults?: number;
  placeholder?: string;
}

export function SearchBar({ onSearch, totalResults, placeholder = "Buscar publicaciones..." }: Props) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-4 mt-4">
      <div className={`relative group transition-all duration-300 ${isFocused ? 'transform scale-[1.01]' : ''}`}>
        {/* Icono de búsqueda */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <svg 
            className={`w-5 h-5 transition-all duration-200 ${
              isFocused ? 'text-[#005a9c] scale-110' : 'text-gray-400 group-hover:text-gray-500'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2.5} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>

        {/* Input de búsqueda */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full pl-14 pr-32 py-4 text-base bg-white border-2 rounded-2xl text-gray-800 placeholder-gray-400 transition-all duration-300 outline-none font-medium
            ${isFocused 
              ? 'border-[#005a9c] shadow-xl shadow-[#005a9c]/25 bg-blue-50/30' 
              : 'border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg'
            }`}
        />

        {/* Botón limpiar o contador de resultados */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2.5">
          {query && (
            <>
              {totalResults !== undefined && (
                <div className="flex items-center gap-1.5 bg-[#005a9c] text-white px-3 py-1.5 rounded-full shadow-md">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-bold">{totalResults}</span>
                </div>
              )}
              <button
                onClick={handleClear}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#dc2626] text-gray-500 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                aria-label="Limpiar búsqueda"
                title="Limpiar búsqueda"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Indicador de búsqueda activa */}
      {query && (
        <div className="mt-3.5 px-2 flex items-center gap-2.5 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
            <svg className="w-4 h-4 text-[#005a9c]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 font-medium">
              Resultados para: <span className="font-bold text-[#005a9c]">"{query}"</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
